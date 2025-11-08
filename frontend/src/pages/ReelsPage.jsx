import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Heart, MessageCircle, X } from "lucide-react";
import { BaseURL } from "@/BaseURL";

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [likedReels, setLikedReels] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState([]);
  const [commentModal, setCommentModal] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedRef = useRef(null);
  const token = localStorage.getItem("token");

  // Fetch reels
  const fetchReels = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseURL}/api/v1/posts/reels/trending?page=${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.posts || [];

      setReels((prev) => (p === 1 ? data : [...prev, ...data]));

      // Initialize like state
      const newLikes = {};
      const newCounts = {};
      data.forEach((r) => {
        newLikes[r._id] = !!r.isLiked;
        newCounts[r._id] = r.likesCount || 0;
      });
      setLikedReels((prev) => ({ ...prev, ...newLikes }));
      setLikeCounts((prev) => ({ ...prev, ...newCounts }));
    } catch (err) {
      console.error("Failed to fetch reels", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels(1);
  }, []);

  // Intersection observer for auto-play/pause
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector("video");
          if (!video) return;
          if (entry.isIntersecting) {
            setCurrentIndex(Number(entry.target.dataset.index));
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.9 }
    );

    const cards = container.querySelectorAll(".reel-card");
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [reels]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        scrollToReel(currentIndex + 1);
      } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        scrollToReel(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, reels]);

  const scrollToReel = (index) => {
    const cards = feedRef.current?.querySelectorAll(".reel-card");
    if (!cards || index < 0 || index >= cards.length) return;
    cards[index].scrollIntoView({ behavior: "smooth" });
  };

  // ❤️ Toggle Like
  const toggleLike = async (id) => {
    const isLiked = likedReels[id];
    setLikedReels((prev) => ({ ...prev, [id]: !isLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + (isLiked ? -1 : 1)),
    }));

    try {
      await axios.post(`${BaseURL}/api/v1/likes/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Like failed:", err);
      // revert if failed
      setLikedReels((prev) => ({ ...prev, [id]: isLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [id]: Math.max(0, (prev[id] || 0) + (isLiked ? 1 : -1)),
      }));
    }
  };

  // 💬 Fetch Comments
  const openComments = async (id) => {
    setCommentModal(id);
    try {
      const { data } = await axios.get(`${BaseURL}/api/v1/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  // ➕ Add Comment
  const handleAddComment = async (id) => {
    if (!newComment.trim()) return;
    try {
      const { data } = await axios.post(
        `${BaseURL}/api/v1/comments/${id}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [data.comment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto bg-black text-white flex flex-col items-center">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
        <h1 className="text-lg font-semibold">Reels</h1>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="w-full h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {reels.map((r, i) => (
          <div
            key={r._id}
            data-index={i}
            className="reel-card snap-center relative h-screen w-full flex items-end justify-between overflow-hidden"
          >
            <video
              src={r.mediaUrl}
              playsInline
              loop
              className="absolute inset-0 w-full h-full object-cover"
              onClick={(e) => {
                const video = e.target;
                if (video.paused) video.play();
                else video.pause();
              }}
            />

            {/* Overlay content */}
            <div className="absolute bottom-16 left-5 z-20">
              <p className="font-semibold text-sm">{r.author?.username || "Unknown"}</p>
              <p className="text-xs text-gray-200 mt-1 max-w-[220px]">{r.title}</p>
            </div>

            {/* Right-side actions */}
            <div className="absolute bottom-80 right-6 flex flex-col items-center gap-5 z-20">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => toggleLike(r._id)}
                className={`transition-colors ${
                  likedReels[r._id] ? "text-red-500" : "text-gray-200"
                }`}
              >
                <Heart
                  size={40}
                  fill={likedReels[r._id] ? "red" : "none"}
                  strokeWidth={1.5}
                />
              </motion.button>
              <p className="text-xs text-gray-300">{likeCounts[r._id] || 0}</p>

              <button
                onClick={() => openComments(r._id)}
                className="text-gray-200 hover:text-white"
              >
                <MessageCircle size={40} />
              </button>
              <p className="text-xs text-gray-300">{r.commentsCount || 0}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="h-32 flex items-center justify-center text-sm text-gray-300">
            Loading...
          </div>
        )}
      </div>

      {/* 💬 Comment Modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5 relative text-black">
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
                          {c.user?.name || "User"}
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
}
