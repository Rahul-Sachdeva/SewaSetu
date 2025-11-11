import mongoose from "mongoose";

const DonationNotificationSchema = new mongoose.Schema(
  {
    user: { // recipient (User or NGO)
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userModel"
    },
    userModel: { // dynamic ref: "User" or "NGO"
      type: String,
      required: true,
      enum: ["User", "NGO"]
    },
    type: { // type of notification
      type: String,
      required: true,
      enum: ["donation_received", "donation_status_update", "general", 'test']
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    reference: { // reference ID (e.g., request_id)
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel"
    },
    referenceModel: { // dynamic reference
      type: String,
      enum: ["Donation", "DonationHandling", "Campaign", null],
      default: null
    },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const DonationNotification = mongoose.model("DonationNotification", DonationNotificationSchema);
