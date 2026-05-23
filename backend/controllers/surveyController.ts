import { Request, Response } from "express";
import mongoose from "mongoose";
import Survey from "../models/Survey.js";
import AuditLog from "../models/AuditLog.js";

// ── Helpers ──────────────────────────────────────────────────────────

/** Get typed properties from the extended request. */
const reqUser = (req: Request): { _id?: string } | undefined =>
  (req as any).user as { _id?: string } | undefined;

const reqUserId = (req: Request): string | undefined => {
  const id = (req as any).user?._id;
  return id ? String(id) : undefined;
};

const reqTenantIds = (req: Request): string[] =>
  ((req as any).tenantIds as string[]) ?? [];

const reqActiveTenantId = (req: Request): string | null =>
  (req as any).activeTenantId as string | null;

/**
 * Build a data-isolation filter for listing surveys.
 *
 * Priority order (first match wins):
 *   1. User HAS tenant memberships → scope by tenantId only
 *   2. User is authenticated but has NO tenant → scope by createdBy (their own surveys)
 *   3. Not authenticated → no surveys visible via this endpoint (public users use public endpoints)
 */
const buildSurveyFilter = (req: Request): Record<string, unknown> | null => {
  const tids = reqTenantIds(req);
  const userId = reqUserId(req);

  if (tids.length > 0) {
    // User belongs to one or more tenants → tenant-scoped
    return { tenantId: { $in: tids } };
  }

  if (userId) {
    // User is authenticated but has NO tenant → own surveys only
    return { createdBy: new mongoose.Types.ObjectId(userId) };
  }

  // Not authenticated → return null (caller handles empty result)
  return null;
};

/**
 * Verify the authenticated user has access to a survey for management operations.
 * Returns the survey doc, or sends an error response and returns null.
 *
 * Rules:
 *   - Survey has tenantId AND user has tenants → must be a member of that tenant
 *   - Survey has tenantId but user has NO tenants → FORBIDDEN
 *   - Survey has no tenantId → must be the creator (createdBy)
 *   - Survey has no tenantId AND no createdBy → orphan, FORBIDDEN
 */
const verifySurveyAccess = async (
  req: Request,
  res: Response,
  surveyId: string,
) => {
  const survey = await Survey.findById(surveyId);
  if (!survey) {
    res.status(404).json({ message: "Survey not found" });
    return null;
  }

  const tids = reqTenantIds(req);
  const userId = reqUserId(req);

  if (survey.tenantId) {
    // Survey belongs to a tenant
    if (tids.length === 0) {
      // User has no tenant → cannot access tenant-owned surveys
      res.status(403).json({
        message: "Forbidden: you do not have access to this survey",
      });
      return null;
    }
    if (!tids.includes(String(survey.tenantId))) {
      // User belongs to a different tenant
      res.status(403).json({
        message: "Forbidden: you do not have access to this survey",
      });
      return null;
    }
    // User belongs to the survey's tenant → allowed
    return survey;
  }

  // Survey has no tenantId (personal/legacy survey)
  if (!survey.createdBy) {
    // Orphan survey with no owner → cannot be managed
    res
      .status(403)
      .json({ message: "Forbidden: this survey cannot be accessed" });
    return null;
  }

  if (userId && String(survey.createdBy) === userId) {
    // User is the creator → allowed
    return survey;
  }

  // Not the creator
  res
    .status(403)
    .json({ message: "Forbidden: you do not have access to this survey" });
  return null;
};

// Records an audit trail entry for survey actions
const logAudit = (req: Request, action: string, entityId: any) => {
  const user = reqUser(req);
  if (!user) return;
  AuditLog.create({
    user_id: user._id,
    action,
    entity: "Survey",
    entity_id: entityId,
  } as any).catch(() => {});
};

// ── Controllers ──────────────────────────────────────────────────────

// POST /api/surveys — Creates a new survey scoped to the user's active tenant
export const createSurvey = async (req: Request, res: Response) => {
  try {
    const {
      surveyTitle,
      description,
      websiteUrl,
      logo,
      themeColor,
      primaryColor,
      customizeBranding,
      isAnonymous,
      pages,
      status,
    } = req.body;

    if (!surveyTitle) {
      res.status(400).json({ message: "Survey title is required" });
      return;
    }

    const user = reqUser(req);
    const activeTenantId = reqActiveTenantId(req);

    // Check role-based access: viewers and billing managers cannot create surveys
    const memberships: any[] = (req as any).memberships ?? [];
    const activeMembership = activeTenantId
      ? memberships.find((m: any) => String(m.tenantId) === activeTenantId)
      : null;
    const role = activeMembership?.role ?? user?.role ?? "admin";
    const createAllowed = ["super_admin", "admin", "creator"];
    if (!createAllowed.includes(role)) {
      res.status(403).json({
        message: "Forbidden: your role does not allow creating surveys",
      });
      return;
    }

    const survey = new Survey({
      surveyTitle,
      description,
      websiteUrl,
      logo,
      themeColor,
      primaryColor,
      customizeBranding,
      isAnonymous,
      pages,
      status,
      // Auto-assign tenantId from user's active tenant membership
      tenantId: activeTenantId ?? null,
      createdBy: user?._id ?? null,
    });

    await survey.save();
    logAudit(req, "create", survey._id);
    res.status(201).json({ message: "Survey created", survey });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// GET /api/surveys — Returns surveys scoped to the user
export const getSurveys = async (req: Request, res: Response) => {
  try {
    const filter = buildSurveyFilter(req);
    // Unauthenticated requests get empty results via this management endpoint
    if (!filter) {
      res.json([]);
      return;
    }

    const { status } = req.query;
    if (status) filter.status = status;

    const surveys = await Survey.find(filter).sort({ createdAt: -1 });
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// GET /api/surveys/:id — Returns a single survey
// NOTE: This endpoint is intentionally left public (no `protect` middleware)
//       so respondents can load surveys via TakeSurvey page.
//       When the user IS authenticated (via loadTenant), we verify access.
//       When NOT authenticated, any survey is readable (public survey-taking).
export const getSurveyById = async (req: Request, res: Response) => {
  try {
    const user = reqUser(req);

    if (user) {
      // Authenticated user → enforce isolation
      const survey = await verifySurveyAccess(req, res, req.params.id);
      if (!survey) return;
      res.json(survey);
    } else {
      // Unauthenticated (public respondent) → anyone can read any survey
      const survey = await Survey.findById(req.params.id);
      if (!survey) {
        res.status(404).json({ message: "Survey not found" });
        return;
      }
      res.json(survey);
    }
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

/**
 * Check if the authenticated user's role allows editing/publishing surveys.
 * Allowed: super_admin, admin, creator.  Blocked: viewer, billing_manager.
 * Returns true if allowed, or sends a 403 response and returns false.
 */
const checkEditPermission = (req: Request, res: Response): boolean => {
  const user = reqUser(req);
  const memberships: any[] = (req as any).memberships ?? [];
  const activeTenantId = reqActiveTenantId(req);
  const activeMembership = activeTenantId
    ? memberships.find((m: any) => String(m.tenantId) === activeTenantId)
    : null;
  const role = activeMembership?.role ?? user?.role ?? "admin";
  const editAllowed = ["super_admin", "admin", "creator"];
  if (!editAllowed.includes(role)) {
    res
      .status(403)
      .json({
        message: "Forbidden: your role does not allow modifying surveys",
      });
    return false;
  }
  return true;
};

// PUT /api/surveys/:id — Updates a survey (with tenant/ownership + role check)
export const updateSurvey = async (req: Request, res: Response) => {
  try {
    const survey = await verifySurveyAccess(req, res, req.params.id);
    if (!survey) return;
    if (!checkEditPermission(req, res)) return;

    const updated = await Survey.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    logAudit(req, "update", survey._id);
    res.json({ message: "Survey updated", survey: updated });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// PATCH /api/surveys/:id/status — Updates survey status (with tenant check)
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["Draft", "Running", "Finished"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const survey = await verifySurveyAccess(req, res, req.params.id);
    if (!survey) return;
    if (!checkEditPermission(req, res)) return;

    const updated = await Survey.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    logAudit(req, `status_change_${status.toLowerCase()}`, updated!._id);
    res.json({ message: "Status updated", survey: updated });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// DELETE /api/surveys/:id — Permanently removes a survey (with tenant check)
export const deleteSurvey = async (req: Request, res: Response) => {
  try {
    const survey = await verifySurveyAccess(req, res, req.params.id);
    if (!survey) return;
    if (!checkEditPermission(req, res)) return;

    await Survey.findByIdAndDelete(req.params.id);
    logAudit(req, "delete", req.params.id);
    res.json({ message: "Survey deleted" });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};
