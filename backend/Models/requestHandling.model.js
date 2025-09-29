import mongoose from "mongoose";

const RequestHandlingSchema = new mongoose.Schema(
  {
    request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssistanceRequest",
      required: true,
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "scheduled", "completed", "cancelled"],
      default: "pending", // All new handling entries start as pending
    },
    assignedAt: {
      type: Date,
      default: Date.now, // When the NGO was assigned to this request
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    scheduled_details: {
      volunteer_name: { type: String },
      volunteer_contact: { type: String },
      schedule_date: { type: Date },
      schedule_time: { type: String }, // e.g., "14:30"
    },

    // New Feedback fields
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

    // To track user pickup confirmation
    userConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt managed automatically
  }
);

export const RequestHandling = mongoose.model(
  "RequestHandling",
  RequestHandlingSchema
);
