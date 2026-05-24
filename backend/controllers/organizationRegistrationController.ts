import { Request, Response } from "express";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import User from "../models/User.js";
import sendToken from "../utils/sendToken.js";
import AuditLog from "../models/AuditLog.js";

export const createOrganization = async (req: Request, res: Response) => {
    try{
        const { name, country, address, description, domain, orgType } = req.body;

        const userId = (req as any).user._id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const existingDomain = await Tenant.findOne({domain});
        if(existingDomain){
            return res.status(409).json({
                message: "Domain already exists",
            });
        }

        const existingOrganizationName = await Tenant.findOne({
            name: { $regex: `^${name}$`, $options: "i" },
            createdBy: userId
        });
        if(existingOrganizationName){
            return res.status(409).json({
                message: "You have already created an organization with this name"
            })
        }

        const tenant = await Tenant.create({
            name, country, address, description, domain, orgType, createdBy: userId,
        });



    // 2. Create membership
        await UserTenantRole.create({
            userId,
            tenantId: tenant._id,
            role: "admin",
        });

        await AuditLog.create({
            tenant_id: tenant._id,
            user_id: userId,
            action: "create",
            entity: "Tenant",
            entity_id: tenant._id,
            description: `Created Organization ${tenant.name}`,
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