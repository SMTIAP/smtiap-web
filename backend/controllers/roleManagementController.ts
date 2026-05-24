import { Request, Response } from "express";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import AuditLog from "../models/AuditLog.js";

export const formatRole = (role: string) => {
  return role
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await Tenant.find();
    res.status(200).json(tenants);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// export const updateUserRole = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;
//     const { role } = req.body;

//     const updateUser = await User.findByIdAndUpdate(
//       userId,
//       { role },
//       { new: true },
//     );

//     if (!updateUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(updateUser);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const addUserToOrganization = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;
    const { role } = req.body;
    const actor = (req as any).user;

    const exists = await UserTenantRole.findOne({ userId, tenantId, status: "active", });

    if (exists) {
      return res.status(400).json({
        message: "User already assigned to this tenant",
      });
    }

    const record = await UserTenantRole.create({
      userId,
      tenantId,
      role,
    });

    //Fetch user details
    const user = await User.findById(userId);
    const tenant = await Tenant.findById(tenantId);

    await AuditLog.create({
      tenant_id: tenantId,
      user_id: actor._id,
      action: "add",
      entity: "User",
      entity_id: userId,
      description: `Added User ${user?.username} to ${tenant?.name}`,
    });

    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserTenantData = async (req: Request, res: Response) => {
  try {
    const data = await UserTenantRole.find({
      status: "active",
    })
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
    const { role: newRole } = req.body;
    const actor = (req as any).user;

    // 1. Get existing record FIRST (old role)
    const existing = await UserTenantRole.findOne({
      userId,
      tenantId,
    });

    if (!existing) {
      return res.status(404).json({ message: "Record not found" });
    }

    const oldRole = existing.role;

    // 2. Update role
    existing.role = newRole;
    const updated = await existing.save();

    // 3. Populate for response
    await updated.populate("userId", "username email");
    await updated.populate("tenantId", "name");


    // 4. Fetch for audit
    //Fetch user details
    const user = await User.findById(userId);
    const tenant = await Tenant.findById(tenantId);

    // 5. Audit log (NOW it runs)
    await AuditLog.create({
      tenant_id: tenantId,
      user_id: actor._id,
      action: "update",
      entity: "User",
      entity_id: userId,
      description: `Role changed from ${formatRole(oldRole)} to ${formatRole(newRole)} for ${user?.username} in Organization ${tenant?.name}`,
    });

    return res.status(200).json({
      updated,
      oldRole,
      newRole,
    });

  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeOrgUser = async (req: Request, res: Response) => {
  try {
    const { userId, tenantId } = req.params;
    const actor = (req as any).user;


    const record = await UserTenantRole.findOne({
      userId,
      tenantId,
      status: "active",
    });

    if (!record) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    if (record.status === "inactive") {
      return res.status(400).json({
        message: "User already inactive",
      });
    }

    record.status = "inactive";
    await record.save();

    const user = await User.findById(userId);
    const tenant = await Tenant.findById(tenantId);

    await AuditLog.create({
      tenant_id: tenantId,
      user_id: actor._id,
      action: "delete",
      entity: "User",
      entity_id: userId,
      description: `Deleted ${user?.username} from Organization ${tenant?.name}`,
    })

    res.status(200).json({
      message: "User removed from organization",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};
