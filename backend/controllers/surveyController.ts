import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Survey from "../models/Survey.js";
import AuditLog from "../models/AuditLog.js";
import {
  notifySurveyPublished,
  notifySurveyStopped,
} from "../services/emailNotificationService.js";
import User from "../models/User.js";
import { toast } from "sonner";
import Tenant from "../models/Tenant.js";
import { Payment } from "../models/Payment.js";
import { createAppNotification } from "../services/notificationService.js";

// ── Helpers ──────────────────────────────────────────────────────────

/** Get typed properties from the extended request. */
interface ReqUser {
  _id?: string;
  role?: string;
}
const reqUser = (req: Request): ReqUser | undefined =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req as any).user as ReqUser | undefined;

const reqUserId = (req: Request): string | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const id = (req as any).user?._id;
  return id ? String(id) : undefined;
};

const reqTenantIds = (req: Request): string[] =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((req as any).tenantIds as string[]) ?? [];

const reqActiveTenantId = (req: Request): string | null =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req as any).activeTenantId as string | null;

/**
 * Build a data-isolation filter for listing surveys.
 *
 * Priority order (first match wins):
 *   1. User has an ACTIVE tenant (x-tenant-id header matched) → scope by that tenant only
 *   2. System context (no active tenant / "My Account") → own surveys only (no tenantId)
 *   3. Not authenticated → no surveys visible
 */
const buildSurveyFilter = (req: Request): Record<string, unknown> | null => {
  const activeTenantId = reqActiveTenantId(req);
  const userId = reqUserId(req);

  if (activeTenantId) {
    // User explicitly switched to a tenant → show only that tenant's surveys
    return { tenantId: activeTenantId };
  }

  if (userId) {
    // System context ("My Account") → show only surveys created by this user
    // that are not assigned to any tenant
    return {
      createdBy: new mongoose.Types.ObjectId(userId),
      $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
    };
  }

  // Not authenticated → return null (caller handles empty result)
  return null;
};

/**
 * Verify the authenticated user has access to a survey for management operations.
 * Returns the survey doc, or sends an error response and returns null.
 *
 * Rules:
 *   - Creator of the survey always has access (regardless of tenant context)
 *   - Survey has a valid tenantId AND user is a member of that tenant → allowed
 *   - Survey has an unrecognised/legacy tenantId (e.g. "default") → fall back to createdBy
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

  // Creator always has access to their own survey
  if (userId && survey.createdBy && String(survey.createdBy) === userId) {
    return survey;
  }

  if (survey.tenantId) {
    // Only treat as tenant-scoped if the tenantId is actually in the user's tenant list
    // (guards against legacy/corrupted values like "default")
    if (tids.includes(String(survey.tenantId))) {
      return survey;
    }
    // tenantId not recognized — deny unless already passed the creator check above
    res.status(403).json({
      message: "Forbidden: you do not have access to this survey",
    });
    return null;
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

// ---plan-based active survey limits pyahere----

// "Active" = counts toward the limit (Running or Scheduled)
const ACTIVE_SURVEY_STATUSES = ["Running", "Scheduled"];

// null = unlimited
const PLAN_SURVEY_LIMITS: Record<string, number> = {
  free: 2,
  startup: 3,
  pro: 100,
};

/** Resolve the tenant's current active plan, defaulting to "free" if none/expired. */
const getTenantPlanName = async (tenantId: string): Promise<string> => {
  const payment = await Payment.findOne({ tenantId, status: "success" })
    .sort({ createdAt: -1 })
    .lean();

  if (!payment) return "free";
  if (payment.expiresAt && new Date(payment.expiresAt) < new Date())
    return "free";

  return payment.planName.toLowerCase();
};

/**
 returns null if the survey can transition to `newStatus`, or an error
 message string if doing so would exceed the tenant's plan limit.

 only checks when newStatus is "Running"/"Scheduled" AND the survey's
 previous status was NOT already counted as active - ex: only on the
 transition INTO the active set, not between Running <-> Scheduled.
 */
const checkActiveSurveyLimit = async (
  req: Request,
  tenantId: string | null | undefined,
  newStatus: string,
  oldStatus: string | null | undefined,
): Promise<string | null> => {
  if (!ACTIVE_SURVEY_STATUSES.includes(newStatus)) return null;
  if (oldStatus && ACTIVE_SURVEY_STATUSES.includes(oldStatus)) return null;

  const planName = tenantId ? await getTenantPlanName(tenantId) : "free";
  const limit = PLAN_SURVEY_LIMITS[planName] ?? PLAN_SURVEY_LIMITS.free;

  // build the same filter used to scope surveys for this context:
  // tenant-scoped surveys for orgs, personal surveys (no tenant) for "My Account"
  const countFilter = tenantId
    ? { tenantId: new mongoose.Types.ObjectId(tenantId), status: { $in: ACTIVE_SURVEY_STATUSES } }
    : {
        createdBy: (req as any).user?._id,
        $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
        status: { $in: ACTIVE_SURVEY_STATUSES },
      };

  const activeCount = await Survey.countDocuments(countFilter as any);

  if (activeCount >= limit) {
    return `${tenantId ? `Your organization is on the ${planName.charAt(0).toUpperCase() + planName.slice(1)} plan` : "Your personal account is on the Free plan"}, which allows up to ${limit} active (published or scheduled) survey${limit === 1 ? "" : "s"} at a time. Finish or unpublish an existing survey to publish more.`;
  }

  return null;
};

// Records an audit trail entry for survey actions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logAudit = (
  req: Request,
  action: string,
  entityId: any,
  description: string,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user;
  if (!user) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenantId =
    (req as any).activeTenantId ?? (req as any).tenantIds?.[0] ?? null;
  AuditLog.create({
    tenant_id: tenantId,
    user_id: user._id,
    action,
    entity: "Survey",
    entity_id: entityId,
    description,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      coverImage,
      themeColor,
      primaryColor,
      backgroundColor,
      customizeBranding,
      isAnonymous,
      pages,
      status,
      isPasswordProtected,
      password,
    } = req.body;

    if (!surveyTitle) {
      res.status(400).json({ message: "Survey title is required" });
      return;
    }

    const user = reqUser(req);
    const activeTenantId = reqActiveTenantId(req);

    // Check role-based access: viewers and billing managers cannot create surveys
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memberships: any[] = (req as any).memberships ?? [];
    const activeMembership = activeTenantId
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        memberships.find((m: any) => String(m.tenantId) === activeTenantId)
      : null;
    const role = activeMembership?.role ?? user?.role ?? "admin";
    const createAllowed = ["super_admin", "admin", "creator"];
    if (!createAllowed.includes(role)) {
      res.status(403).json({
        message: "Forbidden: your role does not allow creating surveys",
      });
      return;
    }

    // Hash password if password protection is enabled
    let hashedPassword = "";
    if (isPasswordProtected && password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

        // ---enforce plan based active survey limits payhere---
    const limitError = await checkActiveSurveyLimit(req, activeTenantId, status, null);
    if (limitError) {
      res.status(403).json({ message: limitError });
      return;
    }

    const survey = new Survey({
      surveyTitle,
      description,
      websiteUrl,
      logo,
      coverImage,
      themeColor,
      primaryColor,
      backgroundColor,
      customizeBranding,
      isAnonymous,
      pages,
      status,
      isPasswordProtected: isPasswordProtected || false,
      password: hashedPassword,
      // Auto-assign tenantId from user's active tenant membership
      tenantId: activeTenantId ?? null,
      createdBy: user?._id ?? null,
    });

    await survey.save();
    logAudit(req, "create", survey._id, `Survey "${surveyTitle}" Created`);

    try {
      const userId = reqUserId(req);
      if (!userId) return; // or handle error

      const tenant = survey.tenantId
        ? await Tenant.findById(survey.tenantId)
        : null;

      const orgName = tenant?.name ?? "System";

      await createAppNotification({
        tenant_id: survey.tenantId ? String(survey.tenantId) : "", // or null if schema allows
        user_id: userId!,
        type: "SURVEY_CREATED",
        channel: "in_app",
        message: `Survey "${survey.surveyTitle}" has been created in ${orgName}`,
        surveyId: survey._id.toString(),
        surveyName: survey.surveyTitle,
      });
    } catch (err) {
      console.error("Notification failed but survey will still publish:", err);
    }

    console.log(status);
    res.status(201).json({ message: "Survey created", survey });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// GET /api/surveys — Returns surveys scoped to the user
export const getSurveys = async (req: Request, res: Response) => {
  try {
    const filter = buildSurveyFilter(req);
    // Unauthenticated requests get empty results via this management endpoint.
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

// GET /api/surveys/:id — Returns a single survey (public respondents bypass auth checks).
export const getSurveyById = async (req: Request, res: Response) => {
  try {
    const user = reqUser(req);

    if (user) {
      // Authenticated user → enforce isolation.
      const survey = await verifySurveyAccess(req, res, req.params.id);
      if (!survey) return;
      res.json(survey);
    } else {
      // Unauthenticated (public respondent) → anyone can read any survey.
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
 *
 * Role resolution order:
 *   1. Active tenant membership (from x-tenant-id header)
 *   2. Any membership matching the survey's tenant (fallback when header absent)
 *   3. System-level user.role
 */
const checkEditPermission = (
  req: Request,
  res: Response,
  surveyTenantId?: string,
): boolean => {
  const user = reqUser(req);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memberships: any[] = (req as any).memberships ?? [];
  const activeTenantId = reqActiveTenantId(req);

  let role: string;
  if (activeTenantId) {
    // Prefer the membership for the explicitly active tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = memberships.find(
      (m: any) => String(m.tenantId) === activeTenantId,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    role = m?.role ?? (user as any)?.role ?? "admin";
  } else if (surveyTenantId) {
    // No active tenant header — fall back to the membership of the survey's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = memberships.find(
      (m: any) => String(m.tenantId) === surveyTenantId,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    role = m?.role ?? (user as any)?.role ?? "admin";
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    role = (user as any)?.role ?? "admin";
  }

  const editAllowed = ["super_admin", "admin", "creator"];
  if (!editAllowed.includes(role)) {
    res.status(403).json({
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
    if (
      !checkEditPermission(
        req,
        res,
        survey.tenantId ? String(survey.tenantId) : undefined,
      )
    )
      return;

    const oldTitle = survey.surveyTitle;

    // Never allow overwriting tenantId or createdBy via the request body
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      tenantId: _tid,
      createdBy: _cb,
      password,
      isPasswordProtected,
      ...safeBody
    } = req.body;

    // Handle password hashing if password protection is being updated
    if (isPasswordProtected !== undefined) {
      safeBody.isPasswordProtected = isPasswordProtected;

      if (isPasswordProtected && password) {
        // Hash the new password
        const saltRounds = 10;
        safeBody.password = await bcrypt.hash(password, saltRounds);
      } else if (!isPasswordProtected) {
        // Clear the password if protection is disabled
        safeBody.password = "";
      }
    }

    // ---enforce plan-based active survey limits payhere---
    if (safeBody.status) {
      const limitError = await checkActiveSurveyLimit(
        req,
        survey.tenantId ? String(survey.tenantId) : null,
        safeBody.status,
        survey.status,
      );
      if (limitError) {
        res.status(403).json({ message: limitError });
        return;
      }
    }

    const updated = await Survey.findByIdAndUpdate(req.params.id, safeBody, {
      new: true,
      runValidators: true,
    });

    // AUDIT: title changed
    if (safeBody.surveyTitle && safeBody.surveyTitle !== oldTitle) {
      await AuditLog.create({
        tenant_id: survey.tenantId ?? null,
        user_id: reqUserId(req),
        action: "update",
        entity: "Survey",
        entity_id: survey._id,
        description: `Survey title changed from "${oldTitle}" to "${safeBody.surveyTitle}"`,
      });
    }

    await AuditLog.create({
      tenant_id: survey.tenantId ?? null,
      user_id: reqUserId(req),
      action: "update",
      entity: "Survey",
      entity_id: survey._id,
      description: `Survey was Updated`,
    });

    if (updated?.status === "Draft") {
      try {
        const tenant = updated.tenantId
          ? await Tenant.findById(updated.tenantId)
          : null;

        const orgName = tenant?.name ?? "System";
        const userId = reqUserId(req);

        if (userId) {
          if (safeBody.surveyTitle && safeBody.surveyTitle !== oldTitle) {
            await createAppNotification({
              tenant_id: updated.tenantId ? String(updated.tenantId) : "",
              user_id: userId,
              type: "SURVEY_UPDATE", // or SURVEY_UPDATED if that already exists
              channel: "in_app",
              message: `Survey title has been changed from "${oldTitle}" to "${updated.surveyTitle}" in ${orgName}`,
              surveyId: updated._id.toString(),
              surveyName: updated.surveyTitle,
            });
          }
          await createAppNotification({
            tenant_id: updated.tenantId ? String(updated.tenantId) : "",
            user_id: userId,
            type: "SURVEY_UPDATE", // or SURVEY_UPDATED if that already exists
            channel: "in_app",
            message: `Survey "${updated.surveyTitle}" has been updated in ${orgName}`,
            surveyId: updated._id.toString(),
            surveyName: updated.surveyTitle,
          });
        }
      } catch (err) {
        console.error("Draft notification failed:", err);
      }
    }

    res.json({ message: "Survey updated", survey: updated });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// updates survey status (with tenant check)
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["Draft", "Running", "Finished", "Scheduled"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const survey = await verifySurveyAccess(req, res, req.params.id);
    if (!survey) return;
    if (
      !checkEditPermission(
        req,
        res,
        survey.tenantId ? String(survey.tenantId) : undefined,
      )
    )

    return;

    // --enforce plan-based active survey limits payhere---
    const limitError = await checkActiveSurveyLimit(
      req,
      survey.tenantId ? String(survey.tenantId) : null,
      status,
      survey.status,
    );
    

    const updated = await Survey.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    logAudit(
      req,
      `status_change_${status.toLowerCase()}`,
      updated!._id,
      `Survey "${survey.surveyTitle}" status changed to "${status}"`,
    );

    const user = reqUser(req);

    const userId = reqUserId(req);

    if (!userId) return; // or handle error

    if (status === "Running") {
      if (user?._id) {
        const currentUser = await User.findById(user._id);
        const tenant = survey.tenantId
          ? await Tenant.findById(survey.tenantId)
          : null;

        if (currentUser?.email) {
          await notifySurveyPublished({
            email: currentUser.email,
            username: currentUser.username,
            organizationName: tenant?.name ?? "",
            surveyName: survey.surveyTitle,
          });
        }
      }

      try {
        const tenant = survey.tenantId
          ? await Tenant.findById(survey.tenantId)
          : null;

        const orgName = tenant?.name ?? "System";

        await createAppNotification({
          tenant_id: survey.tenantId ? String(survey.tenantId) : "", // or null if schema allows
          user_id: userId!,
          type: "SURVEY_PUBLISHED",
          channel: "in_app",
          message: `Survey "${survey.surveyTitle}" has been published in ${orgName}`,
          surveyId: survey._id.toString(),
          surveyName: survey.surveyTitle,
        });
      } catch (err) {
        console.error(
          "Notification failed but survey will still publish:",
          err,
        );
      }
    }

    if (status === "Finished") {
      const currentUser = user?._id ? await User.findById(user._id) : null;

      const tenant = survey.tenantId
        ? await Tenant.findById(survey.tenantId)
        : null;

      if (currentUser?.email) {
        await notifySurveyStopped({
          email: currentUser.email,
          username: currentUser.username,
          organizationName: tenant?.name ?? "",
          surveyName: survey.surveyTitle,
        });
      }
    }

    try {
      const tenant = survey.tenantId
        ? await Tenant.findById(survey.tenantId)
        : null;

      const orgName = tenant?.name ?? "System";

      await createAppNotification({
        tenant_id: survey.tenantId ? String(survey.tenantId) : "", // or null if schema allows
        user_id: userId!,
        type: "SURVEY_STOPPED",
        channel: "in_app",
        message: `Survey "${survey.surveyTitle}" has been stopped in ${orgName}`,
        surveyId: survey._id.toString(),
        surveyName: survey.surveyTitle,
      });
    } catch (err) {
      console.error("Notification failed but survey will still publish:", err);
    }

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
    if (
      !checkEditPermission(
        req,
        res,
        survey.tenantId ? String(survey.tenantId) : undefined,
      )
    )
      return;

    const surveyTitle = survey.surveyTitle;
    await Survey.findByIdAndDelete(req.params.id);
    logAudit(req, "delete", req.params.id, `Survey "${surveyTitle}" Deleted`);
    res.json({ message: "Survey deleted" });
  } catch (err) {
    res.status(500).json({ message: String(err) });
  }
};

// POST /api/surveys/:id/verify-password — Verifies survey password
export const verifySurveyPassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      res.status(404).json({ success: false, message: "Survey not found" });
      return;
    }

    if (!survey.isPasswordProtected) {
      res
        .status(400)
        .json({ success: false, message: "Survey is not password protected" });
      return;
    }

    // Compare the provided password with the stored hash
    const isValid = await bcrypt.compare(password, survey.password);

    if (isValid) {
      res.json({ success: true, message: "Password verified" });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: String(err) });
  }
};
