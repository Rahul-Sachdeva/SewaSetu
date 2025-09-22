import { Message } from "../Models/message.model.js";
import { Conversation } from "../Models/conversation.model.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, attachments } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      senderType: "user",
      text,
      attachments,
      readBy: [req.user._id],
      readByType: "user",
    });

    // Update lastMessage in conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    // Emit socket event
    req.io.to(conversationId).emit("newMessage", message);

    return res.status(201).json(message);
  } catch (err) {
    return res.status(500).json({ message: "Error sending message", error: err.message });
  }
};

// Fetch messages in a conversation
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ conversation: id })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
};
