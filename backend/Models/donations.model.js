import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
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
            enum: ["food", "clothes", "medicines", "funds"]
        },
        images: [String],
        quantity: String,
        condition: String,
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        donation_status: {
            type: String,
            enum: ["open", "assigned", "delivered", "cancelled"],
        },
        assigned_ngo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO"
        },
        pickup_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pickup"
        },
        pickup_coordinates: {
            type: [Number],
            required: true,
        },
        city: {
            type: String,
            required: true,
        }
    }
)