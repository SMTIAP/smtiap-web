import { Request, Response } from "express";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import User from "../models/User.js";
import sendToken from "../utils/sendToken.js";

export const createOrganization = async (req: Request, res: Response) => {
    try{
        const { name, country, address, description, domain } = req.body;

        const userId = (req as any).user._id;

        if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
        }

        const tenant = await Tenant.create({
            name, country, address, description, domain, createdBy: userId,
        });



    // 2. Create membership
        await UserTenantRole.create({
        userId,
        tenantId: tenant._id,
        role: "admin",
        });

        res.status(201).json({
            message: "Organization created successfully",
            tenant,
        });
        
    } catch(error){
        return res.status(500).json({
            message: "Server Error"
        });
    }
};