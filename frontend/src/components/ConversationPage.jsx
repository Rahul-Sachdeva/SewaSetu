import React, { useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { socket } from "../lib/socket"; // adjust path
import { useAuth } from "@/context/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../BaseURL";

const ConversationPage = () => {
  const { id: conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();
  const senderId = user?.id; // depending on your schema
  const senderType = user?.role? (user.role=="user"?"User":"NGO"):null;          // "User" or "NGO"
  const token = localStorage.getItem("token");

  // Load previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${BaseURL}/api/v1/message/${conversationId}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
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

  // Send message
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
      <ChatHeader conversation={{ title: "Chat", avatar: "" }} />
      <MessageList messages={messages} currentUserId={senderId} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ConversationPage;
