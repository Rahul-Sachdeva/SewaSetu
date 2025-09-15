import { Message } from "../Models/message.model.js";
import { Conversation } from "../Models/conversation.model.js";

// Send a message
export const sendMessage = async(req, res) => {
    try {
        const {conversationId, content} = req.body;

        const message = await Message.create({
            conversationId,
            sender: req.user._id,
            content,
            readby: [req.user._id]
        });

        // Update lastMessage in conversation
        await Conversation.findByIdAndUpdate(conversationId, {lastMessage: message._id});

        // Emit socket event (real-time)
        req.io.to(conversationId).emit("newMessage", message);

        return res.status(201).json(message);
    } catch (err) {
        return res.status(500).json({message: "Error sending message", error: err.message});
    }
};

// Fetch messages in a conversation
export const getMessages = async(req, res) => {
    try {
        const {id} = req.params;
        const messages = await Message.find({conversationId: id})
        .populate("sender", "name email")
        .sort({createdAt: 1})

        return res.status(200).json(messages);
    } catch (err) {
        return res.status(500).json({message: "Error fetching messages", error: err.message});
    }
};
