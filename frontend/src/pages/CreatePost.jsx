import { useState, useRef } from "react";
import axios from "axios";
import { BaseURL } from "@/BaseURL";
import { Scissors, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function CreatePost() {
  const [type, setType] = useState("post");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  
  // Video trimming states
  const [videoDuration, setVideoDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTrimmer, setShowTrimmer] = useState(false);
  
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const canvasRef = useRef(null);

  const MAX_FILE_SIZE_MB = 500;
  const MAX_VIDEO_DURATION_SEC = 60;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (50MB limit)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert(`File too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    // Check if it's a video
    if (file.type.startsWith("video")) {
      const videoURL = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = videoURL;
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        setVideoDuration(duration);
        setTrimStart(0);
        setTrimEnd(Math.min(duration, MAX_VIDEO_DURATION_SEC));
        setShowTrimmer(true);
      };
    }

    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Loop within trim range
      if (time >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      if (time < trimStart) {
        videoRef.current.currentTime = trimStart;
      }
    }
  };

  const handleTimelineClick = (e) => {
    if (!timelineRef.current || !videoRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * videoDuration;
    
    videoRef.current.currentTime = Math.max(trimStart, Math.min(time, trimEnd));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTrimmedDuration = () => {
    return trimEnd - trimStart;
  };

  const handleTrimStartChange = (e) => {
    const value = parseFloat(e.target.value);
    setTrimStart(value);
    if (trimEnd - value > MAX_VIDEO_DURATION_SEC) {
      setTrimEnd(value + MAX_VIDEO_DURATION_SEC);
    }
  };

  const handleTrimEndChange = (e) => {
    const value = parseFloat(e.target.value);
    const maxEnd = Math.min(value, trimStart + MAX_VIDEO_DURATION_SEC);
    setTrimEnd(maxEnd);
  };

  const trimVideoWithCanvas = async (videoFile, startTime, endTime) => {
  return new Promise((resolve, reject) => {
    // Status updater helper (assuming setProcessingStatus is available in scope)
    const updateStatus = (msg) => {
      if (typeof setProcessingStatus === 'function') {
        setProcessingStatus(msg);
      } else {
        console.log(msg);
      }
    };

    updateStatus('Loading video...');

    const video = document.createElement('video');
    // Use a stable URL for the blob
    video.src = URL.createObjectURL(videoFile);
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    // CRITICAL: video must NOT be muted for createMediaElementSource to work reliably
    // We will prevent playback feedback by NOT connecting it to the speakers later.
    video.muted = false;
    video.volume = 1.0;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      try {
        // 1. Set up Canvas for visual resizing/trimming
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Cap at 720p for performance, maintain aspect ratio
        const scale = Math.min(1, 1280 / video.videoWidth);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;

        // 2. Set up Audio Context
        // We need a user interaction for AudioContext usually, but if this function
        // is called directly from a click handler it should work.
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        
        // Create a destination for the audio to go to the MediaRecorder
        const audioDestination = audioCtx.createMediaStreamDestination();
        
        // Create source from video element
        const source = audioCtx.createMediaElementSource(video);
        
        // Connect source -> destination (recorder)
        source.connect(audioDestination);
        // IMPORTANT: Do NOT connect to audioCtx.destination to avoid hearing it during processing
        // source.connect(audioCtx.destination); 

        // 3. Combine Video (from Canvas) and Audio (from WebAudio) into one stream
        const canvasStream = canvas.captureStream(30); // 30 FPS target
        const combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioDestination.stream.getAudioTracks()
        ]);

        // 4. Set up MediaRecorder
        let mediaRecorder;
        const mimeTypes = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
          'video/mp4'
        ];

        for (const type of mimeTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mediaRecorder = new MediaRecorder(combinedStream, {
              mimeType: type,
              videoBitsPerSecond: 2500000 // 2.5 Mbps
            });
            console.log(`Using mimeType: ${type}`);
            break;
          }
        }

        if (!mediaRecorder) {
          reject(new Error('No supported video mimeType found for MediaRecorder'));
          return;
        }

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
          
          // Cleanup
          URL.revokeObjectURL(video.src);
          if (audioCtx.state !== 'closed') audioCtx.close();
          video.remove();
          canvas.remove();
          
          updateStatus('Processing complete!');
          resolve(blob);
        };

        mediaRecorder.onerror = (e) => reject(e.error);

        // 5. Perform the Trim
        // Wait for audio context to be ready
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        video.currentTime = startTime;

        // We wait for 'seeked' to ensure video is exactly at startTime before recording
        video.onseeked = () => {
            // Remove listener to prevent loops if we seek again later (unlikely here but good practice)
            video.onseeked = null;
            
            updateStatus('Trimming video...');
            mediaRecorder.start();

            // Use a promise to handle the play() call which can sometimes be blocked
            video.play().then(() => {
              drawFrame();
            }).catch(e => {
               reject(new Error("Auto-play failed. Browser might require user interaction." + e.message));
            });
        };

        const duration = endTime - startTime;

        function drawFrame() {
          // Stop conditions
          if (video.paused || video.ended || video.currentTime >= endTime) {
            if (mediaRecorder.state === 'recording') {
               mediaRecorder.stop();
            }
            video.pause();
            return;
          }

          // Draw current video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Update progress
          const currentProgress = video.currentTime - startTime;
          const percent = Math.min(99, (currentProgress / duration) * 100);
          updateStatus(`Trimming... ${percent.toFixed(0)}%`);

          // Continue loop
          requestAnimationFrame(drawFrame);
        }

      } catch (err) {
        reject(err);
      }
    };

    video.onerror = (e) => reject(new Error('Error loading video file'));
  });
};

  const handleSubmit = async () => {
    if (!media) return alert("Please upload media first!");

    const formData = new FormData();
    formData.append("type", type);
    formData.append("title", title);
    formData.append("content", content);

    try {
      setLoading(true);
      let fileToUpload = media;

      // Trim video if it's a video and trimming is needed
      if (media.type.startsWith("video") && showTrimmer) {
        const needsTrimming = trimStart !== 0 || trimEnd !== videoDuration;
        
        if (needsTrimming) {
          try {
            setProcessingStatus('Preparing to trim...');
            const trimmedBlob = await trimVideoWithCanvas(media, trimStart, trimEnd);
            
            // Determine file extension based on blob type
            const extension = trimmedBlob.type.includes('webm') ? 'webm' : 'mp4';
            
            fileToUpload = new File(
              [trimmedBlob],
              `trimmed_${media.name.replace(/\.[^/.]+$/, '')}.${extension}`,
              { type: trimmedBlob.type }
            );
            
            const trimmedSizeMB = fileToUpload.size / (1024 * 1024);
            console.log(`Trimmed video size: ${trimmedSizeMB.toFixed(2)}MB`);
            
            // Check if trimmed video still exceeds 50MB
            if (trimmedSizeMB > MAX_FILE_SIZE_MB) {
              alert(`Trimmed video is still too large (${trimmedSizeMB.toFixed(1)}MB). Please select a shorter duration.`);
              setLoading(false);
              setProcessingStatus('');
              return;
            }
            
          } catch (error) {
            console.error('Error trimming video:', error);
            alert('Failed to trim video. Please try again or select a different video.');
            setLoading(false);
            setProcessingStatus('');
            return;
          }
        }
      }

      formData.append("media", fileToUpload);

      const token = localStorage.getItem("token");
      
      setProcessingStatus('Uploading...');
      
      const { data } = await axios.post(`${BaseURL}/api/v1/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(data.message);
      
      // Reset form
      setTitle("");
      setContent("");
      setMedia(null);
      setPreview(null);
      setShowTrimmer(false);
      setProcessingStatus("");
      
    } catch (err) {
      console.error(err);
      alert(err.response.data.message);
    } finally {
      setLoading(false);
      setProcessingStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Create {type.charAt(0).toUpperCase() + type.slice(1)}
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["post", "reel"].map((t) => (
          <button
            key={t}
            className={`px-4 py-2 rounded-full transition-colors ${
              type === t ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setType(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Media Upload */}
      <div className="w-full max-w-2xl flex flex-col items-center bg-gray-800 p-6 rounded-2xl shadow-lg">
        {preview ? (
          <>
            {media.type.startsWith("video") ? (
              <div className="w-full">
                <video
                  ref={videoRef}
                  src={preview}
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full rounded-lg mb-4"
                />
                
                {/* File size info */}
                <div className="text-sm text-gray-400 mb-2">
                  Original size: {(media.size / (1024 * 1024)).toFixed(2)}MB
                  {getTrimmedDuration() < videoDuration && (
                    <span className="ml-2 text-blue-400">
                      → Will trim to {formatTime(getTrimmedDuration())}
                    </span>
                  )}
                </div>
                
                {/* Video Trimmer */}
                {showTrimmer && (
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold">Trim Video</span>
                      </div>
                      <span className={`text-sm font-medium ${getTrimmedDuration() > MAX_VIDEO_DURATION_SEC ? 'text-red-400' : 'text-green-400'}`}>
                        {formatTime(getTrimmedDuration())} / {MAX_VIDEO_DURATION_SEC}s max
                      </span>
                    </div>

                    {/* Timeline */}
                    <div 
                      ref={timelineRef}
                      className="relative h-12 bg-gray-600 rounded-lg cursor-pointer mb-4 overflow-hidden"
                      onClick={handleTimelineClick}
                    >
                      {/* Trimmed region */}
                      <div 
                        className="absolute h-full bg-blue-500 bg-opacity-30 border-l-2 border-r-2 border-blue-400"
                        style={{
                          left: `${(trimStart / videoDuration) * 100}%`,
                          width: `${((trimEnd - trimStart) / videoDuration) * 100}%`
                        }}
                      />
                      
                      {/* Current time indicator */}
                      <div 
                        className="absolute top-0 w-0.5 h-full bg-white z-10"
                        style={{
                          left: `${(currentTime / videoDuration) * 100}%`
                        }}
                      />
                      
                      {/* Start handle */}
                      <div 
                        className="absolute top-0 w-1 h-full bg-blue-400 cursor-ew-resize hover:bg-blue-300"
                        style={{
                          left: `${(trimStart / videoDuration) * 100}%`
                        }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-8 bg-blue-400 rounded"></div>
                      </div>
                      
                      {/* End handle */}
                      <div 
                        className="absolute top-0 w-1 h-full bg-blue-400 cursor-ew-resize hover:bg-blue-300"
                        style={{
                          left: `${(trimEnd / videoDuration) * 100}%`
                        }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-8 bg-blue-400 rounded"></div>
                      </div>
                    </div>

                    {/* Range Inputs */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Start Time</label>
                        <input
                          type="range"
                          min="0"
                          max={videoDuration}
                          step="0.1"
                          value={trimStart}
                          onChange={handleTrimStartChange}
                          className="w-full accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{formatTime(trimStart)}</span>
                          <button
                            onClick={() => {
                              setTrimStart(0);
                              if (trimEnd > MAX_VIDEO_DURATION_SEC) {
                                setTrimEnd(MAX_VIDEO_DURATION_SEC);
                              }
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">End Time</label>
                        <input
                          type="range"
                          min={trimStart}
                          max={videoDuration}
                          step="0.1"
                          value={trimEnd}
                          onChange={handleTrimEndChange}
                          className="w-full accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{formatTime(trimEnd)}</span>
                          <button
                            onClick={() => {
                              setTrimEnd(Math.min(videoDuration, trimStart + MAX_VIDEO_DURATION_SEC));
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Max
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Warnings/Info */}
                    {getTrimmedDuration() > MAX_VIDEO_DURATION_SEC ? (
                      <div className="flex items-start gap-2 bg-red-900 bg-opacity-30 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-200">
                          Video duration must be {MAX_VIDEO_DURATION_SEC} seconds or less. Please adjust the trim range.
                        </div>
                      </div>
                    ) : getTrimmedDuration() < videoDuration ? (
                      <div className="flex items-start gap-2 bg-blue-900 bg-opacity-30 p-3 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-200">
                          Video will be trimmed from {formatTime(trimStart)} to {formatTime(trimEnd)} ({formatTime(getTrimmedDuration())} total)
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 bg-green-900 bg-opacity-30 p-3 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-200">
                          Full video will be uploaded ({formatTime(videoDuration)})
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-full rounded-lg mb-4 object-cover"
              />
            )}
            
            <button
              onClick={() => {
                setMedia(null);
                setPreview(null);
                setShowTrimmer(false);
                setVideoInfo(null);
              }}
              className="flex items-center gap-2 text-sm text-red-400 mb-4 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Remove Media
            </button>
          </>
        ) : (
          <label className="w-full border-2 border-dashed border-gray-500 py-10 text-center cursor-pointer rounded-lg hover:bg-gray-700 transition-colors">
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            <div className="text-lg mb-2">📸 Upload Media</div>
            <div className="text-xs text-gray-400">
              Max Trimeed Size: 50 MB • Videos limited to {MAX_VIDEO_DURATION_SEC}s
            </div>
          </label>
        )}

        {/* Title + Caption */}
        <input
          type="text"
          placeholder="Title..."
          className="w-full bg-gray-700 rounded-md p-2 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Write a caption..."
          className="w-full bg-gray-700 rounded-md p-2 mt-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Processing Status */}
        {loading && processingStatus && (
          <div className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            {processingStatus}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || (showTrimmer && getTrimmedDuration() > MAX_VIDEO_DURATION_SEC)}
          className={`mt-5 w-full py-2 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 ${
            loading || (showTrimmer && getTrimmedDuration() > MAX_VIDEO_DURATION_SEC)
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {processingStatus || "Processing..."}
            </>
          ) : (
            "Share"
          )}
        </button>
      </div>
    </div>
  );
}