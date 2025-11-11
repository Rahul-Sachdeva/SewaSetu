import { DonationNotification } from "../Models/don_notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    let userId = req.user._id.toString(); // ensure string form
    const userModel = req.user.user_type === "ngo" ? "NGO" : "User"; // or check user_type if used
    if(userModel=="NGO"){
      userId = req.user.ngo.toString();
    }
    const notifications = await DonationNotification.find({ user: userId, userModel })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications", error: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await DonationNotification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark notification read", error: err.message });
  }
};
