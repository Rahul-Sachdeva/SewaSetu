import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import axios from "axios";
import { BaseURL } from "../BaseURL";
import EditProfileDialog from "../components/EditProfileDialog";

const UserProfile = () => {
  const { user } = useAuth(); // basic auth user (from login)
  const [profile, setProfile] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Hardcoded stats + contributions (until backend supports them)
  const stats = [
    { label: "Donations Given", value: 12, icon: "🏆" },
    { label: "Campaigns Joined", value: 5, icon: "📢" },
    { label: "Pickups Assisted", value: 8, icon: "🚚" },
  ];

  const contributions = [
    { title: "Donated Clothes to XYZ NGO", date: "2025-08-20" },
    { title: "Food Donation for Flood Relief", date: "2025-07-15" },
    { title: "Joined Tree Plantation Drive", date: "2025-06-10" },
  ];

  // Fetch profile details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BaseURL}/api/v1/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Submit handler for update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      const res = await axios.put(`${BaseURL}/api/v1/user/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Profile updated successfully!");
      setIsEditOpen(false);

      if (onProfileUpdated) {
        onProfileUpdated(res.data.user); // callback to refresh profile in parent
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---- Left Column: Profile & Details ---- */}
        <div className="col-span-1 bg-[#19398a0d] shadow-md rounded-xl p-6 flex flex-col justify-center items-center text-center lg:text-left">
          <img
            src={profile?.profile_image || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-[#19398a] object-cover"
          />
          <h2 className="text-xl font-bold text-gray-800 mt-3">
            {profile?.name || user?.name}
          </h2>
          
          <div className="mt-4 space-y-1 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {profile?.email || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{" "}
              {profile?.phone || "N/A"}
            </p>
            <p>
              <span className="font-semibold">City:</span>{" "}
              {profile?.city || "N/A"}
            </p>
            <p>
              <span className="font-semibold">State:</span>{" "}
              {profile?.state || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {profile?.address
                ? profile.address.length > 20
                  ? profile.address.slice(0, 20) + "..."
                  : profile.address
                : "N/A"}
            </p>
          </div>

          <button
            onClick={() => setIsEditOpen(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-[#19398a] text-white text-sm font-medium rounded-lg hover:bg-[#2e58c2] transition"
          >
            <Pencil className="w-4 h-4 mr-2" /> Edit Profile
          </button>
        </div>

        {/* ---- Right Column: About + Stats + Contributions ---- */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* About */}
          <div className="bg-[#f9fafb] shadow-md rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
            <p className="text-gray-600 text-sm">
              {profile?.about ||
                "Passionate individual making an impact through donations and volunteering."}
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center rounded-xl p-4 shadow-sm"
                style={{
                  backgroundColor:
                    idx === 0
                      ? "#19398a0d"
                      : idx === 1
                      ? "#ffd6000d"
                      : "#19398a0d",
                }}
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xl font-bold mt-1 text-[#19398a]">
                  {s.value}
                </span>
                <span className="text-xs text-gray-600">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Contributions */}
          <div className="bg-[#f9fafb] shadow-md rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Recent Contributions
            </h3>
            <ul className="space-y-2">
              {contributions.map((c, idx) => (
                <li
                  key={idx}
                  className="flex justify-between border-b pb-2 last:border-0"
                >
                  <span className="text-gray-700 text-sm">{c.title}</span>
                  <span className="text-gray-500 text-xs">{c.date}</span>
                </li>
              ))}
            </ul>
            <button className="mt-3 text-[#19398a] text-sm font-semibold hover:underline">
              View All →
            </button>
          </div>
        </div>
      </div>
      <EditProfileDialog
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </>
  );
};

export default UserProfile;
