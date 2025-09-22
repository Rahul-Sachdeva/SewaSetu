import React from "react";

const MessageBubble = ({ message, currentUserId }) => {
  const isMe = message.sender?._id === currentUserId || message.sender === currentUserId;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
          isMe
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};

export default MessageBubble;
