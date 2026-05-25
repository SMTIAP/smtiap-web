import type { Request, Response, NextFunction } from "express";
import UserTenantRole from "../models/UserTenantRole.js";

/**
 * Loads tenant membership context from UserTenantRole and attaches to req.
 *
 * Sets:
 *   req.tenantIds       – string[] of all tenant ObjectIds the user belongs to
 *   req.memberships     – full UserTenantRole docs
 *   req.activeTenantId  – single active tenant (ONLY from x-tenant-id header, never auto-assigned)
 *
 * CRITICAL: activeTenantId is set ONLY when the client explicitly sends an x-tenant-id header
 * that matches one of the user's memberships.  It is NEVER auto-assigned from a single
 * membership — that would cause surveys created in "My Account" to leak into the tenant scope
 * for users who belong to only one tenant.
 *
 * Must be used AFTER `protect` middleware (requires req.user).
 * If the user has no tenant memberships, tenantIds will be empty — controllers
 * should return empty results or 403 as appropriate.
 */
export const loadTenant = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const user = (req as any).user as { _id?: string } | undefined;

  if (!user?._id) {
    // No authenticated user — no tenant context
    (req as any).tenantIds = [];
    (req as any).memberships = [];
    (req as any).activeTenantId = null;
    next();
    return;
  }

  try {
    const memberships = await UserTenantRole.find({
      userId: user._id,
    }).lean();

    const tenantIds = memberships.map((m) => String(m.tenantId));

    (req as any).tenantIds = tenantIds;
    (req as any).memberships = memberships;

    // Honour x-tenant-id header if user belongs to that tenant
    // IMPORTANT: Do NOT auto-assign from a single membership — the client must
    // explicitly opt into a tenant context.  "My Account" = no header = null.
    const headerTenantId = req.headers["x-tenant-id"] as string | undefined;
    if (headerTenantId && tenantIds.includes(headerTenantId)) {
      (req as any).activeTenantId = headerTenantId;
    } else {
      (req as any).activeTenantId = null;
    }
  } catch {
    (req as any).tenantIds = [];
    (req as any).memberships = [];
    (req as any).activeTenantId = null;
  }

  next();
};
