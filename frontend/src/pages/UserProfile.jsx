import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import axios from "axios";
import { BaseURL } from "../BaseURL";
import EditProfileDialog from "../components/EditProfileDialog";

const badgeThresholds = [
  { name: "Bronze", points: 100 },
  { name: "Silver", points: 300 },
  { name: "Gold", points: 600 },
  { name: "Platinum", points: 1000 }
];

const badgeColors = {
  Bronze: "bg-amber-700 text-white",
  Silver: "bg-gray-200 text-gray-800",
  Gold: "bg-yellow-200 text-yellow-900",
  Platinum: "bg-slate-200 text-slate-800"
};

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);

  // Hardcoded stats + contributions placeholder
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

  // Fetch profile
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

  // Fetch gamification data
  useEffect(() => {
    const fetchUserGamification = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BaseURL}/api/v1/user/points`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPoints(res.data.points);
        setBadges(res.data.badges);
        setActivityHistory(res.data.activityHistory);
      } catch (err) {
        console.error("Failed to fetch user gamification data", err);
      }
    };
    fetchUserGamification();
  }, []);

  // Next badge progress calculation
  const nextBadge = badgeThresholds.find(b => !badges.includes(b.name));
  const progressPercent = nextBadge ? Math.min((points / nextBadge.points) * 100, 100) : 100;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <section className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center lg:text-left">
          <img
            src={profile?.profile_image || "https://via.placeholder.com/150"}
            alt={`${profile?.name || user?.name}'s profile`}
            className="w-32 h-32 rounded-full border-4 border-[#19398a] object-cover shadow-lg transition-transform hover:scale-105 hover:shadow-blue-300"
          />
          <h2 className="text-2xl font-black tracking-tight text-gray-900 mt-4">{profile?.name || user?.name}</h2>

          {/* Points and Badges */}
          <div className="mt-4 w-full">
            <p className="font-semibold text-lg text-gray-800">Points: {points}</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center lg:justify-start" aria-label="User badges">
              {badges.length > 0 ? (
                badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded-full font-semibold shadow-sm cursor-default select-none flex items-center gap-1 ${badgeColors[badge] || "bg-yellow-200 text-yellow-900"}`}
                    title={`${badge} Badge`}
                    tabIndex={0}
                    aria-label={`${badge} badge`}
                  >
                    <span className="text-base">🌟</span> {badge}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 italic text-sm">No badges earned yet</span>
              )}
            </div>
            {nextBadge && (
              <div className="mt-4" role="progressbar" aria-valuenow={points} aria-valuemin={0} aria-valuemax={nextBadge.points}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-700">
                    Progress to <strong>{nextBadge.name}</strong>: {points} / {nextBadge.points} pts
                  </span>
                  <span className="ml-2 text-gray-500" title={`${100 - progressPercent}% to go`}>{Math.max(0, nextBadge.points - points)} pts left</span>
                </div>
                <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-lime-200 transition-all duration-700" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <dl className="mt-6 w-full text-left space-y-2">
            <div>
              <dt className="font-semibold text-gray-700">Email</dt>
              <dd className="text-gray-900">{profile?.email || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-700">Phone</dt>
              <dd className="text-gray-900">{profile?.phone || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-700">City</dt>
              <dd className="text-gray-900">{profile?.city || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-700">State</dt>
              <dd className="text-gray-900">{profile?.state || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-700">Address</dt>
              <dd className="text-gray-900 truncate max-w-xs" title={profile?.address}>
                {profile?.address || "N/A"}
              </dd>
            </div>
          </dl>

          <button
            onClick={() => setIsEditOpen(true)}
            className="mt-6 px-5 py-2 bg-[#19398a] text-white rounded-lg shadow hover:bg-[#2e58c2] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#19398a] inline-flex items-center"
            aria-label="Edit Profile"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </section>

        {/* Main Content */}
        <section className="col-span-2 flex flex-col gap-6">
          {/* About */}
          <article className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-700">{profile?.about || "Passionate individual making an impact through donations and volunteering."}</p>
          </article>

          {/* Impact Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl shadow-md flex flex-col items-center bg-gradient-to-tr
                  ${idx === 1
                    ? "from-yellow-100 via-yellow-50 to-orange-50"
                    : idx === 2
                      ? "from-blue-50 to-cyan-50"
                      : "from-lime-50 to-yellow-100"}
                `}
                aria-label={`${stat.label}: ${stat.value}`}
              >
                <span className="text-4xl mb-2">{stat.icon}</span>
                <span className="text-3xl font-extrabold text-[#19398a]">{stat.value}</span>
                <span className="text-sm text-gray-700">{stat.label}</span>
              </div>
            ))}
          </section>

          {/* Gamification Activity History */}
          <article className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Gamification Activity</h3>
            <ul className="divide-y divide-gray-200 max-h-48 overflow-y-auto text-gray-600 text-sm">
              {activityHistory.length > 0 ? (
                activityHistory.slice().reverse().slice(0, 6).map((activity, idx) => (
                  <li key={idx} className="flex justify-between py-2 items-center animate-fadeIn">
                    <span className="truncate max-w-[70%] flex items-center gap-1" title={activity.activity}>
                      {activity.points > 0 ? <span className="text-green-500 font-bold">▲</span> : <span className="text-red-400">▼</span>}
                      {activity.activity}
                    </span>
                    <span className={activity.points > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {activity.points > 0 ? `+${activity.points}` : activity.points}
                    </span>
                  </li>
                ))
              ) : (
                <p className="italic text-gray-400">No recent gamification activity</p>
              )}
            </ul>
          </article>

          {/* Recent Contributions */}
          <article className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Contributions</h3>
            <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {contributions.map((contrib, idx) => (
                <li key={idx} className="flex justify-between py-3">
                  <span className="text-gray-800 truncate">{contrib.title}</span>
                  <time className="text-sm text-gray-500">{contrib.date}</time>
                </li>
              ))}
              {contributions.length === 0 && <p className="text-gray-400 italic">No contributions yet.</p>}
            </ul>
            <button className="mt-4 text-[#19398a] text-sm font-semibold hover:underline transition-transform hover:scale-105 self-start">
              View All →
            </button>
          </article>
        </section>
      </main>

      <EditProfileDialog
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </>
  );
};

export default UserProfile;
