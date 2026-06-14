// Attaches tenant membership context to req. Requires `protect` to run first.
// activeTenantId is set ONLY from the x-tenant-id header — never auto-assigned,
// to prevent "My Account" surveys from leaking into a tenant scope.
import type { Request, Response, NextFunction } from "express";
import UserTenantRole from "../models/UserTenantRole.js";

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

    // Honour x-tenant-id header only if user belongs to that tenant.
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
