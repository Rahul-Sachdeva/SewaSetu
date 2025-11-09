// Models/post.model.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["post", "story", "reel"], default: "post" },
  title: String,
  content: String,
  mediaUrl: String,
  status: {
    type: String,
    enum: ["pending", "published", "flagged", "removed"],
    default: "pending"
  },
  verified: { type: Boolean, default: false },
  expiresAt: Date,
  trendingScore: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  reports: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export const Post = mongoose.model("Post", postSchema);
