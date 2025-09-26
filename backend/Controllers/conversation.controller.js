import mongoose from "mongoose";
import { Conversation } from "../Models/conversation.model.js";
import { Message } from "../Models/message.model.js";

// POST /api/v1/conversation
// body: { type, userId?, ngoId?, campaignId? }
export const createConversation = async (req, res) => {
  try {
    const { type, campaignId } = req.body;
    let {receiverId} = req.body;

    const currentUserId = req.user._id; // Logged-in user
    let conversation;
    receiverId = new mongoose.Types.ObjectId(receiverId);
    console.log(currentUserId, receiverId);

    if (type === "private") {
      if (!receiverId) {
        return res.status(400).json({ message: "receiverId is required for private conversation" });
      }

      // Check if private conversation already exists
      conversation = await Conversation.findOne({
        type: "private",
        "participants.participant": { $all: [currentUserId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          type,
          participants: [
            { participantType: "User", participant: currentUserId },
            { participantType: "User", participant: receiverId },
          ],
        });
      }
    } else if (type === "ngo_followers") {
      if (!receiverId) return res.status(400).json({ message: "ngoId is required for NGO followers" });

      conversation = await Conversation.findOne({ type, ngo: receiverId });
      if (!conversation) {
        conversation = await Conversation.create({ type, ngo: receiverId });
      }
    } else if (type === "campaign") {
      if (!campaignId) return res.status(400).json({ message: "campaignId is required for campaign conversation" });

      conversation = await Conversation.findOne({ type, campaign: campaignId });
      if (!conversation) {
        conversation = await Conversation.create({ type, campaign: campaignId });
      }
    }

    return res.status(200).json(conversation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/conversation
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [
        { "participants.participant": userId }, // conversations where user is a participant
        { type: "ngo_followers", ngo: req.user.ngo }, // optionally, include NGO if user has NGO
      ],
    })
      .populate("participants.participant", "name avatar") // populate participant info
      .populate("ngo", "name logo")                         // populate NGO info
      .populate("campaign", "title bannerImage")           // populate campaign info
      .populate("lastMessage")                             // optional: last message
      .sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    return res.status(500).json({ message: "Error fetching conversations", error: err.message });
  }
};

// GET /api/v1/conversation/:id
export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findById(id)
      .populate("participants.participant", "name avatar") // populate participant name/avatar
      .populate("ngo", "name logo")                         // populate NGO name/logo
      .populate("campaign", "title bannerImage")           // populate campaign title/banner
      .populate("lastMessage");                            // optional: populate lastMessage if needed

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    return res.status(200).json(conversation);
  } catch (err) {
    console.error("Error fetching conversation:", err);
    return res.status(500).json({ message: "Error fetching conversation", error: err.message });
  }
};