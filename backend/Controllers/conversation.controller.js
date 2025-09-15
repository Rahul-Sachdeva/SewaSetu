import { Conversation } from "../Models/conversation.model.js";
import { Message } from "../Models/message.model.js";

// Create or get conversation
export const createConversation = async(req, res) => {
    try {
        const {receiverId} = req.body;

        // check if conversation exists
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, receiverId]}
        });

        if(!conversation){
            conversation = await Conversation.create({
                participants: [req.user._id, receiverId]
            });
        }

        return res.status(200).json(conversation);
    } catch (err) {
        return res.status(500).json({ message: "Error creating Conversation", error: err.message});
    }
}

// Fetch all conversations of a user
export const getUserConversations = async(req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate("participants", "name email")
        .populate("lastMessage");

        return res.status(200).json(conversations);
    } catch (err) {
        return res.status(500).json({message: "Error fetching conversations", error: err.message});
    }
};
