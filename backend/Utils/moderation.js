import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER;
const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET;

// 🔹 Helper: AI Text Moderation (Hugging Face)
export async function moderateText(content) {
  try {
    const MODEL_URL = "https://router.huggingface.co/hf-inference/models/unitary/toxic-bert";
    const response = await axios.post(
      MODEL_URL,
      { inputs: content },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      }
    );
    const toxicScore = response.data?.[0]?.[0]?.score || 0;
    if (toxicScore > 0.4) return "unsafe";

    // Custom keyword filters for spam/promo
    const spamWords = ["buy", "discount", "sale", "subscribe"];
    if (spamWords.some((w) => content.toLowerCase().includes(w))) return "unsafe";

    return "safe";
  } catch (err) {
    console.warn("Text moderation error:", err.message);
    return "safe"; // fallback to safe to avoid blocking everything
  }
}


/**
 * Analyze an image file or URL via Sightengine
 * @param {string} mediaPathOrUrl - File path or public image URL
 * @returns {Promise<{status: string, score: number, reasons: string[], raw: object}>}
 */
export async function moderateImage(mediaPathOrUrl) {
  try {
    const form = new FormData();

    // Use URL or direct file stream
    if (mediaPathOrUrl.startsWith("http")) {
      form.append("url", mediaPathOrUrl);
    } else {
      form.append("media", fs.createReadStream(mediaPathOrUrl));
    }

    // Use your configured workflow
    form.append("workflow", "wfl_jupZBXXZfJUurQNJXNuPX");
    form.append("api_user", SIGHTENGINE_USER);
    form.append("api_secret", SIGHTENGINE_SECRET);

    const { data } = await axios.post(
      "https://api.sightengine.com/1.0/check-workflow.json",
      form,
      { headers: form.getHeaders() }
    );

    const summary = data.summary || {};
    const action = summary.action || "accept";
    const rejectProb = summary.reject_prob || 0;
    const rejectReason = summary.reject_reason || [];

    return {
      status: action === "reject" ? "unsafe" : "safe",
      score: Number(rejectProb.toFixed(3)),
      reasons: rejectReason,
      raw: data,
    };
  } catch (err) {
    console.warn("❗ Image moderation failed:", err.message);
    return { status: "safe", score: 0, reasons: ["error"], raw: {} };
  }
}

/**
 * Analyze a short video (<1 minute) via Sightengine
 * @param {string} videoPath - Full local path to the video file
 * @returns {Promise<{status: string, score: number, reasons: string[], raw: object}>}
 */
export async function moderateVideo(videoPath) {
  try {
    const form = new FormData();
    form.append("media", fs.createReadStream(videoPath));
    form.append("workflow", "wfl_juq7JWOMQjphLBnp8jlA6");
    form.append("api_user", SIGHTENGINE_USER);
    form.append("api_secret", SIGHTENGINE_SECRET);

    const { data } = await axios.post(
      "https://api.sightengine.com/1.0/video/check-sync.json",
      form,
      { headers: form.getHeaders() }
    );

    const summary = data.summary || {};
    const action = summary.action || "accept";
    const rejectProb = summary.reject_prob || 0;
    const rejectReason = summary.reject_reason || [];

    return {
      status: action === "reject" ? "unsafe" : "safe",
      score: Number(rejectProb.toFixed(3)),
      reasons: rejectReason,
      raw: data,
    };
  } catch (err) {
    console.warn("❗ Video moderation failed:", err.message);
    return { status: "safe", score: 0, reasons: ["error"], raw: {} };
  }
}

