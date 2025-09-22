import React from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ChatHeader = ({ conversation }) => {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-white">
      <div className="flex items-center gap-3">
        <ArrowLeft className="cursor-pointer" />
        <Avatar>
          <AvatarImage src={conversation.avatar} />
          <AvatarFallback>{conversation.title[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{conversation.title}</h3>
          <p className="text-xs text-gray-500">Online</p>
        </div>
      </div>
      <MoreVertical className="cursor-pointer" />
    </div>
  );
};

export default ChatHeader;
