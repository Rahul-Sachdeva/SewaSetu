// Controllers/like.controller.js
import { Like } from "../Models/like.model.js";
import { Post } from "../Models/post.model.js";
import { updateTrendingScore } from "./post.controller.js";

export const toggleLike = async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.params;

  try {
    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      await existingLike.deleteOne();
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      await updateTrendingScore({ params: { id: postId } }, null, true);
      return res.json({ liked: false, message: "Post unliked" });
    } else {
      await Like.create({ post: postId, user: userId });
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
      await updateTrendingScore({ params: { id: postId } }, null, true);
      return res.json({ liked: true, message: "Post liked" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error toggling like" });
  }
};
