const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");

// 🔧 Helper response formatter
const sendResponse = (res, status, success, message, data = null) => {
  return res.status(status).json({ success, message, data });
};

// ✅ NEW: POST /api/notifications/send — Send a notification + emit via Socket.IO
router.post("/send", auth, async (req, res) => {
  try {
    const { content, receiverId } = req.body;

    if (!content || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Content and receiverId required",
      });
    }

    const notification = new Notification({
      content,
      sender: req.user.id,
      receiver: receiverId,
    });

    await notification.save();

    // Emit real-time notification via Socket.IO
    if (req.io) {
      req.io.to(receiverId).emit("new_notification", {
        _id: notification._id,
        content: notification.content,
        sender: { _id: req.user.id },
        receiver: receiverId,
        createdAt: notification.createdAt,
      });
    }

    sendResponse(res, 201, true, "Notification sent", notification);
  } catch (err) {
    console.error("❌ Send notification error:", err);
    sendResponse(res, 500, false, "Internal server error");
  }
});

// 📨 GET /api/notifications — Get user's notifications (with optional pagination)
router.get("/", auth, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const notifications = await Notification.find({ receiver: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, 200, true, "Notifications fetched", notifications);
  } catch (err) {
    console.error("❌ Notification fetch error:", err);
    sendResponse(res, 500, false, "Failed to fetch notifications");
  }
});

// ✅ PATCH /api/notifications/:id/read — Mark a single notification as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, receiver: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification)
      return sendResponse(res, 404, false, "Notification not found");

    sendResponse(res, 200, true, "Notification marked as read", notification);
  } catch (err) {
    console.error("❌ Mark single notification read error:", err);
    sendResponse(res, 500, false, "Failed to mark as read");
  }
});

// ✅ PATCH /api/notifications/mark-all-read — Mark all user's notifications as read
router.patch("/mark-all-read", auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { receiver: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    sendResponse(res, 200, true, "All notifications marked as read", {
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("❌ Mark all notifications read error:", err);
    sendResponse(res, 500, false, "Failed to mark all as read");
  }
});
// DELETE /api/notifications/clear-all — Delete all user's notifications
router.delete("/clear-all", auth, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ receiver: req.user.id });
    return sendResponse(res, 200, true, "All notifications cleared", {
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("❌ Clear all notifications error:", err);
    return sendResponse(res, 500, false, "Failed to clear notifications");
  }
});

module.exports = router;
