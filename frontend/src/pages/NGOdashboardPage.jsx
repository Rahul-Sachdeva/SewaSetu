import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";  // assuming you have this context
import {
  LayoutDashboard,
  Gift,
  ClipboardList,
  FolderPlus,
  FolderOpen,
  List,
} from "lucide-react";
import MyCampaignsPage from "./MyCampaignsPage";
import NGOListPage from "./NGOListPage";
import CampaignCreatePage from "./CampaignCreatePage";
import NGOProfile from "./NGOProfile";
import DonationsManagement from "./DonationsManagement";
import Navbar from "../components/Navbar";
import NgoDashboard from "./NgoDashboard";
import { BaseURL } from "../BaseURL";  // ensure correct relative path

const badgeThresholds = [
  { name: "Bronze", points: 100 },
  { name: "Silver", points: 300 },
  { name: "Gold", points: 600 },
  { name: "Platinum", points: 1000 },
];

const badgeColors = {
  Bronze: "bg-amber-400 text-amber-900",
  Silver: "bg-gray-300 text-gray-800",
  Gold: "bg-yellow-300 text-yellow-900",
  Platinum: "bg-slate-200 text-slate-800",
};

export default function NGODashboard() {
  const { user } = useAuth();

  const [active, setActive] = useState(() => {
    return localStorage.getItem("ngoDashboardActiveTab") || "overview";
  });

  // Gamification state
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);

  useEffect(() => {
    localStorage.setItem("ngoDashboardActiveTab", active);
  }, [active]);

  useEffect(() => {
    if (active === "overview" && user?.ngo) {
      const fetchGamification = async () => {
        try {
          const token = localStorage.getItem("token");
          const ngoId = user.ngo?._id; // chaining in case ngo is undefined
          console.log("Fetching NGO points for ID:", ngoId);
          const res = await axios.get(`${BaseURL}/api/v1/ngo/${ngoId}/points`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("NGO Gamification Data:", res.data);


          setPoints(res.data.points);
          setBadges(res.data.badges || []);
          setActivityHistory(res.data.activityHistory || []);
        } catch (err) {
          console.error("Failed to fetch NGO gamification data", err);
          setPoints(0);
          setBadges([]);
          setActivityHistory([]);
        }
      };
      fetchGamification();
    }
  }, [active, user]);

  const menuItems = [
    { id: "overview", label: "My Activity", icon: <LayoutDashboard size={18} /> },
    { id: "ngo-requests", label: "Requests Management", icon: <ClipboardList size={18} /> },
    { id: "donations", label: "Donations Management", icon: <Gift size={18} /> },
    { id: "campaign-new", label: "Create New Campaign", icon: <FolderPlus size={18} /> },
    { id: "campaigns", label: "My Campaigns", icon: <FolderOpen size={18} /> },
    { id: "ngo-list", label: "NGO List", icon: <List size={18} /> },
  ];

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", background: "#f4f6f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Sidebar + Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-6 shadow-md">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${active === item.id
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Activity Tab */}
          {active === "overview" && (
            <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Your Points & Activity</h2>

              {/* Points */}
              <p className="text-xl font-bold mb-2">Points: {points}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4" aria-label="NGO badges">
                {badges.length > 0 ? badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full font-semibold ${badgeColors[badge] || "bg-yellow-200 text-yellow-900"}`}
                    title={`${badge} Badge`}
                    tabIndex={0}
                    aria-label={`${badge} badge`}
                  >
                    🌟 {badge}
                  </span>
                )) : (
                  <span className="text-gray-500 italic">No badges earned yet</span>
                )}
              </div>

              {/* Progress bar toward next badge */}
              {(() => {
                const nextBadge = badgeThresholds.find(b => !badges.includes(b.name));
                if (!nextBadge) return null;
                const progressPercent = Math.min((points / nextBadge.points) * 100, 100);
                return (
                  <div role="progressbar" aria-valuenow={points} aria-valuemin={0} aria-valuemax={nextBadge.points}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span>Progress to <strong>{nextBadge.name}</strong>: {points} / {nextBadge.points} pts</span>
                      <span title={`${100 - progressPercent}% to go`} className="text-gray-600">
                        {Math.max(0, nextBadge.points - points)} pts left
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
                      <div className="h-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-lime-200 transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Activity History */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Recent Activity</h3>
                {activityHistory.length === 0 ? (
                  <p className="italic text-gray-500">No recent activity</p>
                ) : (
                  <ul className="divide-y divide-gray-200 max-h-48 overflow-y-auto text-gray-700 text-sm">
                    {activityHistory.slice().reverse().slice(0, 6).map((a, idx) => (
                      <li key={idx} className="flex justify-between py-2 items-center">
                        <span>{a.activity}</span>
                        <span className={a.points > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                          {a.points > 0 ? `+${a.points}` : a.points}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Other tabs */}
          {active === "profile" && <NGOProfile />}
          {active === "campaign-new" && <CampaignCreatePage />}
          {active === "ngo-requests" && <NgoDashboard />}
          {active === "campaigns" && <MyCampaignsPage />}
          {active === "ngo-list" && <NGOListPage />}
          {active === "donations" && <DonationsManagement />}

          {/* Placeholder for other pages */}
          {active !== "overview" &&
            active !== "campaigns" &&
            active !== "ngo-list" &&
            active !== "campaign-new" &&
            active !== "profile" &&
            active !== "donations" &&
            active !== "ngo-requests" && (
              <div className="p-10 bg-white rounded-xl shadow-md text-center text-gray-500">
                {menuItems.find((item) => item.id === active)?.label} page coming soon...
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
