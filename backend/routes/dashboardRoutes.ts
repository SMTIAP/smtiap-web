import { Router, Request, Response } from "express";
import { protect } from "../middleware/auth.js";
import { loadTenant } from "../middleware/tenant.js";
import UserTenantRole from "../models/UserTenantRole.js";
import Survey from "../models/Survey.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
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

      // --- TENANT CONTEXT (loaded by loadTenant middleware) ---
      const tenantIds = ((req as any).tenantIds as string[]) ?? [];
      const tenantObjectIds = tenantIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      // --- USER ROLE COUNTS (scoped to tenant) ---
      // Only count users that belong to the same tenant(s) as the current user.
      // We look at UserTenantRole to find all userIds in this tenant, then count by role.
      const [adminCount, creatorCount, billingCount, viewerCount] =
        tenantObjectIds.length > 0
          ? await Promise.all([
              UserTenantRole.countDocuments({
                tenantId: { $in: tenantObjectIds },
                role: "admin",
              }),
              UserTenantRole.countDocuments({
                tenantId: { $in: tenantObjectIds },
                role: "creator",
              }),
              UserTenantRole.countDocuments({
                tenantId: { $in: tenantObjectIds },
                role: "billing_manager",
              }),
              UserTenantRole.countDocuments({
                tenantId: { $in: tenantObjectIds },
                role: "viewer",
              }),
            ])
          : [0, 0, 0, 0];

      // Count surveys in user's tenant(s)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const surveyFilter: any =
        tenantIds.length > 0
          ? { tenantId: { $in: tenantIds } }
          : { createdBy: userObjectId };

      const withStatus = (status: string) => ({
        $and: [surveyFilter, { status }],
      });

      const [totalSurveys, draftCount, runningCount, finishedCount] =
        await Promise.all([
          Survey.countDocuments(surveyFilter),
          Survey.countDocuments(withStatus("Draft")),
          Survey.countDocuments(withStatus("Running")),
          Survey.countDocuments(withStatus("Finished")),
        ]);

      // --- SUBSCRIPTION ---
      const subscription = tenantObjectIds.length
        ? await Subscription.findOne({ tenant_id: { $in: tenantObjectIds } })
            .sort({ end_date: -1 })
            .lean()
        : null;

      let subscriptionData = null;
      if (subscription) {
        const now = new Date();
        const endDate = new Date(subscription.end_date);
        const startDate = new Date(subscription.start_date);
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
          plan: subscription.plan,
          status: subscription.status,
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
