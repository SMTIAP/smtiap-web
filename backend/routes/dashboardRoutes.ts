import { Router, Request, Response } from "express";
import { protect } from "../middleware/auth.js";
import { loadTenant } from "../middleware/tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import Survey from "../models/Survey.js";
import Subscription from "../models/Subscription.js";
import { Payment } from "../models/Payment.js";
import mongoose from "mongoose";

const router = Router();

router.get(
  "/stats",
  protect,
  loadTenant,
  async (req: Request, res: Response) => {
    try {
      const currentUser = (req as Request & { user?: { _id?: string } }).user;
      const userId = currentUser?._id;
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const activeTenantId =
        ((req as any).activeTenantId as string | null) ?? null;
      const activeTenantObjectId =
        activeTenantId && mongoose.Types.ObjectId.isValid(activeTenantId)
          ? new mongoose.Types.ObjectId(activeTenantId)
          : null;

      const [adminCount, creatorCount, billingCount, viewerCount] =
        activeTenantObjectId
          ? await Promise.all([
              UserTenantRole.countDocuments({
                tenantId: activeTenantObjectId,
                role: "admin",
              }),
              UserTenantRole.countDocuments({
                tenantId: activeTenantObjectId,
                role: "creator",
              }),
              UserTenantRole.countDocuments({
                tenantId: activeTenantObjectId,
                role: "billing_manager",
              }),
              UserTenantRole.countDocuments({
                tenantId: activeTenantObjectId,
                role: "viewer",
              }),
            ])
          : [0, 0, 0, 0];

      const surveyFilter: any = activeTenantId
        ? { tenantId: activeTenantId }
        : {
            createdBy: userObjectId,
            $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
          };

      const withStatus = (status: string) => ({
        $and: [surveyFilter, { status }],
      });

      const [totalSurveys, draftCount, runningCount, scheduledCount, finishedCount] =
        await Promise.all([
          Survey.countDocuments(surveyFilter),
          Survey.countDocuments(withStatus("Draft")),
          Survey.countDocuments(withStatus("Running")),
          Survey.countDocuments(withStatus("Scheduled")),
          Survey.countDocuments(withStatus("Finished")),
        ]);

      const payment = activeTenantObjectId
        ? await Payment.findOne({ tenantId: activeTenantObjectId, status: "success" })
            .sort({ createdAt: -1 })
            .lean()
        : null;

      let subscriptionData = null;
      if (payment && payment.expiresAt) {
        const now = new Date();
        const endDate = new Date(payment.expiresAt);
        const startDate = new Date(payment.createdAt as unknown as string);
        const remainingDays = Math.max(
          0,
          Math.ceil(
            (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          ),
        );
        const totalDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const progressPct =
          totalDays > 0
            ? Math.round(((totalDays - remainingDays) / totalDays) * 100)
            : 0;
        subscriptionData = {
          plan: payment.planName,
          status: payment.status,
          startDate: startDate.toLocaleDateString("en-GB"),
          endDate: endDate.toLocaleDateString("en-GB"),
          remainingDays,
          progressPct,
        };
      }

      res.json({
        success: true,
        data: {
          roles: {
            admin: adminCount,
            creator: creatorCount,
            billing_manager: billingCount,
            viewer: viewerCount,
          },
          surveys: {
            total: totalSurveys,
            draft: draftCount,
            published: runningCount,
            scheduled: scheduledCount,
            ended: finishedCount,
          },
          subscription: subscriptionData,
        },
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch dashboard stats" });
    }
  },
);

export default router;