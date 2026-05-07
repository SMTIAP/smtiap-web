import express from "express";
import path from "path";
import dotenv from "dotenv";

// ✅ Load env FIRST (important for OAuth)
dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});
import cors from "cors";
import payhereRoutes from "./routes/payhereRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import Tenant from "./models/Tenant.js";
import TenantUser from "./models/TenantUser.js";
import Survey from "./models/Survey.js";
import Question from "./models/Question.js";
import Response from "./models/Response.js";
import Answer from "./models/Answer.js";
import Subscription from "./models/Subscription.js";
import CreditLedger from "./models/CreditLedger.js";
import Notification from "./models/Notification.js";
import AuditLog from "./models/AuditLog.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import SurveyResponse from "./models/SurveyResponse.js";

const ensureCollections = async () => {
  await Promise.all([
    Tenant.createCollection(),
    TenantUser.createCollection(),
    Survey.createCollection(),
    SurveyResponse.createCollection(),
    Question.createCollection(),
    Response.createCollection(),
    Answer.createCollection(),
    Subscription.createCollection(),
    CreditLedger.createCollection(),
    Notification.createCollection(),
    AuditLog.createCollection(),
  ]);
  console.log("All collections ensured.");
};
import { initGitHubStrategy } from "./config/github.js";
import { initLinkedInStrategy } from "./config/linkedin.js";
import passport, { initGoogleStrategy } from "./config/passport.js";

import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use(payhereRoutes);
app.use("/api/users", userRoutes);
app.use("/api/surveys", surveyRoutes);
app.use(analyticsRoutes);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("🚀 PayHere backend is running");
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "Server is running successfully!" });
});

const startServer = async () => {
  try {
    initGitHubStrategy();
    initLinkedInStrategy();
    initGoogleStrategy();
    await connectDb();
    await ensureCollections();

    app.listen(env.port, () => {
      console.log(`PayHere backend running at http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
