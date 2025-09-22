import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "ngo_followers", "campaign"],
      required: true,
      default: "private",
    },
    participants: [
      {
        participantType: {
          type: String,
          enum: ["User", "NGO"],
          required: true,
        },
        participant: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "participants.participantType",
          required: true,
        },
      },
    ],
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "NGO", index: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", index: true },
    isGroup: { type: Boolean, default: false },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
  },
  { timestamps: true }
);

conversationSchema.pre("save", function(next) {
  if (this.type !== "private") this.isGroup = true;
  next();
});

export const Conversation = mongoose.model("Conversation", conversationSchema);
