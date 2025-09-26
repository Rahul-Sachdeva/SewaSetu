import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import dayjs from "dayjs";

const ConversationCard = ({ conversation, onClick }) => {
  const { user } = useAuth();
  const lastMsg = conversation?.lastMessage;

  // Use title & avatar passed from ConversationList
  const title = conversation.title || "Unknown";
  const avatarUrl = conversation.avatar || "";

  // Determine if message is unread
  const hasUnread =
    lastMsg?.readBy?.every((id) => id.toString() !== user.id);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition rounded-2xl"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <Avatar className="w-12 h-12">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} />
          ) : (
            <AvatarFallback>{title[0]}</AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium truncate">{title}</h3>
            {lastMsg?.createdAt && (
              <span className="text-xs text-gray-500">
                {dayjs(lastMsg.createdAt).format("hh:mm A")}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">
            {lastMsg?.text || (lastMsg?.attachments?.length ? "📎 Attachment" : "No messages yet")}
          </p>
        </div>

        {hasUnread && <Badge className="bg-blue-500 text-white">New</Badge>}
      </CardContent>
    </Card>
  );
};

export default ConversationCard;
