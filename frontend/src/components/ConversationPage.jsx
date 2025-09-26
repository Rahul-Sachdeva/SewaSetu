import React, { useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { socket } from "../lib/socket";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../BaseURL";

const ConversationPage = () => {
  const { id: conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [conversationHeader, setConversationHeader] = useState({ title: "", avatar: "" });
  const { user } = useAuth();
  const senderId = user?.id;
  const senderType = user?.role === "user" ? "User" : "NGO";
  const token = localStorage.getItem("token");

  // Fetch conversation details for header
  useEffect(() => {
    const fetchConversationDetails = async () => {
      try {
        const res = await axios.get(`${BaseURL}/api/v1/conversation/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const conv = res.data;

        let header = { title: "Chat", avatar: "" };

        if (conv.type === "private") {
          // Show the other participant
          const otherParticipant = conv.participants.find(
            (p) => p.participant?._id !== user.id
          )?.participant;
          if (otherParticipant) {
            header.title = otherParticipant.name;
            header.avatar = otherParticipant.avatar || ""; // adjust if using profile image
          }
        } else if (conv.type === "ngo_followers") {
          if (conv.ngo) {
            header.title = conv.ngo.name;
            header.avatar = conv.ngo.logo || "";
          }
        } else if (conv.type === "campaign") {
          if (conv.campaign) {
            header.title = conv.campaign.title;
            header.avatar = conv.campaign.bannerImage || "";
          }
        }

        setConversationHeader(header);
      } catch (err) {
        console.error("Error fetching conversation details:", err);
      }
    };

    if (conversationId) fetchConversationDetails();
  }, [conversationId, user]);

  // Load previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${BaseURL}/api/v1/message/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    if (conversationId) fetchMessages();
  }, [conversationId]);

  // Join socket room + listen for new messages
  useEffect(() => {
    socket.emit("joinConversation", conversationId);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [conversationId]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      conversationId,
      text,
      sender: senderId,
      senderType,
    });
  };

  return (
    <div className="flex flex-col h-[100vh] w-full mx-auto border shadow-xl">
      <ChatHeader conversation={conversationHeader} />
      <MessageList messages={messages} currentUserId={senderId} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ConversationPage;
