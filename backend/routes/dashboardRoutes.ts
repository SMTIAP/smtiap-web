import { Router, Request, Response } from "express";
import { protect } from "../middleware/auth.js";
import UserTenantRole from "../models/UserTenantRole.js";
import Survey from "../models/Survey.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const router = Router();

router.get("/stats", protect, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as Request & { user?: { _id?: string } }).user;
    const userId = currentUser?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // --- SURVEY COUNTS ---
    // Find tenant memberships for this user (if any)
    const memberships = await UserTenantRole.find({
      userId: userObjectId,
    }).lean();
    const tenantIds = memberships.map((m) => m.tenantId);
    const tenantIdStrings = tenantIds.map((id) => String(id));

    // --- USER ROLE COUNTS ---
    // Count from both User.role (global) and UserTenantRole (per-tenant).
    // Use User.role for admin/viewer/billing_manager since those are set on User.
    // Use UserTenantRole for creator since that role lives there.
    const [adminCount, creatorCount, billingCount, viewerCount] =
      await Promise.all([
        User.countDocuments({ role: "admin" }),
        UserTenantRole.countDocuments({ role: "creator" }),
        User.countDocuments({ role: "billing_manager" }),
        User.countDocuments({ role: "viewer" }),
      ]);

    // Count surveys in user's tenant(s) OR created by this user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const surveyFilter: any = {
      $or: [
        ...(tenantIdStrings.length
          ? [{ tenantId: { $in: tenantIdStrings } }]
          : []),
        { createdBy: userObjectId },
      ],
    };

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
    const subscription = tenantIds.length
      ? await Subscription.findOne({ tenant_id: { $in: tenantIds } })
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
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
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
});

export default router;
