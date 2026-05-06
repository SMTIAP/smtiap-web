import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      console.log("No token found in cookies or headers.");
      res.status(401).json({ message: "Not authorized. No token found.", receivedCookies: req.cookies || "none" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string };

    (req as any).user = await User.findById(decoded.id).select("-password");
    
    if (!(req as any).user) {
      res.status(401).json({ message: "User not found in database for this token." });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Token verification failed.", error: error.message });
  }
};