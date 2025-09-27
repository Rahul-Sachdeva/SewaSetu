import mongoose from "mongoose";

const incomingRequestSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssistanceRequest",
      required: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "accepted", "in_progress", "fulfilled", "ignored"],
      default: "new",
    },
    notifiedAt: {
      type: Date,
      default: Date.now, // when FCM notification was sent
    },
    read: {
      type: Boolean,
      default: false, // whether NGO has read the notification
    },
    emergency: {
      type: Boolean,
      default: false, // true if the request is marked as emergency
    }
  },
  { timestamps: true }
);

export const IncomingRequest = mongoose.model("IncomingRequest", incomingRequestSchema);
