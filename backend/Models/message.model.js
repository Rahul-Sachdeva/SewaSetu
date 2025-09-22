import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["User", "NGO"],
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderType",
    },
    text: {
      type: String,
    },
    attachments: [String],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "readByType",
      },
    ],
    readByType: {
      type: String,
      enum: ["User", "NGO"],
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
