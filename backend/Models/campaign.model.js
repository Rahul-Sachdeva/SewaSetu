import mongoose from "mongoose";

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
        address: String,
        bannerImage: {

            type: String,
        },
        participants: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
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
            }
        ],
        targetFunds: {
            type: String
        },
        collectedFunds: {
            type: String,
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
)

export const Campaign = mongoose.model("Campaign", campaignSchema);
