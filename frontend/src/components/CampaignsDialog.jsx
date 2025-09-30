import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import {
  FaRegCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaMoneyBillWave,
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
    campaign?.participants?.some((p) => p.user?._id === user?.id) || false
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

  // ------------------- Handle registration -------------------
  const handleRegister = async () => {
    if (isRegistered) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${BaseURL}/api/v1/campaign/${campaign._id}/register`,
        { role },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (res.status === 200) {
        setIsRegistered(true);
        onRegister(campaign._id, {
          participants: [...campaign.participants, { user, role }],
        });
        alert("✅ Registered successfully!");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error registering for campaign");
    } finally {
      setLoading(false);
    }
  };

   // ------------------- Handle fundraising donation -------------------
  const handleDonate = async () => {
    const amount = prompt("Enter donation amount (INR):", "500");
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${BaseURL}/api/v1/fund/create-order`,
        { campaignId: campaign._id, amount: parseFloat(amount) * 100 }, // Razorpay expects paise
        { headers: { Authorization: `Bearer ${token}` } }
      );

     
      const order = res.data;
      
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "KEY NOT AVAILABLE",
        amount: order.amount,
        currency: order.currency,
        name: campaign.title,
        description: "Donation",
        order_id: order.orderId,
        prefill: { name: user?.name, email: user?.email },
        handler: async (response) => {
          try {
            console.log("response: ", response)
            await axios.post(
              `${BaseURL}/api/v1/fund/verify-payment`,
              { ...response, campaignId: campaign._id,  },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("✅ Donation successful!");
            window.location.reload(); // Refresh to update collectedFunds
          } catch (err) {
            console.error(err);
            alert("❌ Payment verification failed.");
          }
        },
        theme: { color: "#19398a" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to initiate donation.");
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
            <span
              className={`px-3 py-1 text-sm font-semibold rounded ${categoryColors[campaign.category]}`}
            >
              {campaign.category.replace("_", " ").toUpperCase()}
            </span>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded ${statusColors[campaign.status]}`}
            >
              {campaign.status.toUpperCase()}
            </span>
          </div>

          {/* Two-column layout */}
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
              </div>

              {/* Registration Section */}
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Register</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {!isRegistered ? (
                    <>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="border rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#19398a]"
                      >
                        {campaign.category !== "fundraising" && (
                          <>
                            <option value="attendee">Attendee</option>
                            <option value="volunteer">Volunteer</option>
                          </>
                        )}
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

              {/* Fundraising Section */}
              {campaign.category === "fundraising" && (
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Donate</h3>
                  <p className="mb-2 text-gray-600">
                    Collected: ₹{campaign.collectedFunds || 0} / ₹{campaign.targetFunds || 0}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{
                        width: `${((campaign.collectedFunds || 0) / (campaign.targetFunds || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <button
                    onClick={handleDonate}
                    disabled={loading || campaign.status !== "ongoing"}
                    className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    {loading ? "Processing..." : "Donate Now"}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Map */}
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

              {/* Total Registrations */}
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800">Registrations</h3>
                <p className="mt-1 text-2xl font-bold text-[#19398a]">{totalRegistrations}</p>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CampaignDialog;
