import mongoose from "mongoose";

const assistanceRequestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["food", "clothes", "medicine", "shelter", "rescue", "funds", "others"],
            required: true
        },
        urgencyLevel: {
            type: String,
            enum: ["within_a_month","within_a_week", "within_2_days", "within_a_day","immediate"],
            default: "within_a_week"
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        location_coordinates: {
            type: [Number], 
            required: true, // [lng, lat]
        },
        address: String,
        status: {
            type: String,
            enum: ["open", "in_progress", "fulfilled", "cancelled"],
            default: "open"
        },
        fulfilledAt: { type: Date }
    },
    {timestamps: true}
);

export const AssistanceRequest = mongoose.model("AssistanceRequest", assistanceRequestSchema);
