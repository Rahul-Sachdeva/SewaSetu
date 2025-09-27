import mongoose from "mongoose";

const AssistanceRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ["Submitted", "Accepted", "On the Way", "Completed", "Emergency"],
      default: "Submitted",
    },
    emergency: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

AssistanceRequestSchema.index({ location: "2dsphere" }); // for geo queries

export const AssistanceRequest = mongoose.model("AssistanceRequest", AssistanceRequestSchema);
