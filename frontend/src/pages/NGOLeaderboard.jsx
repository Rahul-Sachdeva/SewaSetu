import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import { BaseURL } from "../BaseURL";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const badgeStyles = {
  gold: { bg: "bg-yellow-200", text: "text-black", shadow: "" },
  silver: { bg: "bg-gray-200", text: "text-black", shadow: "shadow" },
  bronze: { bg: "bg-amber-700", text: "text-white", shadow: "" },
  platinum: { bg: "bg-stone-200", text: "text-gray-800", shadow: "shadow" },
};

const badgeOrder = ["bronze", "silver", "gold", "platinum"];

const GRADIENTS = [
  "from-yellow-300 to-yellow-200",
  "from-blue-300 to-blue-200",
  "from-pink-300 to-pink-200",
  "from-purple-300 to-purple-200",
  "from-green-300 to-green-200",
];

const ITEMS_PER_PAGE = 10;

const NGOLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("allTime");
  const [ngoRank, setNgoRank] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  const showCelebration = ngoRank && ngoRank <= 5 && (period === "thisMonth" || period === "allTime");

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 80,
      });
    }
  }, [loading]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BaseURL}/api/v1/ngo/ngo-leaderboard?period=${period}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const sorted = [...res.data.leaderboard].sort((a, b) => b.points - a.points);
        setLeaderboard(sorted);

        if (user && user.ngo) {
          const rankIndex = res.data.leaderboard.findIndex((ngo) => ngo._id === user.ngo);
          setNgoRank(rankIndex >= 0 ? rankIndex + 1 : null);

          if (rankIndex >= 0 && rankIndex < 5) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }
        } else {
          setShowConfetti(false);
          setNgoRank(null);
        }
      } catch (err) {
        setError("Failed to load NGO leaderboard.");
        setNgoRank(null);
        setShowConfetti(false);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [period, user]);

  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter((ngo) =>
      ngo.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [leaderboard, search]);

  const totalPages = Math.ceil(filteredLeaderboard.length / ITEMS_PER_PAGE);
  const paginatedLeaderboard = filteredLeaderboard.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const ordinalSuffix = (i) => {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) return `${i}st`;
    if (j === 2 && k !== 12) return `${i}nd`;
    if (j === 3 && k !== 13) return `${i}rd`;
    return `${i}th`;
  };

  function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  }

  return (
    <>
      <Navbar />
      {showCelebration && (
        <div className="mb-6 bg-yellow-200 bg-opacity-90 border-b border-yellow-200 shadow-md z-10 transition-all duration-300 flex items-center justify-center rounded-lg">
          {showConfetti && <Confetti width={dimensions.width + 20} height={dimensions.height + 80} />}
          <div className="flex items-center h-14 font-semibold text-yellow-900 text-lg select-none px-8 py-0">
            🎉 Woohoo! Your NGO is {ordinalSuffix(ngoRank)} in the Leaderboard {period === "thisMonth" ? "this month" : "all time"}! 🎉
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="min-h-screen bg-gradient-to-tl from-indigo-50 via-white to-blue-50 py-2"
        style={{ minHeight: "100vh" }}
      >
        <div className={showCelebration ? "pt-0" : "pt-5"}>
          <div className="max-w-5xl mx-auto px-6 py-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h1 className="text-3xl font-bold text-blue-900 tracking-normal select-none">
                NGO Leaderboard
              </h1>
              <div className="flex gap-4 flex-wrap">
                <button
                  className={`px-5 py-2 rounded-full transition-transform font-semibold focus:outline-none border ${period === "allTime"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-blue-700 border-transparent hover:bg-blue-50"
                    } text-sm`}
                  onClick={() => {
                    setPeriod("allTime");
                    setCurrentPage(1);
                    setSearch("");
                  }}
                  aria-pressed={period === "allTime"}
                >
                  All Time
                </button>
                <button
                  className={`px-5 py-2 rounded-full transition-transform font-semibold focus:outline-none border ${period === "thisMonth"
                      ? "bg-yellow-400 text-white border-yellow-400"
                      : "bg-gray-100 text-yellow-700 border-transparent hover:bg-yellow-50"
                    } text-sm`}
                  onClick={() => {
                    setPeriod("thisMonth");
                    setCurrentPage(1);
                    setSearch("");
                  }}
                  aria-pressed={period === "thisMonth"}
                >
                  This Month
                </button>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="search"
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="Search by NGO name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search NGO leaderboard by name"
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-28">
                <svg
                  className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                <p className="text-blue-600 text-lg font-semibold">Loading NGO leaderboard...</p>
              </div>
            ) : error ? (
              <p className="text-center text-red-600 text-sm font-semibold">{error}</p>
            ) : filteredLeaderboard.length === 0 ? (
              <p className="text-center text-gray-500 text-sm italic">No NGO leaderboard data available.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 rounded-lg shadow-sm text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-5 font-semibold text-gray-700 border-b w-16 select-none">
                          Rank
                        </th>
                        <th className="text-left py-3 px-5 font-semibold text-gray-700 border-b select-none">
                          NGO
                        </th>
                        <th className="text-left py-3 px-5 font-semibold text-gray-700 border-b w-20 select-none">
                          Points
                        </th>
                        <th className="text-left py-3 px-5 font-semibold text-gray-700 border-b select-none">
                          Badges
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedLeaderboard.map((ngo, idx) => {
                        const absoluteRank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                        const isCurrentNgo = user && user.ngo === ngo._id;
                        let rankIcon = null;
                        if (absoluteRank === 1)
                          rankIcon = (
                            <span title="1st Place" role="img" className="mr-1 text-xl select-none">
                              🥇
                            </span>
                          );
                        else if (absoluteRank === 2)
                          rankIcon = (
                            <span title="2nd Place" role="img" className="mr-1 text-xl select-none">
                              🥈
                            </span>
                          );
                        else if (absoluteRank === 3)
                          rankIcon = (
                            <span title="3rd Place" role="img" className="mr-1 text-xl select-none">
                              🥉
                            </span>
                          );
                        const avatarGradient =
                          GRADIENTS[absoluteRank % GRADIENTS.length] || "from-gray-200 to-gray-100";


                        const sortedBadges = (ngo.badges ?? [])
                          .slice()
                          .sort(
                            (a, b) =>
                              badgeOrder.indexOf(a.toLowerCase()) -
                              badgeOrder.indexOf(b.toLowerCase())
                          );

                        return (
                          <tr
                            key={ngo._id}
                            className={`${isCurrentNgo
                                ? "bg-yellow-50 font-semibold border-l-4 border-yellow-400 shadow-sm"
                                : "hover:bg-gray-50"
                              } transition-colors cursor-pointer`}
                            tabIndex={0}
                            aria-label={`${ngo.name}, rank ${absoluteRank}, points ${ngo.points}`}
                          >
                            <td className="py-3 px-5 border-b">
                              <div className="flex items-center select-none text-base">
                                {rankIcon}
                                <span>{absoluteRank}</span>
                              </div>
                            </td>
                            <td className="py-3 px-5 border-b flex items-center space-x-3">
                              <div
                                className={`p-1 rounded-full bg-gradient-to-br ${avatarGradient} shadow-sm`}
                              >
                                <img
                                  src={ngo.logo || "https://via.placeholder.com/40"}
                                  alt={`${ngo.name}'s logo`}
                                  className="w-9 h-9 rounded-full object-cover border border-white"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="truncate max-w-xs text-gray-900 font-medium">{ngo.name}</span>
                                {/* CITY/STATE DISPLAY */}
                                {ngo.city && (
                                  <span className="text-xs text-gray-500">{ngo.city}{ngo.state ? `, ${ngo.state}` : ""}</span>
                                )}
                              </div>                            </td>
                            <td className="py-3 px-5 border-b text-blue-700 font-semibold text-base">
                              {ngo.points}
                            </td>
                            <td className="py-3 px-5 border-b flex flex-wrap gap-1">
                              {sortedBadges.length > 0 ? (
                                sortedBadges.map((badge, i) => {
                                  const key = badge.toLowerCase();
                                  const style = badgeStyles[key] || {
                                    bg: "bg-yellow-300",
                                    text: "text-yellow-900",
                                    shadow: "",
                                  };
                                  return (
                                    <span
                                      key={i}
                                      className={`inline-flex items-center ${style.bg} ${style.text} px-2 py-0.5 rounded-full text-xs font-semibold ${style.shadow} select-none mr-2`}
                                      title={`${badge} badge`}
                                      aria-label={`${badge} Badge`}
                                    >
                                      🌟 {badge}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-gray-400 italic text-xs select-none">No badges</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>


                <div className="mt-4 flex justify-center items-center space-x-3 select-none">
                  <button
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md border ${currentPage === 1
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : "border-blue-600 text-blue-600 hover:bg-blue-50"
                      }`}
                    aria-label="Previous page"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => changePage(i + 1)}
                      className={`px-3 py-1 rounded-md border ${currentPage === i + 1
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      aria-label={`Page ${i + 1}`}
                      aria-current={currentPage === i + 1 ? "page" : undefined}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md border ${currentPage === totalPages
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : "border-blue-600 text-blue-600 hover:bg-blue-50"
                      }`}
                    aria-label="Next page"
                  >
                    &gt;
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NGOLeaderboard;
