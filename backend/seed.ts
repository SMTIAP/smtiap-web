import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import Category from "./models/Category.js";
import Template from "./models/Template.js";
import User from "./models/User.js";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const seedCategoriesAndTemplates = async (superAdminId: any) => {
  console.log("\n📁 Seeding categories...");

  const categoryNames = [
    "Restaurant", "HR", "Education", "Healthcare",
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
      if (existing.isActive === false) {
        await Category.updateOne({ name }, { $set: { isActive: true } });
        console.log(`  ✓ Reactivated category: ${name}`);
        createdCount++;
      } else {
        console.log(`  ⏭️ Category already exists: ${name}`);
      }
    }
  }
  console.log(`✅ Categories: ${createdCount} new/reactivated, ${categoryNames.length - createdCount} existing`);
};

  const runSeed = async (): Promise<void> => {
    try {
      // Use MONGO_URI from .env file instead of connectDb()
      const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smtiap";
      await mongoose.connect(mongoURI);
      console.log("MongoDB Connected.");
      console.log(`Database: ${mongoose.connection.db?.databaseName}`);

      // Find super admin directly from database
      let superAdmin = await User.findOne({ role: "super_admin" });

      if (!superAdmin) {
        console.log("No super admin found. Creating one...");
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash("Admin123!", 10);

        superAdmin = await User.create({
          email: "superadmin@smtiap.com",
          username: "SuperAdmin",
          password: hashedPassword,
          role: "super_admin",
          isVerified: true,
        });
        console.log("✅ Super admin created:", superAdmin.email);
      } else {
        console.log("✅ Super admin found:", superAdmin.email);
      }

      await seedCategoriesAndTemplates(superAdmin._id);

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