// Routes/post.router.js
import express from "express";
import multer from "multer";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getReelsTrending,
  getStories,
  reportPost,
  reviewPost,
  updateTrendingScore,
  getFlaggedPosts
} from "../Controllers/post.controller.js";
import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const postRouter = express.Router();

// Create Post / Story / Reel
postRouter.post(
  "/",
  authMiddleware,
  upload.single("media"),
  createPost
);

// List Published Posts
postRouter.get("/", authMiddleware, getPosts);

// Get Single Post
postRouter.get("/:id", getPostById);

// Update Post
postRouter.put("/:id", authMiddleware, upload.single("media"), updatePost);

// Delete Post
postRouter.delete("/:id", authMiddleware, deletePost);

// Report Post
postRouter.post("/:id/report", authMiddleware, reportPost);

// Update Trending Score
postRouter.post("/:id/trending", authMiddleware, updateTrendingScore);

// Get Trending Reels
postRouter.get("/reels/trending", authMiddleware, getReelsTrending);

// Get Active Stories
postRouter.get("/stories/active", getStories);

// ADMIN: Review / Verify / Remove Posts
postRouter.post(
  "/:id/review",
  authMiddleware,
  roleMiddleware(["admin"]),
  reviewPost
);

// ADMIN: Get Flagged Posts
postRouter.get(
  "/flagged/all",
  authMiddleware,
  roleMiddleware(["admin"]),
  getFlaggedPosts
);

export default postRouter;
