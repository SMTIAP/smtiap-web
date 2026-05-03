import express from "express";
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

const ensureCollections = async () => {
  await Promise.all([
    Tenant.createCollection(),
    TenantUser.createCollection(),
    Survey.createCollection(),
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

const app = express();

app.use(cors());
app.use(express.json());

app.use(payhereRoutes);
app.use("/api/users", userRoutes);
app.use("/api/surveys", surveyRoutes); 
app.use(analyticsRoutes);
app.use(errorHandler);

const startServer = async () => {
  try {
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
