import mongoose from "mongoose";
import { env } from "./env.js";

// Connects to MongoDB using the URI from environment config.
// Throws early if MONGO_URI is missing to avoid a cryptic timeout.
export const connectDb = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is not set");
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB Connected.");
};
