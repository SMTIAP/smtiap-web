import type { Request, Response, NextFunction } from "express";
import UserTenantRole from "../models/UserTenantRole.js";

/**
 * Loads tenant membership context from UserTenantRole and attaches to req.
 *
 * Sets:
 *   req.tenantIds     – string[] of all tenant ObjectIds the user belongs to
 *   req.memberships   – full UserTenantRole docs
 *   req.activeTenantId – single active tenant (from header or single membership)
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
    const headerTenantId = req.headers["x-tenant-id"] as string | undefined;
    if (headerTenantId && tenantIds.includes(headerTenantId)) {
      (req as any).activeTenantId = headerTenantId;
    } else if (tenantIds.length === 1) {
      (req as any).activeTenantId = tenantIds[0];
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
