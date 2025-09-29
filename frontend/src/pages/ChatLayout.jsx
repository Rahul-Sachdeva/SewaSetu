import React from "react";
import { Outlet, useParams } from "react-router-dom";
import ConversationList from "@/components/ConversationList";
import ConversationPage from "@/components/ConversationPage";
import Navbar from "../components/Navbar";

const ChatLayout = () => {
  const { id } = useParams();

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", background: "#f4f6f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
    <div className="flex h-screen w-full bg-gray-100">
      {/* Left sidebar: Conversations */}
      <div className="hidden md:flex md:w-1/3 lg:w-2/7 border-r">
        <ConversationList />
      </div>

      {/* Mobile: show only list if no chat open */}
      <div className="flex md:hidden w-full">
        {id ? <ConversationPage /> : <ConversationList />}
      </div>

      {/* Desktop: Right side chat */}
      <div className="hidden md:flex flex-1">
        {id ? (
          <ConversationPage />
        ) : (
          <div className="flex items-center justify-center w-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default ChatLayout;
