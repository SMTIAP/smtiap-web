import type { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import AuditLog from "../models/AuditLog.js";
import sendToken from "../utils/sendToken.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../services/emailService.js";
import { notifyRegistered } from "../services/emailNotificationService.js";

// Registers a new user with email verification. Rolls back the account if the verification email fails to send.
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // 32 random bytes = 64 hex chars, used as a secure email verification token.
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      username,
      email,
      password,
      isVerified: false,
      verificationToken,
      verificationTokenExpire,
    });

    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}&email=${email}`;

    try {
      await sendEmail(
        user.email,
        "Verify Your Email - MTSP",
        `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #5C38E1; text-align: center;">Welcome to MTSP!</h2>
            <p>Hello <strong>${user.username}</strong>,</p>
            <p>Thank you for registering. Please verify your email address to activate your account. This verification link will expire in <strong>24 hours</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #5C38E1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="word-break: break-all; font-size: 12px; color: #6B7280; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${verificationUrl}" style="color: #5C38E1;">${verificationUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
            <p style="color: #6B7280; font-size: 12px; text-align: center;">If you did not create an account, please ignore this email.</p>
          </div>
        `,
      );
    } catch (emailError: any) {
      console.error("Email sending failed:", emailError);
      // Clean up newly created user since verification email could not be sent.
      await User.deleteOne({ _id: user._id });
      res.status(500).json({
        message: `Account creation halted because verification email failed to send: ${emailError.message}. Please configure valid SMTP credentials in backend/.env.`,
      });
      return;
    }

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Authenticates a user by email/password, verifies email is confirmed, and issues a JWT cookie.
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // +password includes the normally excluded password field needed for comparison.
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Block login until the user confirms their email address.
    if (!user.isVerified) {
      res.status(401).json({
        message: "Please verify your email address before logging in.",
      });
      return;
    }

    // Audit failures should not block login.
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

// Logs the user out by clearing the HttpOnly JWT cookie and recording an audit entry.
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

  // Clear the HttpOnly cookie by expiring it immediately.
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: "Logged out" });
};

// Returns the authenticated user's profile enriched with their active tenant memberships.
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Fetch active tenant memberships only; membership fetch failures return empty list.
  const memberships = await UserTenantRole.find({
    userId: user._id,
    status: "active",
  })
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

// Returns the list of organizations the authenticated user belongs to, with their role in each.
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

    const memberships = await UserTenantRole.find({
      userId: user._id,
      status: "active",
    })
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

// Sends a temporary password to the user's email for self-service password reset.
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

    // Generate a temporary password (8 hex chars, easy to copy).
    const tempPassword = crypto.randomBytes(4).toString("hex");

    // Hash and store it in resetPasswordToken field.
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(tempPassword)
      .digest("hex");

    // Token expires after 10 minutes.
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // Send temporary password via email.
    await sendEmail(
      user.email,
      "Your Temporary Password - MTSP",
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

// Validates the temporary password and sets a new permanent password, clearing the reset token.
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, tempPassword, newPassword } = req.body;

    if (!email || !tempPassword || !newPassword) {
      return res.status(400).json({
        message: "Email, temporary password, and new password are required",
      });
    }

    // Hash the provided temp password to compare with the stored hash.
    const hashedToken = crypto
      .createHash("sha256")
      .update(tempPassword)
      .digest("hex");

    // Find user by email + hashed token, ensuring the token has not expired.
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

// Confirms a user's email address using the verification token sent during registration.
export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      res.status(400).json({ message: "Token and email are required" });
      return;
    }

    const emailStr = typeof email === "string" ? email : String(email);
    const tokenStr = typeof token === "string" ? token : String(token);

    // Verify token matches and has not expired.
    const user = await User.findOne({
      email: emailStr,
      verificationToken: tokenStr,
      verificationTokenExpire: { $gt: new Date() },
    });

    if (!user) {
      res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
      return;
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpire = null;
    await user.save();

    // Welcome notification failure should not block the verification response.
    try {
      await notifyRegistered({
        email: user.email,
        username: user.username,
      });
    } catch (err) {
      console.error("Registration success email failed:", err);
    }

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Generates a fresh verification token and re-sends the verification email to an unverified user.
export const resendVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: "Email is already verified" });
      return;
    }

    // Generate a new token with a 24-hour expiry, replacing any previous unexpired token.
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpire = verificationTokenExpire;
    await user.save();

    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}&email=${email}`;
    await sendEmail(
      user.email,
      "Verify Your Email - MTSP",
      `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #5C38E1; text-align: center;">Welcome to MTSP!</h2>
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>Thank you for registering. Please verify your email address to activate your account. This verification link will expire in <strong>24 hours</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #5C38E1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="word-break: break-all; font-size: 12px; color: #6B7280; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${verificationUrl}" style="color: #5C38E1;">${verificationUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="color: #6B7280; font-size: 12px; text-align: center;">If you did not create an account, please ignore this email.</p>
        </div>
      `,
    );

    res.json({
      message:
        "Verification email resent successfully! Please check your inbox.",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
