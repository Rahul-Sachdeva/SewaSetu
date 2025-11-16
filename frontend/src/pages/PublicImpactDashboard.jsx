import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { BaseURL } from "@/BaseURL";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const PIE_COLORS = ["#4CAF50", "#0a3f6aff", "#9C27B0", "#F59E0B", "#EF4444", "#3B82F6"];
const chartContainerStyle = {
  background: "white",
  padding: "1rem",
  borderRadius: "0.75rem",
  boxShadow: "0 2px 6px rgb(0 0 0 / 0.1)",
};

export default function PublicImpactDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${BaseURL}/api/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(res.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Unable to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Handle both print + backend PDF download
  const handleGeneratePDF = async () => {
    // 1️⃣ Existing browser print feature
    window.print();

    // 2️⃣ Also generate & download backend PDF
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${BaseURL}/api/reports/generate`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Backend PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SewaSetu_Admin_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      console.log("✅ Backend PDF downloaded successfully");
    } catch (err) {
      console.error("❌ Backend report download failed:", err);
      alert("Failed to download the backend-generated report. Check console for details.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-10 text-red-600 text-center">{error}</div>;

  const {
    summary,
    requestStatusDist,
    donationsOverTime,
    donationTypeBreakdown,
    donationHandlingDist,
    topDonors,
    topCampaigns,
    ngoLeaderboard,
  } = analytics || {};

  const stats = [
    { label: "Total Funds Raised", value: summary?.totalFunds, icon: "💰" },
    { label: "Total NGOs", value: summary?.totalNGOs, icon: "🏢" },
    { label: "Active Campaigns", value: summary?.activeCampaigns, icon: "📅" },
    { label: "Total Donors", value: summary?.totalDonors, icon: "🎁" },
    { label: "Avg Donation (₹)", value: summary?.avgDonation, icon: "📈" },
    { label: "Requests Completed", value: summary?.completedRequests, icon: "✅" },
    { label: "Cities Impacted", value: summary?.citiesImpacted, icon: "🏙️" },
    { label: "Total Donations", value: summary?.totalDonations, icon: "📦" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #dashboard-root, #dashboard-root * { visibility: visible; }
            #dashboard-root { position: absolute; left: 0; top: 0; width: 100%; }
            .print-hide { display: none !important; }
            .chart-box { page-break-inside: avoid; }
            body { background-color: #fff !important; }
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10" id="dashboard-root">
        <div className="flex justify-between items-center print-hide">
          <h1 className="text-3xl font-bold text-gray-800">Admin Analytics Dashboard</h1>
          <button
            onClick={handleGeneratePDF}
            className={`px-5 py-2 rounded-lg font-semibold text-white transition shadow ${downloading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            disabled={downloading}
          >
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-4xl mb-2">{s.icon}</div>
              <p className="text-2xl font-bold">
                {s.value ? s.value.toLocaleString() : 0}
              </p>
              <p className="text-gray-600 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ChartBox title="Requests by Status">
            <PieChartWrapper data={requestStatusDist} nameKey="label" dataKey="value" />
          </ChartBox>
          <ChartBox title="Donations by Type">
            <PieChartWrapper data={donationTypeBreakdown} nameKey="label" dataKey="value" />
          </ChartBox>
          <ChartBox title="Donation Handling Status">
            <PieChartWrapper data={donationHandlingDist} nameKey="label" dataKey="value" />
          </ChartBox>
          <ChartBox title="Top Donors (All NGOs)">
            <BarChartWrapper data={topDonors} xKey="donorName" yKey="totalDonated" />
          </ChartBox>
          <ChartBox title="Top Campaigns by Fundraising">
            <BarChartWrapper data={topCampaigns} xKey="campaignName" yKey="amount" />
          </ChartBox>
          <ChartBox title="Top NGOs by Funds Raised">
            <BarChartWrapper data={ngoLeaderboard} xKey="ngoName" yKey="totalFunds" />
          </ChartBox>
          <ChartBox title="Monthly Donations Trend" wide>
            <LineChartWrapper data={donationsOverTime} />
          </ChartBox>
        </div>
      </div>
    </div>
  );
}

/* ---------- Chart Components ---------- */
function ChartBox({ title, children, wide }) {
  return (
    <section style={chartContainerStyle} className={`chart-box ${wide ? "md:col-span-2" : ""}`}>
      <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>
      {children}
    </section>
  );
}

function PieChartWrapper({ data, nameKey, dataKey }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 italic mt-35 ">No data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          isAnimationActive={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function BarChartWrapper({ data, xKey, yKey }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 italic">No data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} angle={-20} textAnchor="end" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={yKey} fill="#07989aff" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineChartWrapper({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 italic">No data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#650b53ff"
          strokeWidth={2}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
