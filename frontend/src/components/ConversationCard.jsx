import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { BaseURL } from "@/BaseURL";
import dayjs from "dayjs";

const ConversationCard = ({ conversation, onClick }) => {
  const { user } = useAuth();
  const lastMsg = conversation?.lastMessage;

  const [chatPerson, setChatPerson] = useState(null);

  useEffect(() => {
    const fetchChatPerson = async () => {
      try {
        let chatPersonId = null;
        let chatPersonType = null;

        console.log(conversation.participants)
        if (conversation.type === "private") {
          // find participant != current user
          const other = conversation.participants.find(
            (p) => p.participant?._id!==user.id
          );
          if (other) {
            chatPersonId = other.participant._id;
            chatPersonType = "NGO"; // as per your logic for now
          }
        } else if (conversation.type === "ngo_followers") {
          const ngoParticipant = conversation.participants.find(
            (p) => p.participantType === "NGO"
          );
          if (ngoParticipant) {
            chatPersonId = ngoParticipant.participant._id;
            chatPersonType = "NGO";
          }
        } else if (conversation.type === "campaign") {
          chatPersonId = conversation.ngo?._id;
          chatPersonType = "NGO";
        }
        console.log("not user id: ", chatPersonId)

        if (chatPersonId && chatPersonType) {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${BaseURL}/api/v1/${chatPersonType.toLowerCase()}/${chatPersonId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setChatPerson(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch chat person details", err);
      }
    };

    fetchChatPerson();
  }, [conversation, user.id]);

  const title = chatPerson
    ? chatPerson.name
    : conversation.type === "ngo_followers"
    ? `${conversation.ngo?.name} Followers`
    : conversation.campaign?.title || "Chat";

  const avatarUrl =
    chatPerson?.logo || chatPerson?.avatar || conversation.campaign?.image;

  const hasUnread = lastMsg?.readBy?.every((id) => id.toString() !== user.id);

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
