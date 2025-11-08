// Controllers/comment.controller.js
import { Comment } from "../Models/comment.model.js";
import { Post } from "../Models/post.model.js";
import { moderateText } from "../Utils/moderation.js";
import { updateTrendingScore } from "./post.controller.js";

export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { content, parentComment } = req.body;
  const userId = req.user._id;

  try {
    // 1️⃣ Text moderation
    const moderationResult = await moderateText(content);
    if (moderationResult === "unsafe") {
      return res.status(400).json({
        success: false,
        message: "Comment contains inappropriate content and was blocked.",
      });
    }

    // 2️⃣ Save comment
    const comment = await Comment.create({
      post: postId,
      user: userId,
      content,
      parentComment: parentComment || null,
    });

    // 3️⃣ Update post comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // 4️⃣ Update trending score
    await updateTrendingScore({ params: { id: postId } }, null, true);

    // 5️⃣ Populate user for client display
    const populated = await comment.populate("user", "name profilePic");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populated,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ success: false, message: "Error adding comment" });
  }
};

// Controllers/comment.controller.js
export const getCommentsWithReplies = async (req, res) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const replyLimit = parseInt(req.query.replyLimit) || 3;

  try {
    const skip = (page - 1) * limit;

    // Fetch top-level comments (no parent)
    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate("user", "name profile_image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get all parent comment IDs
    const commentIds = comments.map((c) => c._id);

    // Fetch limited replies for those comments
    const replies = await Comment.find({ parentComment: { $in: commentIds } })
      .populate("user", "name profile_image")
      .sort({ createdAt: 1 })
      .limit(replyLimit * commentIds.length)
      .lean();

    // Group replies by parent
    const replyMap = {};
    replies.forEach((reply) => {
      if (!replyMap[reply.parentComment]) replyMap[reply.parentComment] = [];
      if (replyMap[reply.parentComment].length < replyLimit) {
        replyMap[reply.parentComment].push(reply);
      }
    });

    // Attach replies to parent comments
    const commentsWithReplies = comments.map((c) => ({
      ...c,
      replies: replyMap[c._id] || [],
    }));

    const total = await Comment.countDocuments({ post: postId, parentComment: null });

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalComments: total,
      comments: commentsWithReplies,
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ success: false, message: "Error fetching comments" });
  }
};

// DELETE /comments/:id
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Authorization check: user owns comment or is admin
    if (comment.user.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // If it's a top-level comment, also delete replies
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: comment._id });
    }

    await comment.deleteOne();

    // Update post’s comment count & trending score
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    await updateTrendingScore({ params: { id: comment.post } }, null, true);

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
