import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        enum: ["volunteer", "donor", "attendee"],
        default: "attendee"
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
});

const campaignSchema = new mongoose.Schema(
    {
        ngo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
        },
        category: {
            type: String,
            enum: ["fundraising", "food_drive", "blood_donation", "medical_camp", "awareness", "others"],
            required: true
        },
        startDate: {
            type: Date, 
            required: true,
        },
        endDate: {
            type: Date, 
            required: true
        },
        location_coordinates: {
            type: [Number],
            required: true
        },
        address: {
            type: String
        },
        bannerImage: {
            type: String,
        },
        participants: [participantSchema],
        targetFunds: {
            type: Number,
            default: 0
        },
        collectedFunds: {
            type: Number,
            default: 0
        },
        targetVolunteers: {
            type: Number, 
            default: 0
        },
        status: {
            type: String,
            enum: ["upcoming", "ongoing", "completed", "cancelled"],
            default: "upcoming"
        }
    },
    {timestamps: true}
);

export const Campaign = mongoose.model("Campaign", campaignSchema);