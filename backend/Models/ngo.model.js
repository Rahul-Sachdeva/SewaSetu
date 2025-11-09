//ngo.model.js
import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        registration_number: { type: String, required: true, unique: true },
        category: { type: [String], required: true, default: [] },

        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        location_coordinates: {
            type: [Number],
            required: true,
        },

        documents: [{ type: String }], // cloudinary URLs
        logo: { type: String },        // NGO logo
        description: { type: String },
        gallery: [{ type: String }],

        verification_status: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },
        pushTokens: {
            type: [String],
            default: []
        },
        points: { type: Number, default: 0 },
        activityHistory: [
            {
                activity: String,
                points: Number,
                date: { type: Date, default: Date.now }
            }
        ],

        account: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
        followers: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        ],
        deviceTokens: [String],
    },
    { timestamps: true }
);

export const NGO = mongoose.model("NGO", ngoSchema);
