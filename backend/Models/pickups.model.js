import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema(
    {
        donation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Donation",
            required: true
        },
        volunteer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },  
        ngo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO"
        },
        pickup_coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        drop_coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        status: {
            type: String,
            enum: ["scheduled", "in progress", "completed", "failed", "cancelled"],
            default: "scheduled"
        },
        scheduledAt: {
            type: Date,
        },
        pickedAt: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
        images: [String],
        delivery_notes: {   
            type: String,
        }
    },
    {timestamps: true}
)

export const Pickup = mongoose.model("Pickup", pickupSchema);