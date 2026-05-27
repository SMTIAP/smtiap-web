import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import { createDefaultSuperAdmin } from "./utils/createDefaultSuperAdmin.js";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const runSeed = async (): Promise<void> => {
  try {
    await connectDb();
    await createDefaultSuperAdmin();
  } catch (error: unknown) {
    console.error(
      "Error while seeding default super admin:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runSeed();
