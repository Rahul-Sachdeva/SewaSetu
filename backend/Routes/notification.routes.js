import express from "express";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { getNotifications, markNotificationRead } from "../Controllers/notification.controller.js";
import { sendNotification } from "../Utils/notification.utils.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/:id/read", authMiddleware, markNotificationRead);
router.post("/test-notification", async (req, res) => {
  try {
    const ngoId = "68d8e717b84c7f999dcb4f96"; // Replace with a valid NGO _id in your DB
    const success = await sendNotification(ngoId, "NGO", {
      title: "Test Notification",
      message: "This is a test notification to check push delivery.",
      type: "test"
    });

    if (success) return res.status(200).json({ message: "Test notification sent successfully" });
    else return res.status(500).json({ message: "Failed to send test notification" });
  } catch (error) {
    return res.status(500).json({ message: "Error in test notification", error: error.message });
  }
});


export default router;
