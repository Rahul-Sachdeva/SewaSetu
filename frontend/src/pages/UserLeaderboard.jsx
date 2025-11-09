import React, { useState, useEffect, useRef } from "react";
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

const GRADIENTS = [
    "from-yellow-300 to-yellow-200",
    "from-blue-300 to-blue-200",
    "from-pink-300 to-pink-200",
    "from-purple-300 to-purple-200",
    "from-green-300 to-green-200",
];

const UserLeaderboard = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [period, setPeriod] = useState("allTime");
    const [userRank, setUserRank] = useState(null);

    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Show confetti only once when banner first appears
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: 80, // reduced height
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
                    `${BaseURL}/api/v1/user/leaderboard?period=${period}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const sorted = [...res.data.leaderboard].sort((a, b) => b.points - a.points);
                setLeaderboard(sorted);
                if (user) {
                    const rankIndex = res.data.leaderboard.findIndex(
                        (u) => u._id === user.id
                    );
                    setUserRank(rankIndex >= 0 ? rankIndex + 1 : null);
                    // Show confetti only once when user enters top 3
                    if (rankIndex >= 0 && rankIndex < 3) {
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 3000); // confetti for 3 seconds
                    }
                } else {
                    setShowConfetti(false);
                    setUserRank(null);
                }
            } catch (err) {
                setError("Failed to load leaderboard.");
                setUserRank(null);
                setShowConfetti(false);
            }
            setLoading(false);
        };

        fetchLeaderboard();
    }, [period, user]);

    const showCelebration = userRank && userRank <= 3;

    const ordinalSuffix = (i) => {
        const j = i % 10,
            k = i % 100;
        if (j === 1 && k !== 11) return `${i}st`;
        if (j === 2 && k !== 12) return `${i}nd`;
        if (j === 3 && k !== 13) return `${i}rd`;
        return `${i}th`;
    };

    return (
        <>
            <Navbar />
            <div
                ref={containerRef}
                className="min-h-screen bg-gradient-to-tl from-indigo-50 via-white to-blue-50 py-8"
                style={{ minHeight: "100vh" }}
            >
                {showCelebration && (
                    <div className="fixed top-20 left-0 w-full bg-yellow-200 bg-opacity-90 border-b border-yellow-200 shadow-md z-20 transition-all duration-300">
                        {showConfetti && (
                            <Confetti width={dimensions.width} height={dimensions.height} />
                        )}
                        <div className="flex justify-center items-center h-15 font-semibold text-yellow-900 text-lg select-none">
                            🎉 Woohoo! You are {ordinalSuffix(userRank)} in the Leaderboard! 🎉
                        </div>
                    </div>
                )}

                <div className={`${showCelebration ? "pt-10" : "pt-0"}`}>
                    <div className="max-w-4xl mx-auto px-4 py-6 bg-white rounded-xl shadow-md border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-blue-900 tracking-normal select-none">
                                User Leaderboard
                            </h1>

                            <div className="flex gap-4">
                                <button
                                    className={`px-5 py-2 rounded-full transition-transform font-semibold focus:outline-none border ${period === "allTime"
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-gray-100 text-blue-700 border-transparent hover:bg-blue-50"
                                        } text-sm`}
                                    onClick={() => setPeriod("allTime")}
                                    aria-pressed={period === "allTime"}
                                >
                                    All Time
                                </button>
                                <button
                                    className={`px-5 py-2 rounded-full transition-transform font-semibold focus:outline-none border ${period === "thisMonth"
                                        ? "bg-yellow-400 text-white border-yellow-400"
                                        : "bg-gray-100 text-yellow-700 border-transparent hover:bg-yellow-50"
                                        } text-sm`}
                                    onClick={() => setPeriod("thisMonth")}
                                    aria-pressed={period === "thisMonth"}
                                >
                                    This Month
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-28">
                                <div className="flex flex-col items-center text-blue-600">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-6 w-6"
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
                                    <p className="mt-1 text-sm font-medium">Loading leaderboard...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <p className="text-center text-red-600 text-sm font-semibold">{error}</p>
                        ) : leaderboard.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm italic">
                                No leaderboard data available.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-300 rounded-lg shadow-sm text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-4 font-semibold text-gray-700 border-b w-14">
                                                Rank
                                            </th>
                                            <th className="text-left py-2 px-4 font-semibold text-gray-700 border-b">
                                                User
                                            </th>
                                            <th className="text-left py-2 px-4 font-semibold text-gray-700 border-b w-20">
                                                Points
                                            </th>
                                            <th className="text-left py-2 px-4 font-semibold text-gray-700 border-b">
                                                Badges
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {leaderboard.map((u, idx) => {
                                            const isCurrentUser = user && u._id === user.id;
                                            let rankIcon = null;
                                            if (idx === 0)
                                                rankIcon = (
                                                    <span
                                                        title="1st Place"
                                                        role="img"
                                                        className="mr-1 text-xl select-none"
                                                    >
                                                        🥇
                                                    </span>
                                                );
                                            else if (idx === 1)
                                                rankIcon = (
                                                    <span
                                                        title="2nd Place"
                                                        role="img"
                                                        className="mr-1 text-xl select-none"
                                                    >
                                                        🥈
                                                    </span>
                                                );
                                            else if (idx === 2)
                                                rankIcon = (
                                                    <span
                                                        title="3rd Place"
                                                        role="img"
                                                        className="mr-1 text-xl select-none"
                                                    >
                                                        🥉
                                                    </span>
                                                );
                                            const avatarGradient =
                                                GRADIENTS[idx % GRADIENTS.length] || "from-gray-200 to-gray-100";
                                            return (
                                                <tr
                                                    key={u._id}
                                                    className={`${isCurrentUser
                                                        ? "bg-yellow-50 font-semibold border-l-4 border-yellow-400 shadow-sm"
                                                        : "hover:bg-gray-50"
                                                        } transition-colors cursor-pointer`}
                                                    tabIndex={0}
                                                    aria-label={`${u.name}, rank ${idx + 1}, points ${u.points}`}
                                                >
                                                    <td className="py-3 px-4 border-b">
                                                        <div className="flex items-center select-none text-base">
                                                            {rankIcon}
                                                            <span>{idx + 1}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 border-b flex items-center space-x-3">
                                                        <div
                                                            className={`p-1 rounded-full bg-gradient-to-br ${avatarGradient} shadow-sm`}
                                                        >
                                                            <img
                                                                src={u.profile_image || "https://via.placeholder.com/40"}
                                                                alt={`${u.name}'s avatar`}
                                                                className="w-9 h-9 rounded-full object-cover border border-white"
                                                            />
                                                        </div>
                                                        <span className="truncate max-w-xs text-gray-900 font-medium">
                                                            {u.name}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 border-b text-blue-700 font-semibold text-base">
                                                        {u.points}
                                                    </td>
                                                    <td className="py-3 px-4 border-b flex flex-wrap gap-1">
                                                        {
                                                            (u.badges ?? []).length > 0 ? (
                                                                u.badges.map((badge, i) => {
                                                                    const key = badge.toLowerCase(); // handles 'Silver', 'silver', etc.
                                                                    const style = badgeStyles[key] || {
                                                                        bg: "bg-yellow-300", text: "text-yellow-900", shadow: ""
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
                                                                <span className="text-gray-400 italic text-xs select-none">
                                                                    No badges
                                                                </span>
                                                            )}

                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserLeaderboard;
