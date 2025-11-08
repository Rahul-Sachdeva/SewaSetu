import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { BaseURL } from "@/BaseURL";
import { motion } from "framer-motion";
import { MessageCircle, Heart, MoreHorizontal, Send, X } from "lucide-react";

export default function Feed({ navigate }) {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [commentModal, setCommentModal] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const token = localStorage.getItem("token");

  // 🆕 Infinite Scroll State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  // 🧭 Load posts (modified for pagination)
  const loadPosts = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BaseURL}/api/v1/posts?sort=trending&page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prevPosts) => {
        // Filter out duplicates based on _id
        const newPosts = data.posts.filter(
          (newPost) => !prevPosts.some((prevPost) => prevPost._id === newPost._id)
        );
        return [...prevPosts, ...newPosts];
      });

      const newLikes = {};
      const newLikeCounts = {};

      data.posts.forEach((p) => {
        newLikes[p._id] = !!p.isLiked;
        newLikeCounts[p._id] = p.likesCount;
      });

      setLikedPosts((prev) => ({ ...prev, ...newLikes }));
      setLikeCounts((prev) => ({ ...prev, ...newLikeCounts }));

      setHasMore(data.posts.length > 0);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load feed:", err);
      setLoading(false);
    }
  }, [token]);

  // 🆕 Infinite Scroll Observer
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // 🆕 Trigger loadPosts on page change
  useEffect(() => {
    loadPosts(page);
  }, [page, loadPosts]);

  // ❤️ Toggle like
  const toggleLike = useCallback(
    async (postId) => {
      const isLiked = likedPosts[postId];

      // Optimistic UI update
      setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: Math.max(0, (prev[postId] || 0) + (isLiked ? -1 : 1)),
      }));

      try {
        await axios.post(
          `${BaseURL}/api/v1/likes/${postId}/toggle`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Like failed:", err);
        // revert on failure
        setLikedPosts((prev) => ({ ...prev, [postId]: isLiked }));
        setLikeCounts((prev) => ({
          ...prev,
          [postId]: Math.max(0, (prev[postId] || 0) + (isLiked ? 1 : -1)),
        }));
      }
    },
    [token, likedPosts]
  );

  // 💬 Fetch comments
  const openComments = async (postId) => {
    setCommentModal(postId);
    try {
      const { data } = await axios.get(`${BaseURL}/api/v1/comments/${postId}`);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  // ➕ Add comment
  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      const { data } = await axios.post(
        `${BaseURL}/api/v1/comments/${postId}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => [data.comment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // 📰 Feed rendering
  return (
    <div className="flex flex-col items-center w-full bg-gray-50 min-h-screen pb-10">
      {posts.map((post, index) => {
        if (posts.length === index + 1) {
          return (
            <motion.div
              ref={lastPostElementRef}
              key={post._id}
              className="w-full max-w-[700px] bg-white rounded-2xl shadow-md mb-6 overflow-hidden border border-gray-200"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Post Content (Same as before) */}
              {renderPostContent(post)}
            </motion.div>
          );
        } else {
          return (
            <motion.div
              key={post._id}
              className="w-full max-w-[700px] bg-white rounded-2xl shadow-md mb-6 overflow-hidden border border-gray-200"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Post Content (Same as before) */}
              {renderPostContent(post)}
            </motion.div>
          );
        }
      })}

      {loading && (
        <div className="text-gray-500 py-4">Loading more posts...</div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-gray-500 py-4">No more posts to load.</div>
      )}

      {/* 🗨️ Comment Modal (Same as before) */}
      {commentModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5 relative">
            <button
              onClick={() => setCommentModal(null)}
              className="absolute top-3 right-3 text-gray-500"
            >
              <X size={22} />
            </button>

            <h3 className="text-lg font-semibold mb-3">Comments</h3>

            <div className="max-h-80 overflow-y-auto mb-4">
              {comments.length ? (
                comments.map((c) => (
                  <div key={c._id} className="mb-3 flex gap-2">
                    <img
                      src={c.user?.profile_image || "/default-avatar.png"}
                      className="w-8 h-8 border-2 rounded-full object-cover"
                      alt="avatar"
                    />
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold">
                          {c.user?.name}
                        </span>{" "}
                        {c.content}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No comments yet.</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring"
              />
              <button
                onClick={() => handleAddComment(commentModal)}
                className="text-blue-500 font-semibold"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to render post content to avoid duplication
  function renderPostContent(post) {
    return (
      <>
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div
            onClick={() => navigate(`/ngo/${post.author?._id}`)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src={post.author?.profile_image || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 object-cover"
            />
            <span className="font-semibold text-gray-800">
              {post.author?.name || "Unknown"}
            </span>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Media */}
        {post.mediaUrl && (
          <div className="w-full">
            {(post.mediaUrl.endsWith(".mp4") || post.mediaUrl.endsWith(".webm")) ? (
              <video
                src={post.mediaUrl}
                controls
                className="w-full max-h-[600px] object-contain"
              />
            ) : (
              <img
                src={post.mediaUrl}
                alt="post"
                className="w-full max-h-[600px] object-contain"
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleLike(post._id)}
              className={`transition-transform duration-150 active:scale-90 ${
                likedPosts[post._id] ? "text-red-500" : "text-gray-700"
              }`}
            >
              <Heart
                size={25}
                fill={likedPosts[post._id] ? "red" : "none"}
                strokeWidth={1.8}
              />
            </button>

            <button
              onClick={() => openComments(post._id)}
              className="text-gray-700 hover:text-gray-900"
            >
              <MessageCircle size={24} />
            </button>

            <button className="text-gray-700 hover:text-gray-900">
              <Send size={22} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 pb-3">
          <p className="font-semibold text-gray-800">
            {likeCounts[post._id] || 0} likes
          </p>
          <h3 className="font-semibold mt-1">{post.title}</h3>
          <p className="text-gray-700 text-sm mb-2">{post.content}</p>

          <button
            onClick={() => openComments(post._id)}
            className="text-gray-500 text-xs hover:text-gray-700"
          >
            View all {post.commentsCount} comments
          </button>
        </div>
      </>
    );
  }
}