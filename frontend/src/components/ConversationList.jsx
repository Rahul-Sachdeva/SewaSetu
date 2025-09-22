import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConversationCard from "./ConversationCard";
import { BaseURL } from "@/BaseURL";
import { useAuth } from "@/context/AuthContext";

// ConversationList Component
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
        const userId = user.role=="user"?user.id:user.ngo;
        const token = localStorage.getItem("token");
        const res = await axios.post(`${BaseURL}/api/v1/conversation`, {userId}, {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        setConversations(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Error fetching conversations", err);
      }
    };
    fetchConversations();
  }, []);

//    useEffect(() => {
//   const fetchConversations = async () => {
//     try {
//       // Temporarily replace API with mock data
//       const sampleData = [
//         {
//           _id: "68d02090ae7eeab3110f129c",
//           type: "private",
//           participants: [
//             {
//               participantType: "User",
//               participant: { name: "Ravi Kumar" },
//             },
//           ],
//           lastMessage: {
//             text: "Hey! Are we meeting tomorrow?",
//             createdAt: new Date(),
//             readBy: [],
//           },
//         },
//         {
//           _id: "2",
//           type: "ngo_followers",
//           ngo: { name: "Helping Hands NGO", logo: "https://placehold.co/50x50" },
//           lastMessage: {
//             text: "Welcome to the followers group 🎉",
//             createdAt: new Date(),
//             readBy: ["currentUserId"],
//           },
//         },
//         {
//           _id: "3",
//           type: "campaign",
//           campaign: {
//             title: "Clean Water Drive",
//             image: "https://placehold.co/50x50",
//           },
//           lastMessage: {
//             attachments: ["https://example.com/file.pdf"],
//             createdAt: new Date(),
//             readBy: [],
//           },
//         },
//       ];

//       setConversations(sampleData);
//       setFiltered(sampleData);
//     } catch (err) {
//       console.error("Error fetching conversations", err);
//     }
//   };

//   fetchConversations();
// }, []); 

  useEffect(() => {
    let result = conversations;
    if (activeTab !== "all") {
      result = result.filter((c) => c.type === activeTab);
    }
    if (search) {
      result = result.filter((c) =>
        (c.ngo?.name || c.campaign?.title || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, activeTab, conversations]);

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
          filtered.map((conv) => (
            <ConversationCard
              key={conv._id}
              conversation={conv}
              onClick={() => navigate(`/chat/${conv._id}`)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No conversations found</p>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
