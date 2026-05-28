import type { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import AuditLog from "../models/AuditLog.js";
import sendToken from "../utils/sendToken.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../services/emailService.js";

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
      description: "Logged In",
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
      description: "Logged Out",
    }).catch(() => {});
  }

  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: "Logged out" });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Fetch tenant memberships
  const memberships = await UserTenantRole.find({ userId: user._id })
    .populate("tenantId", "name domain plan status")
    .lean()
    .catch(() => []);

  const tenants = memberships.map((m: any) => ({
    tenantId: m.tenantId,
    role: m.role,
  }));

  res.json({
    ...user.toObject(),
    tenants,
  });
};

export const getMyTenants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const memberships = await UserTenantRole.find({ userId: user._id })
      .populate("tenantId", "name domain plan status")
      .lean();

    const tenants = memberships.map((m) => ({
      tenantId: m.tenantId,
      role: m.role,
    }));

    res.json(tenants);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
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

    // Generate a temporary password (8 hex chars, easy to copy)
    const tempPassword = crypto.randomBytes(4).toString("hex");

    // Hash and store it in resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(tempPassword)
      .digest("hex");

    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // Send temporary password via email
    await sendEmail(
      user.email,
      "Your Temporary Password - SMTIAP",
      `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #5C38E1;">Password Reset Request</h2>
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>Use the temporary password below to reset your account password. This code expires in <strong>10 minutes</strong>.</p>
          <div style="background: #F3F0FF; border: 2px dashed #5C38E1; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1A1007; font-family: monospace;">${tempPassword}</span>
          </div>
          <p>Go to the <strong>Reset Password</strong> page, enter your email, paste this temporary password, and set a new password.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="color: #6B7280; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    );

    res.json({
      message:
        "Temporary password sent to your email. Please check your inbox.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, tempPassword, newPassword } = req.body;

    if (!email || !tempPassword || !newPassword) {
      return res
        .status(400)
        .json({
          message: "Email, temporary password, and new password are required",
        });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(tempPassword)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired temporary password" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
