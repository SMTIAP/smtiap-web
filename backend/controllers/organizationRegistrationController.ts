import { Request, Response } from "express";
import Tenant from "../models/Tenant.js";
import sendToken from "../utils/sendToken.js";

export const createOrganization = async (req: Request, res: Response) => {
    try{
        const { name, country, address, description } = req.body;
        const tenant = await Tenant.create({
            name, country, address, description,
        })

        res.status(201).json({
            message: "Organization created successfully",
            tenant
        });
        
    } catch(error){
        res.status(500).json({
            message: "Server Error"
        });
    }
}