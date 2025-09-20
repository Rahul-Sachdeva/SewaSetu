import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import {
  FaRegCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaTimes,
  FaMoneyBillWave,
  FaUsers,
  FaHandHoldingHeart,
  FaShareAlt,
} from "react-icons/fa";
import dayjs from "dayjs";
import { BaseURL } from "@/BaseURL";
import { useAuth } from "@/context/AuthContext";

const CampaignDialog = ({ campaign, onClose, onRegister }) => {
  const userToken = localStorage.getItem("token");
  const { user } = useAuth();
  const [role, setRole] = useState("attendee");
  const [isRegistered, setIsRegistered] = useState(
    campaign.participants?.some((p) => p.user?._id === user?.id) || false
  );
  const [loading, setLoading] = useState(false);

  if (!campaign) return null;

  const start = dayjs(campaign.startDate).format("MMM D, YYYY h:mm A");
  const end = dayjs(campaign.endDate).format("MMM D, YYYY h:mm A");

  const totalRegistrations = campaign.participants?.length || 0;

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
    cancelled: "bg-red-200 text-red-700",
  };

  // Backend registration function
  const handleRegister = async () => {
    if (isRegistered) return; // Already registered

    setLoading(true);
    try {
      const res = await axios.post(
        `${BaseURL}/api/v1/campaign/${campaign._id}/register`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (res.status === 200) {
        setIsRegistered(true);
        onRegister(campaign._id, {
          participants: [...campaign.participants, user?.id], // add current user
        });
        alert("Registered successfully!");
      }
    } catch (err) {
      console.log("error: ",err);
      alert(err.response?.data?.message || "Error registering for campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!campaign} onClose={onClose} className="relative z-[9999]">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
          {/* Category & Status */}
          <div className="flex justify-between p-4">
            <span className={`px-3 py-1 text-sm font-semibold rounded ${categoryColors[campaign.category]}`}>
              Type of Event: {campaign.category.replace("_", " ").toUpperCase()}
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded ${statusColors[campaign.status]}`}>
              {campaign.status.toUpperCase()}
            </span>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-4">
            {/* Left Column */}
            <div className="space-y-4">
              {campaign.bannerImage && (
                <img
                  src={campaign.bannerImage}
                  alt={campaign.title}
                  className="w-full h-48 border-2 object-cover rounded-lg"
                />
              )}

              <div className="flex items-center gap-3">
                <img
                  src={campaign.ngo?.logo || "/placeholder-logo.png"}
                  alt={campaign.ngo?.name}
                  className="w-14 h-14 rounded-full border"
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{campaign.ngo?.name}</h3>
                  <button className="text-sm text-[#19398a] hover:underline">View Profile</button>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">{campaign.title}</h2>
                <p className="text-gray-600 mt-2">{campaign.description}</p>
              </div>

              <div className="space-y-2 text-gray-700">
                <div className="flex items-center">
                  <FaRegCalendarAlt className="mr-2 text-[#19398a]" />
                  <span>{start} – {end}</span>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-[#19398a]" />
                  <span>{campaign.address}</span>
                </div>
                {campaign.city && <p className="ml-6">City: {campaign.city}</p>}
                {campaign.state && <p className="ml-6">State: {campaign.state}</p>}
              </div>

              {/* Expected Impacts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-gray-100 rounded-lg shadow-sm flex flex-col items-center text-center">
                  <FaMoneyBillWave className="text-green-600 text-2xl mb-2" />
                  <p className="text-sm font-semibold text-gray-800">Provide Funds</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg shadow-sm flex flex-col items-center text-center">
                  <FaHandHoldingHeart className="text-red-600 text-2xl mb-2" />
                  <p className="text-sm font-semibold text-gray-800">Help Needy People</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg shadow-sm flex flex-col items-center text-center">
                  <FaUsers className="text-blue-600 text-2xl mb-2" />
                  <p className="text-sm font-semibold text-gray-800">Volunteers Needed</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {campaign.location_coordinates?.length === 2 && (
                <div className="h-48 w-full rounded-md overflow-hidden border">
                  <iframe
                    title="campaign-location"
                    className="w-full h-full rounded-lg border"
                    src={`https://www.google.com/maps?q=${campaign.location_coordinates[1]},${campaign.location_coordinates[0]}&hl=es;z=14&output=embed`}
                    loading="lazy"
                  ></iframe>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800">Registrations</h3>
                <p className="mt-1 text-2xl font-bold text-[#19398a]">{totalRegistrations}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">Register</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {!isRegistered ? (
                    <>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="border rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#19398a]"
                      >
                        <option value="attendee">Attendee</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="donor">Donor</option>
                      </select>
                      <button
                        onClick={handleRegister}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                          loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#19398a] hover:bg-[#142a66]"
                        }`}
                      >
                        {loading ? "Registering..." : "Register"}
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                      Already Registered
                    </button>
                  )}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex p-4 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">Share</h3>
                <div className="w-full justify-center flex gap-3">
                  <button className="px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600">
                    WhatsApp
                  </button>
                  <button className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Twitter
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="px-3 py-2 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
                  >
                    <FaShareAlt /> Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CampaignDialog;
