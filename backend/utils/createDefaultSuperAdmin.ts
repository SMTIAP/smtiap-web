import dotenv from "dotenv";
import path from "path";
import User from "../models/User.js";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export const createDefaultSuperAdmin = async (): Promise<void> => {
  const email = process.env.SUPER_ADMIN_EMAIL || "smtiapweb@gmail.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@12345";
  const username = process.env.SUPER_ADMIN_USERNAME || "Super Admin";
  const createEnabled =
    process.env.CREATE_DEFAULT_SUPER_ADMIN === "true" ||
    process.env.NODE_ENV !== "production";

  if (!createEnabled) {
    console.log("Default super admin creation is disabled in production.");
    return;
  }

  const existingSuperAdmin = await User.findOne({ role: "super_admin" });
  if (existingSuperAdmin) {
    console.log(
      `Super admin user already exists: ${existingSuperAdmin.email}`,
    );
    return;
  }

  const user = await User.create({
    username,
    email,
    password,
    role: "super_admin",
    isVerified: true,
  });

  console.log(
    `Created default super admin user: ${user.email} (login with the configured password)`,
  );
};
