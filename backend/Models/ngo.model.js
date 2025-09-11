import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String, 
            required: true, 
        },
        phone: {
            type: String,
            required: true,
        },
        darpanID: {
            type: String, 
            required: true, 
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        valiation_certificate: {
            type: String, 
        },
        verification_status: {
            type: String, 
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        campaigns: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Campaign",
            }
        ]
    },
    {timestamps: true}
);

