import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, currentUserId }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} currentUserId={currentUserId} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
