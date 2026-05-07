import { Request, Response } from "express";
import User from "../models/User.js";

export const getAllUsers = async (req: Request, res: Response) => {
    try{
        const users = await User.find();
        res.status(200).json(users);
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