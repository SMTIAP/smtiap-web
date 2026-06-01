import type { Request, Response } from "express";
import User from "../models/User.js";
import sendToken from "../utils/sendToken.js";
import AuditLog from "../models/AuditLog.js";
import Tenant from "../models/Tenant.js";
import Survey from "../models/Survey.js";
import CreditLedger from "../models/CreditLedger.js";
import UserTenantRole from "../models/UserTenantRole.js";
import { createAppNotification } from "../services/notificationService.js";
import { notifyTenantRemoved } from "../services/emailNotificationService.js";

export const superAdminLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "super_admin" }).select(
      "+password",
    );

    if (!user || !(await user.matchPassword(password))) {
      res.status(400).json({ message: "Invalid super admin credentials" });
      return;
    }

    await AuditLog.create({
      user_id: user._id,
      action: "login",
      entity: "User",
      entity_id: user._id,
      description: "Super admin login",
    }).catch(() => {});

    sendToken(user, res);
  } catch (error: unknown) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Unable to authenticate",
    });
  }
};

export const getSuperAdminDashboard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const activeTenants = await Tenant.countDocuments({ status: "active" });
    const totalUsers = await User.countDocuments();
    const totalSurveys = await Survey.countDocuments();
    const totalAuditLogs = await AuditLog.countDocuments();

    res.status(200).json({
      message: "Welcome to the Super Admin dashboard.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      stats: {
        activeTenants,
        totalUsers,
        totalSurveys,
        totalAuditLogs,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const getManagedUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.find({ role: { $ne: "super_admin" } })
      .select("username email role")
      .lean();

    res.status(200).json(users);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const createManagedUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;
    const actor = (req as any).user;

    if (!username || !email || !password || !role) {
      res.status(400).json({ message: "Missing required user fields" });
      return;
    }

    if (role === "super_admin") {
      res
        .status(400)
        .json({
          message: "Cannot create another super admin from this console",
        });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res
        .status(400)
        .json({ message: "A user with that email already exists" });
      return;
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      isVerified: true,
    });

    await AuditLog.create({
      user_id: actor._id,
      action: "create",
      entity: "User",
      entity_id: user._id,
      description: `Created user ${user.email} with role ${role}`,
    }).catch(() => {});

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const updateManagedUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { username, email, role } = req.body;
    const actor = (req as any).user;

    if (!username && !email && !role) {
      res.status(400).json({ message: "No changes provided" });
      return;
    }

    if (role === "super_admin") {
      res
        .status(400)
        .json({
          message: "Cannot change role to super admin from this console",
        });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (
      String(user._id) === String(actor._id) &&
      role &&
      role !== "super_admin"
    ) {
      res.status(400).json({
        message: "Super admin cannot change their own role from this console",
      });
      return;
    }

    const oldRole = user.role;
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    await AuditLog.create({
      user_id: actor._id,
      action: "update",
      entity: "User",
      entity_id: user._id,
      description: `Updated user ${user.email} from role ${oldRole} to ${user.role}`,
    }).catch(() => {});

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      oldRole,
      newRole: user.role,
    });
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const deleteManagedUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const actor = (req as any).user;

    if (String(userId) === String(actor._id)) {
      res
        .status(400)
        .json({ message: "Super admin cannot delete their own account" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.role === "super_admin") {
      res.status(403).json({ message: "Cannot delete another super admin" });
      return;
    }

    await user.deleteOne();

    await AuditLog.create({
      user_id: actor._id,
      action: "delete",
      entity: "User",
      entity_id: user._id,
      description: `Deleted user ${user.email} with role ${user.role}`,
    }).catch(() => {});

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const getManagedTenants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const tenants = await Tenant.find()
      .populate("createdBy", "username email")
      .lean();

    const enrichedTenants = await Promise.all(
      tenants.map(async (tenant) => {
        const ledgers = await CreditLedger.find({
          tenant_id: tenant._id,
        } as any);
        const balance = ledgers.reduce(
          (acc, curr: any) => acc - curr.credits_used,
          0,
        );
        return {
          ...tenant,
          creditBalance: balance,
        };
      }),
    );

    res.status(200).json(enrichedTenants);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const updateManagedTenant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { tenantId } = req.params;
    const { status, plan } = req.body;
    const actor = (req as any).user;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const oldStatus = tenant.status;
    const oldPlan = tenant.plan;

    const wasDeactivated = status === "inactive" && oldStatus !== "inactive";

    if (status) tenant.status = status;
    if (plan) tenant.plan = plan;

    await tenant.save();

    if (wasDeactivated) {
      // Fetch admins/creators BEFORE deactivating their records
      const tenantAdmins = await UserTenantRole.find({
        tenantId,
        role: { $in: ["admin", "creator"] },
        status: "active",
      }).populate("userId", "email username");

      // Deactivate all user-tenant relationships
      await UserTenantRole.updateMany(
        { tenantId },
        { $set: { status: "inactive" } },
      );

      // Notify tenant admins and creators
      const actorId = actor?._id?.toString();

      await Promise.all(
        tenantAdmins
          .filter((entry) => entry.userId?._id?.toString() !== actorId)
          .map(async (entry) => {
            const user = entry.userId as unknown as {
              _id: string;
              email: string;
              username: string;
            };
            if (!user?.email) return;

            await createAppNotification({
              tenant_id: tenantId,
              user_id: user._id,
              type: "TENANT_DEACTIVATED",
              channel: "in_app",
              message: `Organization "${tenant.name}" has been deactivated by the system administrator.`,
            });

            await notifyTenantRemoved({
              email: user.email,
              username: user.username,
              organizationName: tenant.name,
            });
          }),
      );
    }

    await AuditLog.create({
      user_id: actor._id,
      action: "update",
      entity: "Tenant",
      entity_id: tenant._id,
      description: `Updated organization ${tenant.name} status: ${oldStatus} -> ${tenant.status}, plan: ${oldPlan} -> ${tenant.plan}`,
    }).catch(() => {});

    res.status(200).json(tenant);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

export const adjustTenantCredits = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { tenantId } = req.params;
    const { amount, reason } = req.body;
    const actor = (req as any).user;

    if (amount === undefined || isNaN(Number(amount))) {
      res.status(400).json({ message: "Valid adjustment amount is required" });
      return;
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const ledgers = await CreditLedger.find({ tenant_id: tenant._id } as any);
    const currentBalance = ledgers.reduce(
      (acc, curr: any) => acc - curr.credits_used,
      0,
    );

    const creditsUsed = -Number(amount);
    const balanceAfter = currentBalance + Number(amount);

    const ledgerEntry = await CreditLedger.create({
      tenant_id: tenant._id,
      action: reason || "Admin Manual Adjustment",
      credits_used: creditsUsed,
      balance_after: balanceAfter,
    } as any);

    await AuditLog.create({
      user_id: actor._id,
      action: "update",
      entity: "Tenant",
      entity_id: tenant._id,
      description: `Adjusted credits for organization ${tenant.name} by ${amount} credits. New balance: ${balanceAfter}. Reason: ${reason || "Admin Manual Adjustment"}`,
    }).catch(() => {});

    res.status(200).json({
      message: "Credits adjusted successfully",
      ledgerEntry,
      newBalance: balanceAfter,
    });
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};
