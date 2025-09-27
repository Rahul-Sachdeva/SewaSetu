import React, { useState, useEffect } from "react";
import { FaRegCalendarAlt, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import dayjs from "dayjs";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { BaseURL } from "@/BaseURL";
import { useNavigate } from "react-router-dom";

const CampaignCard = ({ campaign, onClick, isOwner = false }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
    cancelled: "bg-red-200 text-red-600",
  };

  useEffect(() => {
    if (!isOwner) {
      setIsRegistered(campaign.participants?.some((p) => p.user?._id === user?.id) || false);
    }
  }, [campaign, user, isOwner]);

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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await axios.delete(`${BaseURL}/api/v1/campaign/${campaign._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Campaign deleted successfully");
      window.location.reload(); // or notify parent
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error deleting campaign");
    }
  };

  return (
    <div className="bg-white shadow-lg border-[3px] border-[#4c73d6] rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 text-sm sm:text-base flex flex-col">
      {/* Banner */}
      <div className="h-40 md:h-44 lg:h-48 w-full overflow-hidden relative">
        <img
          src={
            campaign.bannerImage ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJxugo5jf0C5LJzyE8WFUNW556xkl3jkttGg&s"
          }
          alt={campaign.title}
          className="object-cover w-full h-full border-b-[3px] border-[#4c73d6]"
        />
        <span
          className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${categoryColors[campaign.category]}`}
        >
          {campaign.category.replace("_", " ").toUpperCase()}
        </span>
        <span
          className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded ${statusColors[campaign.status]}`}
        >
          {campaign.status.toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#19398a0d]">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
            {campaign.title}
          </h3>

          <div className="flex items-center text-gray-600 mt-1 text-sm md:text-base">
            <FaUser className="mr-2 text-[#19398a]" />
            <span>{campaign.ngo?.name}</span>
          </div>

          <div className="flex items-center text-gray-600 mt-1 text-sm md:text-base">
            <FaRegCalendarAlt className="mr-2 text-[#19398a]" />
            <span>{`${start} - ${end}`}</span>
          </div>

          <div className="flex items-center text-gray-600 mt-1 text-sm md:text-base">
            <FaMapMarkerAlt className="mr-2 text-[#19398a]" />
            <span>{campaign.address}</span>
          </div>

          <p className="text-gray-600 mt-2 mb-2 text-sm">{campaign.description}</p>
        </div>

        {/* Buttons */}
        <div
          className={`mt-3 md:mt-4 ${
            isOwner ? "flex flex-col gap-2" : "flex flex-wrap gap-2 items-center"
          }`}
        >
          <button
            className={`${
              isOwner ? "w-full" : "flex-1"
            } px-3 py-2 text-[#19398a] border border-[#19398a] rounded-md hover:bg-[#19398a1a] transition-colors text-xs sm:text-sm`}
            onClick={() => onClick?.(campaign)}
          >
            View Details
          </button>

          {isOwner ? (
            <>
              <button
                className="w-full px-3 py-2 text-white bg-[#19398a] hover:bg-[#142a66] rounded-md text-xs sm:text-sm"
                onClick={() => navigate(`/campaign/${campaign._id}/registrations`)}
              >
                View Registrations
              </button>
              <button
                className="w-full px-3 py-2 text-white bg-yellow-600 hover:bg-yellow-700 rounded-md text-xs sm:text-sm"
                onClick={() => navigate(`/campaign/${campaign._id}/edit`)}
              >
                Edit
              </button>
              <button
                className="w-full px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md text-xs sm:text-sm"
                onClick={handleDelete}
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={handleRegister}
              disabled={loading || isRegistered}
              className={`flex-1 px-3 py-2 rounded-md text-white text-xs sm:text-sm ${
                isRegistered
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#19398a] hover:bg-[#142a66]"
              }`}
            >
              {isRegistered ? "Registered" : loading ? "Registering..." : "Register"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CampaignCard;
