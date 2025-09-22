import { Conversation } from "../Models/conversation.model.js";
import { Message } from "../Models/message.model.js";

// POST /api/v1/conversation
// body: { type, userId?, ngoId?, campaignId? }
export const createConversation = async (req, res) => {
  try {
    const { type, receiverId, campaignId } = req.body;

    const currentUserId = req.user._id; // Logged-in user
    let conversation;
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

// Fetch all conversations of a user
export const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      "participants.participant": req.user._id,
    })
      .populate("participants.participant", "name email")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching conversations", error: err.message });
  }
};
