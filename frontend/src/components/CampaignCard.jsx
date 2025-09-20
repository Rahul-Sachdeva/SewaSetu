import React, { useState, useEffect } from "react";
import { FaRegCalendarAlt, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import dayjs from "dayjs";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { BaseURL } from "@/BaseURL";

const CampaignCard = ({ campaign, onClick }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [role, setRole] = useState("attendee");
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const start = dayjs(campaign.startDate).format("MMM D, YYYY");
  const end = dayjs(campaign.endDate).format("MMM D, YYYY");

  const categoryColors = {
    fundraising: "bg-green-100 text-green-800",
    food_drive: "bg-orange-100 text-orange-800",
    blood_donation: "bg-red-100 text-red-800",
    medical_camp: "bg-blue-100 text-blue-800",
    awareness: "bg-yellow-100 text-yellow-800",
    others: "bg-gray-100 text-gray-800",
  };

  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    ongoing: "bg-green-100 text-green-800",
    completed: "bg-gray-200 text-gray-600",
  };

  useEffect(()=>{
    setIsRegistered(campaign.participants?.some((p) => p.user?._id === user?.id) || false)
  },[campaign])

  const handleRegister = async () => {
    if (!user) {
      alert("Please login to register.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BaseURL}/api/v1/campaign/${campaign._id}/register`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        setIsRegistered(true);
        alert("Registered successfully!");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error registering for campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg border-[3px] border-[#4c73d6] rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 text-sm sm:text-base md:text-sm lg:text-base flex flex-col">
      <div className="h-40 md:h-44 lg:h-48 w-full overflow-hidden relative">
        <img
          src={campaign.bannerImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJxugo5jf0C5LJzyE8WFUNW556xkl3jkttGg&s"}
          alt={campaign.title}
          className="object-cover w-full h-full border-b-[3px] border-[#4c73d6]"
        />
        <span
          className={`absolute top-2 left-2 px-2 py-1 text-xs md:text-sm font-semibold rounded ${categoryColors[campaign.category]}`}
        >
          {campaign.category.replace("_", " ").toUpperCase()}
        </span>
        <span
          className={`absolute top-2 right-2 px-2 py-1 text-xs md:text-sm font-semibold rounded ${statusColors[campaign.status]}`}
        >
          {campaign.status.toUpperCase()}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between bg-[#19398a0d]">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 line-clamp-2">
            {campaign.title}
          </h3>

          <div className="flex items-center text-gray-600 mt-1 text-lg">
            <FaUser className="mr-2 text-[#19398a]" />
            <span>{campaign.ngo?.name}</span>
          </div>

          <div className="flex items-center text-gray-600 mt-1 text-lg">
            <FaRegCalendarAlt className="mr-2 text-[#19398a]" />
            <span>{`${start} - ${end}`}</span>
          </div>

          <div className="flex items-center text-gray-600 mt-1 text-lg">
            <FaMapMarkerAlt className="mr-2 text-[#19398a]" />
            <span>{campaign.address}</span>
          </div>

          <p className="text-gray-600 mt-2 mb-2 text-md">{campaign.description}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-3 md:mt-4 items-center">
          <button
            className="flex-1 px-2 sm:px-4 py-1 sm:py-2 text-[#19398a] border border-[#19398a] rounded-md hover:bg-[#19398a1a] transition-colors text-xs sm:text-sm"
            onClick={() => onClick(campaign)}
          >
            View Details
          </button>

          <div className="flex-1 flex gap-2">
            
            <button
              onClick={handleRegister}
              disabled={loading || isRegistered}
              className={`flex-1 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-white transition-colors text-xs sm:text-sm ${
                isRegistered
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#19398a] hover:bg-[#142a66]"
              }`}
            >
              {isRegistered ? "Registered" : loading ? "Registering..." : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
