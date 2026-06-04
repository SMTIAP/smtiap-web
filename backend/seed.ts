import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import Category from "./models/Category.js";
import User from "./models/User.js";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const seedCategories = async (superAdminId: any) => {
  console.log("\n📁 Seeding default categories...");
  
  const categoryNames = [
    "Most Popular", "Restaurant", "HR", "Education", "Healthcare",
    "Events", "Corporate", "Product", "Retail",
  ];

  let createdCount = 0;
  for (const name of categoryNames) {
    const existing = await Category.findOne({ name });
    if (!existing) {
      await Category.create({ name, createdBy: superAdminId, isActive: true });
      console.log(`  ✓ Created category: ${name}`);
      createdCount++;
    } else {
      console.log(`  ⏭️ Category already exists: ${name}`);
    }
  }
  console.log(`✅ Categories: ${createdCount} new, ${categoryNames.length - createdCount} existing`);
  console.log(`\n📝 No default templates created. Admins can create templates via the UI.`);
};

const runSeed = async (): Promise<void> => {
  try {
    await connectDb();
    
    // Find super admin directly from database
    const superAdmin = await User.findOne({ role: "super_admin" });
    
    if (!superAdmin) {
      console.log("No super admin found. Creating one...");
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash("Admin123!", 10);
      
      const newSuperAdmin = await User.create({
        email: "superadmin@smtiap.com",
        username: "SuperAdmin",
        password: hashedPassword,
        role: "super_admin",
        isVerified: true,
      });
      console.log("✅ Super admin created:", newSuperAdmin.email);
      
      await seedCategories(newSuperAdmin._id);
    } else {
      console.log("✅ Super admin found:", superAdmin.email);
      await seedCategories(superAdmin._id);
    }
    
    console.log("\n✅ Seeding completed!");
    
  } catch (error: unknown) {
    console.error(
      "Error while seeding:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runSeed();