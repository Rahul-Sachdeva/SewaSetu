import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BaseURL } from "@/BaseURL";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function StoriesBar() {
  const [storyGroups, setStoryGroups] = useState([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const progressRef = useRef([]);

  // --- Refs for timers and video element ---
  const videoRef = useRef(null); // Ref for the <video> element
  const storyTimerRef = useRef(null); // Ref for the setTimeout
  const progressTimerRef = useRef(null); // Ref for the setInterval

  // 🟢 Fetch stories
  useEffect(() => {
    async function fetchStories() {
      try {
        const { data } = await axios.get(`${BaseURL}/api/v1/posts/stories/active`);
        const stories = data || [];
        const grouped = stories.reduce((acc, story) => {
          const userId = story.author?._id;
          if (!userId) return acc;
          if (!acc[userId]) acc[userId] = { author: story.author, stories: [] };
          acc[userId].stories.push(story);
          return acc;
        }, {});
        setStoryGroups(Object.values(grouped));
      } catch (err) {
        console.error("Error loading stories:", err);
      }
    }
    fetchStories();
  }, []);

  // --- Timer Helper Functions ---

  // Helper to clear all active timers
  const clearAllTimers = () => {
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  };

  // Helper to start the progress bar and "next story" timer
  const startTimers = (duration) => {
    // Clear any old timers first
    clearAllTimers();

    let start = Date.now();

    // 1. Reset all progress bars
    progressRef.current.forEach((bar, idx) => {
      if (!bar) return;
      if (idx < activeStoryIndex) bar.style.width = "100%";
      else if (idx === activeStoryIndex) bar.style.width = "0%";
      else bar.style.width = "0%";
    });

    // 2. Start the progress bar animation timer
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min((elapsed / duration) * 100, 100);
      const activeBar = progressRef.current[activeStoryIndex];
      if (activeBar) activeBar.style.width = `${percent}%`;
    }, 100); // Update every 100ms

    // 3. Start the "next story" timer
    storyTimerRef.current = setTimeout(nextStory, duration);
  };

  // --- Updated: Autoplay logic for IMAGES and cleanup ---
  useEffect(() => {
    if (activeGroupIndex === null) {
      clearAllTimers(); // Clean up timers when modal is closed
      return;
    }
    
    const group = storyGroups[activeGroupIndex];
    if (!group) return;
    const currentStory = group.stories[activeStoryIndex];
    if (!currentStory) return;

    const isVideo = currentStory.mediaUrl?.endsWith(".mp4");

    // If it's an IMAGE, start the 5-second timer
    if (!isVideo) {
      startTimers(5000); // 5-second duration for images
    }

    // Cleanup function to run when story changes or modal closes
    return () => {
      clearAllTimers();
    };
  }, [activeStoryIndex, activeGroupIndex]); // Runs when story or group changes

  // --- Updated: Clear timers on manual navigation ---
  const nextStory = () => {
    clearAllTimers(); // Clear timers before moving on
    
    const group = storyGroups[activeGroupIndex];
    if (!group) return;
    if (activeStoryIndex < group.stories.length - 1) {
      setActiveStoryIndex((i) => i + 1);
    } else if (activeGroupIndex < storyGroups.length - 1) {
      setActiveGroupIndex((i) => i + 1);
      setActiveStoryIndex(0);
    } else {
      setActiveGroupIndex(null);
      setActiveStoryIndex(0);
    }
  };

  // --- Updated: Clear timers on manual navigation ---
  const prevStory = () => {
    clearAllTimers(); // Clear timers before moving on

    if (activeStoryIndex > 0) {
      setActiveStoryIndex((i) => i - 1);
    } else if (activeGroupIndex > 0) {
      const prevGroup = storyGroups[activeGroupIndex - 1];
      setActiveGroupIndex((i) => i - 1);
      setActiveStoryIndex(prevGroup.stories.length - 1);
    } else {
      setActiveGroupIndex(null);
      setActiveStoryIndex(0);
    }
  };

  // Helper function to get video duration
  const getVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function() {
        // Clean up the object URL to prevent memory leaks
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = function() {
        URL.revokeObjectURL(video.src);
        reject(new Error("Failed to load video metadata."));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // 🟢 Story upload flow (with 15-second validation)
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // --- Video duration validation logic ---
    if (file.type.startsWith("video/")) {
      try {
        const duration = await getVideoDuration(file);
        
        if (duration > 15) {
          alert("Video is too long. Please select a video 15 seconds or shorter.");
          // Clear the file input
          e.target.value = null; 
          return; // Stop the function here
        }

      } catch (error) {
        console.error(error);
        alert("Could not read video file. Please try another one.");
        e.target.value = null;
        return;
      }
    }
    // --- End of validation logic ---

    // If it's an image or a valid video, proceed
    setSelectedFile(file);
    setShowUploadModal(true);
  };

  const uploadStory = async () => {
    if (!selectedFile) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("type", "story");
      formData.append("title", "Story");
      formData.append("content", "Check out My Story");
      formData.append("media", selectedFile);

      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.post(`${BaseURL}/api/v1/posts`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Story Uploaded Successfully");
      } catch (err) {
        console.error(err);
        alert("Failed to upload. Try again!");
      } finally {
        setShowUploadModal(false);
        setSelectedFile(null);
      }
      // Re-fetch stories
      const { data } = await axios.get(`${BaseURL}/api/v1/posts/stories/active`);
      setStoryGroups(
        Object.values(
          data.reduce((acc, story) => {
            const userId = story.author?._id;
            if (!acc[userId])
              acc[userId] = { author: story.author, stories: [] };
            acc[userId].stories.push(story);
            return acc;
          }, {})
        )
      );
    } catch (err) {
      console.error("Story upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-gray-50">
      <div className="flex max-w-[700px] mx-auto gap-4 overflow-x-auto p-3 scrollbar-hide">
        {/* ➕ Add Story */}
        <div className="flex flex-col items-center cursor-pointer shrink-0">
          <div className="relative">
            <label
              htmlFor="story-upload"
              className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] rounded-full flex items-center justify-center w-16 h-16"
            >
              <Plus className="w-10 h-10 text-white" />
            </label>

            <input
              id="story-upload"
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          <span className="text-xs mt-1 text-center font-medium">Add Story</span>
        </div>

        {/* 👥 Users' Stories */}
        {storyGroups.map((group, idx) => (
          <motion.div
            key={group.author?._id || idx}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center cursor-pointer shrink-0"
            onClick={() => {
              setActiveGroupIndex(idx);
              setActiveStoryIndex(0);
            }}
          >
            <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] rounded-full">
              <img
                src={group.author?.profile_image || "/default-avatar.png"}
                alt={group.author?.name}
                className="w-16 h-16 rounded-full object-cover bg-white"
              />
            </div>
            <span className="text-xs mt-1 truncate w-16 text-center font-medium">
              {group.author?.name || "User"}
            </span>
          </motion.div>
        ))}
      </div>

      {/* 🖼 Story Viewer */}
      <AnimatePresence>
        {activeGroupIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveGroupIndex(null)}
          >
            <motion.div
              className="relative max-w-sm w-full bg-black rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              {/* 🟢 Media */}
              {(() => {
                // Ensure group and story exist before rendering
                if (
                  !storyGroups[activeGroupIndex] ||
                  !storyGroups[activeGroupIndex].stories[activeStoryIndex]
                ) {
                  return null; // or a loading/error state
                }
                const story =
                  storyGroups[activeGroupIndex].stories[activeStoryIndex];

                if (story.mediaUrl.endsWith(".mp4")) {
                  return (
                    // --- Updated: Video tag with ref, key, and onLoadedMetadata ---
                    <video
                      ref={videoRef}
                      key={story.mediaUrl} // Key ensures React re-renders the element
                      src={story.mediaUrl}
                      className="w-full h-[80vh] object-contain"
                      autoPlay
                      playsInline
                      muted // Muted is often required for autoplay
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          // Get duration in seconds, convert to milliseconds
                          const actualDuration = videoRef.current.duration * 1000;
                          startTimers(actualDuration);
                        }
                      }}
                      // onEnded is no longer needed as startTimers handles it
                    />
                  );
                } else {
                  return (
                    <img
                      src={story.mediaUrl}
                      alt="Story"
                      className="w-full h-[80vh] object-contain"
                    />
                  );
                }
              })()}

              {/* 🟣 Segmented Progress Bar */}
              <div className="absolute top-0 left-0 w-full flex gap-1 p-2">
                {storyGroups[activeGroupIndex]?.stories.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1 bg-gray-600 flex-1 rounded overflow-hidden"
                  >
                    <div
                      ref={(el) => (progressRef.current[idx] = el)}
                      className="h-full bg-white w-0 transition-all duration-100 linear"
                    ></div>
                  </div>
                ))}
              </div>

              {/* 🧍 Header */}
              <div className="absolute top-6 left-3 flex items-center gap-2 text-white">
                <img
                  src={
                    storyGroups[activeGroupIndex]?.author?.profile_image ||
                    "/default-avatar.png"
                  }
                  className="w-8 h-8 rounded-full object-cover"
                  alt="author"
                />
                <span className="font-semibold">
                  {storyGroups[activeGroupIndex]?.author?.name}
                </span>
              </div>

              {/* Navigation */}
              <div className="absolute inset-0 flex">
                <div className="w-1/2" onClick={prevStory}></div>
                <div className="w-1/2" onClick={nextStory}></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📤 Upload Confirmation Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              className="bg-white p-5 rounded-2xl w-[90%] max-w-sm text-center relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-2 right-2 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-semibold mb-3">Confirm Story Upload</h2>
              {selectedFile && (
                <>
                  {selectedFile.type.startsWith("video") ? (
                    <video
                      src={URL.createObjectURL(selectedFile)}
                      controls
                      className="w-full h-64 object-contain rounded-lg mb-3"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="preview"
                      className="w-full h-64 object-contain rounded-lg mb-3"
                    />
                  )}
                </>
              )}
              {
              loading? 
              <button
                disabled
                className="bg-blue-300 text-white px-4 py-2 rounded-lg w-full transition"
              >
                Uploading...
              </button>:
              <button
                onClick={uploadStory}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition"
              >
                Upload Story
              </button>
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}