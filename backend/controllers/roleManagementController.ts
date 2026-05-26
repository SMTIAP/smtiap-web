import { Request, Response } from "express";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";

export const getAllUsers = async (req: Request, res: Response) => {
    try{
        const users = await User.find();
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({message: error.message })
    }
};

export const getAllTenants = async (req: Request, res: Response) => {
    try{
        const tenants = await Tenant.find();
        res.status(200).json(tenants);
    } catch (error: any) {
        res.status(500).json({message: error.message })
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try{
        const { userId } = req.params;
        const { role } = req.body;

        const updateUser = await User.findByIdAndUpdate(
            userId, { role }, { new: true }
        );

        if(!updateUser){
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json(updateUser);
        
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const addUserToOrganization = async (req: Request, res: Response) => {
    try {
        const { userId, tenantId } = req.params;
        const { role } = req.body;

        const exists = await UserTenantRole.findOne({ userId, tenantId });

        if (exists) {
            return res.status(400).json({
                message: "User already assigned to this tenant"
            });
        }

        const record = await UserTenantRole.create({
            userId,
            tenantId,
            role
        });

        res.status(201).json(record);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}


export const getUserTenantData = async (req: Request, res: Response) => {
    try {
        const data = await UserTenantRole.find()
            .populate("userId", "username email")
            .populate("tenantId", "name");

        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};


export const updateOrgRole = async (req: Request, res: Response) => {
    try {
        const { userId, tenantId } = req.params;
        const { role } = req.body;

        const updated = await UserTenantRole.findOneAndUpdate(
            { userId, tenantId },
            { role },
            { new: true }
        )
        .populate("userId")
        .populate("tenantId");

        if (!updated) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.status(200).json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};


export const removeOrgUser = async (req: Request, res: Response) => {
    try {
        const { userId, tenantId } = req.params;

        const deleted = await UserTenantRole.findOneAndDelete({
            userId,
            tenantId
        });

        if (!deleted) {
            return res.status(404).json({
                message: "Record not found"
            });
        }

        res.status(200).json({
            message: "User removed from organization"
        });

    } catch (error: any) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }
        await UserTenantRole.deleteMany({ userId });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};