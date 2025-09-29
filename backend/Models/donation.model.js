import mongoose from "mongoose";
import shortid from "shortid";


const donationSchema = new mongoose.Schema(
    {
        donation_id: {
            type: String,
            unique: true,
            default: () => `REQ-${shortid.generate()}`, // Auto-generate ID like REQ-Jk3lP9
        },
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        location: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["Food", "Clothes", "Books", "Other"]
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        images: [String],
        pickupDate: {
            type: String,
        },
        pickupTime: {
            type: String,
        },

        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "picked"],
            default: "pending",
        },
        assigned_ngo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO"
        },
        pickup_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pickup"
        },
    }, { timestamps: true }
)

export const Donation = mongoose.model("Donation", donationSchema);