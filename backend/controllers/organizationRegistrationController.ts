import { Request, Response } from "express";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import AuditLog from "../models/AuditLog.js";
import { notifyOrganizationCreated } from "../services/notificationService.js";

interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, country, address, description, domain, orgType } = req.body;

    const userId = (req as AuthenticatedRequest).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only prevent duplicate ACTIVE orgs (optional rule)
    const existingActiveTenant = await Tenant.findOne({
      domain,
      status: "active",
    });

    if (existingActiveTenant) {
      return res.status(409).json({
        message: "Active organization with this domain already exists",
      });
    }

    const existingOrganizationName = await Tenant.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      status: "active",
      createdBy: userId,
    });
    if (existingOrganizationName) {
      return res.status(409).json({
        message: "You have already created an organization with this name",
      });
    }

    const tenant = await Tenant.create({
      name,
      country,
      address,
      description,
      domain,
      orgType,
      createdBy: userId,
      status: "active",
    });

    // Create membership
    await UserTenantRole.create({
      userId,
      tenantId: tenant._id,
      role: "admin",
    });

    // Audit log
    await AuditLog.create({
      tenant_id: tenant._id,
      user_id: userId,
      action: "create",
      entity: "Tenant",
      entity_id: tenant._id,
      description: `Created Organization ${tenant.name}`,
    });

    const cleanTenant = tenant.toObject();

    await notifyOrganizationCreated({
      _id: cleanTenant._id.toString(),
      name: cleanTenant.name,
      country: cleanTenant.country,
      domain: cleanTenant.domain,
      orgType: cleanTenant.orgType,
      createdBy: cleanTenant.createdBy.toString(),
    });

    return res.status(201).json({
      message: "Organization created successfully",
      tenant,
    });
  } catch (error: any) {
    console.error("Create Organization Error:", error);

    return res.status(500).json({
      message: error?.message || "Server Error",
      error, // ⚠️ full error (ONLY for dev)
    });
  }
};
