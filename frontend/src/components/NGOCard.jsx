import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { BaseURL } from "@/BaseURL";

const NGOCard = ({ ngo }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const handleMessage = async () => {
    if (!user) {
      alert("Please login to start a conversation.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BaseURL}/api/v1/conversation`,
        {
          type: "private",
          receiverId: ngo.account,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const conversationId = res.data._id;
      navigate(`/chat/${conversationId}`);
    } catch (err) {
      console.error("Error creating conversation", err);
      alert(err.response?.data?.message || "Failed to start chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col md:flex-row">
      {/* NGO Logo */}
      <div className="flex-shrink-0 w-full md:w-32 h-32 md:h-auto overflow-hidden">
        <img
          src={ngo.logo || "https://via.placeholder.com/120"}
          alt={ngo.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-lg font-bold text-[#19398a] line-clamp-2">{ngo.name}</h3>
          <span
            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
              ngo.verification_status === "verified"
                ? "bg-green-500 text-white"
                : ngo.verification_status === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {ngo.verification_status?.toUpperCase()}
          </span>

          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {ngo.description || "This NGO is committed to social impact."}
          </p>

          <p className="text-gray-500 text-sm mt-2">
            {ngo.city}, {ngo.state}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            className="flex-1 px-3 py-1 rounded-md border border-[#19398a] text-[#19398a] hover:bg-[#19398a1a] text-sm"
            onClick={() => navigate(`/ngo/${ngo._id}`)}
          >
            View Profile
          </button>
          <button
            onClick={handleMessage}
            disabled={loading}
            className={`flex-1 px-3 py-1 rounded-md text-white text-sm ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#19398a] hover:bg-[#142a66]"
            }`}
          >
            {loading ? "Starting..." : "Message"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NGOCard;
