import mongoose from "mongoose";
import shortid from "shortid"; // For generating unique short IDs

const AssistanceRequestSchema = new mongoose.Schema(
  {
    request_id: {
      type: String,
      unique: true,
      default: () => `REQ-${shortid.generate()}`, // Auto-generate ID like REQ-Jk3lP9
    },
    full_name: {
      type: String,
      required: true,
    },
    phone: {
      type: String, // optional
    },
    address: {
      type: String,
      required: true,
    },
    location_coordinates: {
      type: [Number], // [longitude, latitude], optional
      default: undefined,
    },
    category: {
      type: String, // Assistance Category
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Normal", "Urgent", "Emergency"],
      default: "Normal",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open", // All requests start as open
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    selectedNGOs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NGO",
      },
    ],
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export const AssistanceRequest = mongoose.model(
  "AssistanceRequest",
  AssistanceRequestSchema
);
