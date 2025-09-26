import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConversationCard from "./ConversationCard";
import { BaseURL } from "@/BaseURL";
import { useAuth } from "@/context/AuthContext";

const ConversationList = () => {
  const [conversations, setConversations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BaseURL}/api/v1/conversation`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data) ? res.data : res.data.conversations || [];

        // No need to fetch separately: backend already populated
        setConversations(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error fetching conversations", err);
      }
    };

    if (user) fetchConversations();
  }, [user]);

  // Filter conversations based on tab and search
  useEffect(() => {
    let result = Array.isArray(conversations) ? [...conversations] : [];

    if (activeTab !== "all") {
      result = result.filter((c) => c.type === activeTab);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((c) => {
        const name =
          c.type === "private"
            ? // pick the other participant's name
              c.participants.find(p => p.participant?._id !== user.id)?.participant?.name
            : c.type === "ngo_followers"
            ? c.ngo?.name
            : c.type === "campaign"
            ? c.campaign?.title
            : "";
        return name?.toLowerCase().includes(lowerSearch);
      });
    }

    setFiltered(result);
  }, [search, activeTab, conversations, user.id]);

  return (
    <div className="flex flex-col w-full bg-gray-100 h-[100vh] max-w-md mx-auto p-4 gap-4">
      {/* Search Bar */}
      <Input
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-2xl bg-white"
      />

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 rounded-2xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
          <TabsTrigger value="ngo_followers">NGO</TabsTrigger>
          <TabsTrigger value="campaign">Campaign</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Conversation Cards */}
      <div className="flex-1 scrollbar overflow-y-scroll space-y-3">
        {filtered.length ? (
          filtered.map((conv) => {
            // Determine display name & avatar
            let title = "";
            let avatar = "";

            if (conv.type === "private") {
              const other = conv.participants.find(p => p.participant?._id !== user.id);
              title = other?.participant?.name || "Unknown";
              avatar = other?.participant?.avatar || "";
            } else if (conv.type === "ngo_followers") {
              title = conv.ngo?.name || "NGO";
              avatar = conv.ngo?.logo || "";
            } else if (conv.type === "campaign") {
              title = conv.campaign?.title || "Campaign";
              avatar = conv.campaign?.bannerImage || "";
            }

            return (
              <ConversationCard
                key={conv._id}
                conversation={{ ...conv, title, avatar }}
                onClick={() => navigate(`/chat/${conv._id}`)}
              />
            );
          })
        ) : (
          <p className="text-center text-gray-500">No conversations found</p>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
