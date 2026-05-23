import { Request, Response } from "express";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import User from "../models/User.js";
import sendToken from "../utils/sendToken.js";

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, country, address, description, domain } = req.body;

    const userId = (req as any).user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Check for duplicate domain upfront to give a meaningful error
    const existing = await Tenant.findOne({ domain }).lean();
    if (existing) {
      return res.status(409).json({
        message: `An organization with the domain "${domain}" already exists.`,
      });
    }

    const tenant = await Tenant.create({
      name,
      country,
      address,
      description,
      domain,
      createdBy: userId,
    });

    // Create membership — roll back tenant if this fails
    try {
      await UserTenantRole.create({
        userId,
        tenantId: tenant._id,
        role: "admin",
      });
    } catch (membershipError) {
      await Tenant.deleteOne({ _id: tenant._id });
      throw membershipError;
    }

    res.status(201).json({
      message: "Organization created successfully",
      tenant,
    });
  } catch (error: any) {
    const isDuplicate = error?.code === 11000;
    return res.status(isDuplicate ? 409 : 500).json({
      message: isDuplicate
        ? "An organization with that domain already exists."
        : "Server Error",
    });
  }
};
