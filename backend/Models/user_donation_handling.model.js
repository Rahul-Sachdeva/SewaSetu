import mongoose from "mongoose";

const UserDonationHandlingSchema = new mongoose.Schema(
  {
    donation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",      // NGO has not yet responded
        "accepted",     // NGO accepted the donation
        "rejected",     // NGO rejected the donation
        "scheduled",    // Pickup scheduled
        "picked",       // Donation picked up
        "completed",    // Donation processed/used
        "cancelled",    // Cancelled by donor or NGO
      ],
      default: "pending",
    },

    assignedAt: {
      type: Date,
      default: Date.now, // When NGO took responsibility
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },

    // 📦 Pickup scheduling info
    pickup_details: {
      volunteer_name: { type: String },
      volunteer_contact: { type: String },
      pickup_date: { type: Date },
      pickup_time: { type: String }, // e.g., "15:00"
    },

    // ⭐ Feedback info (from donor)
    feedbackGiven: {
      type: Boolean,
      default: false,
    },
    feedbackRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedbackComments: {
      type: String,
      default: "",
    },
    feedbackDate: {
      type: Date,
    },

    // ✅ Confirmation that donor handed over the items
    donorConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export const UserDonationHandling = mongoose.model(
  "UserDonationHandling",
  UserDonationHandlingSchema
);
