import mongoose from "mongoose"

const requestHandlingSchema = new mongoose.Schema(
    {
        request_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AssistanceRequest"
        },
        handlerType: {
            type: String, 
            enum: ["ngo", "volunteer"],
            required: true
        },
        handledBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "handlerType"
        },
        status: {
            type: String,
            enum: ["assigned", "in_progress", "resolved", "failed"],
            default: "assigned"
        },
        resourcesProvided: [
            {
                category: {
                    type: String,
                    enum: ["food", "clothes", "medicine", "shelter", "funds", "others"]
                },
                quantity: String,
            }
        ],
        notes: String,
        images: [String],
        assignedAt: {
            type: Date
        },
        completedAt: {
            type: Date
        }
    },
    {timestamps: true}
)

export const RequestHandling = mongoose.model("RequestHandling", requestHandlingSchema);