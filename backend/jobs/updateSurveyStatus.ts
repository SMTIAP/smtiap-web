import cron from "node-cron";
import Survey from "../models/Survey.js";

export const startSurveyStatusJob = () => {
  console.log("⏰ Cron job registered - will check every minute");

  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      //console.log(`[${now.toLocaleString()}] Checking scheduled surveys...`);

      // Start scheduled surveys (Scheduled → Running)
      const startedSurveys = await Survey.updateMany(
        {
          scheduledOpen: { $lte: now },
          status: "Scheduled",
        },
        { $set: { status: "Running" } }
      );

      // Close expired surveys (Running → Finished)
      const closedSurveys = await Survey.updateMany(
        {
          scheduledClose: { $lte: now },
          status: "Running",
        },
        { $set: { status: "Finished" } }
      );

      if (startedSurveys.modifiedCount > 0 || closedSurveys.modifiedCount > 0) {
        console.log(`Updated: ${startedSurveys.modifiedCount} started, ${closedSurveys.modifiedCount} closed`);
      }
    } catch (error) {
      console.error("Cron error:", error);
    }
  });
};