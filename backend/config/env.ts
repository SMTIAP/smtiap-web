// Centralized environment config with defaults for local development.
import "dotenv/config";
import dotenv from "dotenv";
import path from "path";

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "",
  // Sandbox merchant ID, replace with production ID in deployment.
  merchantId: process.env.MERCHANT_ID || "",
  merchantSecret:
    process.env.MERCHANT_SECRET ||
    "MzYxNDY5MzE2MzkxNzM3MzMwMzI3ODkwNTcxNjEzNjA3Nzg0MTgx",
  notifyBaseUrl: process.env.NOTIFY_BASE_URL || "",
};

// manually load .env from the backend directory. extra safety if early imports fail (overrides any parent-level dotenv config).
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});
