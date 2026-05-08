import type { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import sendToken from "../utils/sendToken.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    sendToken(user, res);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Record audit log
    await AuditLog.create({
      user_id: user._id,
      action: "login",
      entity: "User",
      entity_id: user._id,
    }).catch(() => {});

    sendToken(user, res);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  if (user) {
    await AuditLog.create({
      user_id: user._id,
      action: "logout",
      entity: "User",
      entity_id: user._id,
    }).catch(() => {});
  }

  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: "Logged out" });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.json((req as any).user);
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    console.log("RESET LINK:", resetUrl);

    res.json({
      message: "Password reset link generated",
      resetUrl,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (
  req: Request<{ token: string }>,
  res: Response,
) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password; // ✅ IMPORTANT FIX
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
