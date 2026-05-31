import { Router, type Request, type Response } from "express";
import { protect } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = Router();

// GET /api/notifications — fetch notifications for the authenticated user
router.get("/", protect, async (req: Request, res: Response) => {
  try {
    const user = (req as unknown as Record<string, unknown>).user as {
      _id: string;
    };
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit as string, 10) || 20),
    );
    const skip = (page - 1) * limit;

    const filter = { user_id: user._id, status: "active" };

    const [notifications, totalCount] = await Promise.all([
      Notification.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications." });
  }
});

// GET /api/notifications/unread-count — return count of unread notifications
router.get("/unread-count", protect, async (req: Request, res: Response) => {
  try {
    const user = (req as unknown as Record<string, unknown>).user as {
      _id: string;
    };
    const count = await Notification.countDocuments({
      user_id: user._id,
      read_at: null,
      status: "active",
    });
    res.json({ success: true, count });
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to count unread notifications.",
      });
  }
});

// PATCH /api/notifications/:id/read — mark a single notification as read
router.patch("/:id/read", protect, async (req: Request, res: Response) => {
  try {
    const user = (req as unknown as Record<string, unknown>).user as {
      _id: string;
    };
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: user._id, read_at: null },
      { read_at: new Date() },
      { new: true },
    );
    if (!notification) {
      res
        .status(404)
        .json({
          success: false,
          message: "Notification not found or already read.",
        });
      return;
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to mark notification as read.",
      });
  }
});

// PATCH /api/notifications/read-all — mark all notifications as read
router.patch("/read-all", protect, async (req: Request, res: Response) => {
  try {
    const user = (req as unknown as Record<string, unknown>).user as {
      _id: string;
    };
    await Notification.updateMany(
      { user_id: user._id, read_at: null, status: "active" },
      { read_at: new Date() },
    );
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to mark all notifications as read.",
      });
  }
});

export default router;
