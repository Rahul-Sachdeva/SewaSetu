import mongoose from "mongoose";

const fundSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true,
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // or "NGO" if NGOs can also donate
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String, // Razorpay payment_id
  },
  orderId: {
    type: String, // Razorpay order_id
  },
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created",
  },
  campaignUpdated: { type: Boolean, default: false }
}, { timestamps: true });

export const Fund = mongoose.model("Fund", fundSchema);