import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                participantType: { 
                    type: String, 
                    enum: ["User", "NGO"], 
                    required: true 
                },
                participant: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    refPath: "participants.participantType"
                }
            }
        ],
        ngo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO"
        },
        isGroup: {
            type: Boolean,
            default: false,
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    },
    {timestamps: true}
)