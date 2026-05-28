import cron from "node-cron";
import Survey from "../models/Survey";

export const startSurveyStatusJob = () => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      
      // Start scheduled surveys (Scheduled → Running)
      const startedSurveys = await Survey.updateMany(
        {
          scheduledOpen: { $lte: now },
          status: "Scheduled",
        },
        { status: "Running" }
      );
      
      // Close expired surveys (Running → Finished)
      const closedSurveys = await Survey.updateMany(
        {
          scheduledClose: { $lte: now },
          status: "Running",
        },
        { status: "Finished" }
      );
      
      if (startedSurveys.modifiedCount > 0 || closedSurveys.modifiedCount > 0) {
        console.log(`[${now.toISOString()}] Survey statuses updated: ${startedSurveys.modifiedCount} started, ${closedSurveys.modifiedCount} closed`);
      }
    } catch (error) {
      console.error("Failed to update survey statuses:", error);
    }
  });
};