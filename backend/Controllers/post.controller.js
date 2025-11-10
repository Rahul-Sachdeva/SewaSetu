// Controllers/post.controller.js
import { Post } from "../Models/post.model.js";
import { moderateText, moderateImage, moderateVideo } from "../Utils/moderation.js";
import uploadCloudinary from "../Utils/cloudinary.js";
import { Like } from "../Models/like.model.js";
import { updateUserPoints } from "../Controllers/user.controller.js";

// CREATE Post / Story / Reel
export const createPost = async (req, res) => {
  try {
    const { type, title, content } = req.body;

    let mediaUrl = "";
    let isVideo = false;

    // Upload to Cloudinary if file provided
    if (req.file) {
      isVideo = req.file.mimetype.startsWith("video") || req.file.mimetype.startsWith("text/plain");
      if(!isVideo && type=="reel"){
        return res.status(400).json({message: "Only Videos are allowed for Reels"});
      }
      const uploadResult = await uploadCloudinary(req.file.buffer);
      mediaUrl = uploadResult.secure_url || uploadResult.url;
    }

    // Story expiration logic
    const expiresAt =
      type === "story" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

    // Moderate text
    const textResult = await moderateText(`${title || ""} ${content || ""}`);

    // Moderate media (if exists)
    let mediaResult = { status: "safe" };
    if (mediaUrl) {
      mediaResult = isVideo
        ? await moderateVideo(mediaUrl)
        : await moderateImage(mediaUrl);
    }

    // Final moderation decision
    const finalStatus =
      textResult === "unsafe" || mediaResult.status === "unsafe"
        ? "pending"
        : "published";

    // Create the post
    const post = await Post.create({
      author: req.user._id,
      type,
      title,
      content,
      mediaUrl,
      expiresAt,
      status: finalStatus,
      verified: finalStatus === "published",
    });

    // Award points for posting content (example: 10 points)
    if(finalStatus === "published"){
      await updateUserPoints(req.user._id, "post_content", 10);
    }

    res.status(201).json({
      success: true,
      message:
        finalStatus === "published"
          ? "✅ Post published successfully."
          : "⚠️ Post pending admin review (content flagged).",
      post,
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ success: false, message: "Failed to create post" });
  }
};


/**
 * GET Posts (published or verified)
 */
export const getPosts = async (req, res) => {
  try {
    const { type="post", page = 1, limit = 10 } = req.query;
    const userId = req.user?._id;

    const query = {
      status: "published",
      ...(type ? { type } : {}),
    };

    const skip = (page - 1) * limit;

    const posts = await Post.find(query)
      .populate("author", "name profile_image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Post.countDocuments(query);

    // If user is logged in, fetch liked posts
    let likedIds = [];
    if (userId) {
      const likes = await Like.find({ user: userId }).select("post");
      likedIds = likes.map((l) => l.post.toString());
    }

    const enrichedPosts = posts.map((post) => ({
      ...post,
      isLiked: likedIds.includes(post._id.toString()),
    }));

    res.json({
      success: true,
      posts: enrichedPosts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};
/**
 * REPORT Post (user)
 */
export const reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.reports.push({ user: req.user._id, reason });
    post.status = "flagged";
    await post.save();

    res.json({ success: true, message: "Post reported and flagged for review" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to report post" });
  }
};

/**
 * ADMIN - Review/Update Status (publish/remove/verify)
 */
export const reviewPost = async (req, res) => {
  try {
    const { status, verified } = req.body; // expected status: "published", "removed", etc.
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.status = status || post.status;
    if (verified !== undefined) post.verified = verified;
    await post.save();

    res.json({ success: true, post, message: "Post status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update post status" });
  }
};

/**
 * Update trending score (increment on like/comment)
 */
export const updateTrendingScore = async (req, res, internal = false) => {
  try {
    const { id } = req.params || req.body; // support both direct route + internal calls
    const post = await Post.findById(id);

    if (!post) {
      if (internal) return; // silent fail if called internally
      return res.status(404).json({ message: "Post not found" });
    }

    // Weighted formula (customizable)
    // You can tweak these based on platform behavior
    const score =
      post.likesCount * 2 +
      post.commentsCount * 3 +
      (Date.now() - post.createdAt.getTime()) / -10000000; // decay with age

    post.trendingScore = Math.max(score, 0);
    await post.save();

    if (!internal) {
      res.json({
        success: true,
        message: "Trending score updated",
        score: post.trendingScore,
      });
    }
  } catch (err) {
    console.error("Error updating trending score:", err);
    if (!internal) res.status(500).json({ message: "Error updating score" });
  }
};
/**
 * GET Flagged Posts (Admin only)
 */
export const getFlaggedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "flagged" }).populate("author", "name role");
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch flagged posts" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.deleteOne();

    return res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name username avatar")
      .lean();

    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getReelsTrending = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user?._id; // comes from auth middleware

    // 1️⃣ Fetch trending published reels
    const reels = await Post.find({
      type: "reel",
      status: "published",
    })
      .sort({ trendingScore: -1, createdAt: -1 })
      .limit(limit)
      .populate("author", "username avatar")
      .lean();

      
    // 2️⃣ If logged in, fetch liked post IDs in one go
    let likedIds = [];
    if (userId) {
      const userLikes = await Like.find({
        user: userId,
      }).select("post");
      likedIds = userLikes.map((like) => like.post.toString());
    }
    
    // 3️⃣ Add isLiked flag to each reel
    const reelsWithIsLiked = reels.map((r) => ({
      ...r,
      isLiked: likedIds.includes(r._id.toString()),
    }));

    return res.json(reelsWithIsLiked);
  } catch (err) {
    console.error("Error fetching trending reels:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getStories = async (req, res) => {
  try {
    const now = new Date();

    // Optionally clean expired stories
    await Post.updateMany(
      { type: "story", expiresAt: { $lte: now }, status: { $ne: "removed" } },
      { status: "removed" }
    );

    const activeStories = await Post.find({
      type: "story",
      status: "published",
      expiresAt: { $gt: now },
    })
      .populate("author", "name profile_image")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(activeStories);
  } catch (err) {
    console.error("Error fetching stories:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ownership check (only author or admin)
    if (post.author.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updates = {
      title: req.body.title || post.title,
      content: req.body.content || post.content,
    };

    // If new media uploaded
    if (req.file) {
      const fileType = req.file.mimetype.startsWith("video") ? "video" : "image";
      const uploadResult = await uploadCloudinary(req.file.buffer);
      const uploadedUrl = uploadResult.secure_url || uploadResult.url;

      // Moderate media
      const moderationResult =
        fileType === "video"
          ? await moderateVideo(uploadedUrl)
          : await moderateImage(uploadedUrl);

      if (moderationResult === "unsafe") {
        return res.status(400).json({ message: "Media content flagged as unsafe" });
      }

      updates.mediaUrl = uploadedUrl;
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updates, { new: true });

    return res.json({ message: "Post updated", post: updatedPost });
  } catch (err) {
    console.error("Error updating post:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
