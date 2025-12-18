import React, { useState, useEffect, useCallback } from "react";
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

const PIE_COLORS = [
  "#4CAF50",
  "#0a3f6a",
  "#9C27B0",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
];

const chartContainerStyle = {
  background: "white",
  padding: "1rem",
  borderRadius: "0.75rem",
  boxShadow: "0 2px 6px rgb(0 0 0 / 0.1)",
};

/* ============================
   HELPER: CLEAN FILTERS
============================ */
const cleanFilters = (filters) =>
  Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
  );

export default function PublicImpactDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const [ngoList, setNgoList] = useState([]);

  /* ============================
     FILTER STATES (ALIGNED)
  ============================ */
  const [filters, setFilters] = useState({
    fromMonth: "",
    toMonth: "",
    ngoId: "",
    city: "",
  });

  /* ============================
     FETCH NGO LIST
  ============================ */
  const fetchNgos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BaseURL}/api/v1/ngo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNgoList(res.data || []);
    } catch (err) {
      console.error("Failed to load NGOs", err);
    }
  };

  /* ============================
     FETCH ANALYTICS
  ============================ */
  const fetchAnalytics = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(`${BaseURL}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: cleanFilters(filters),
      });
      setAnalytics(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgos();
    fetchAnalytics();
  }, []);

  /* ============================
     PDF DOWNLOAD (BACKEND)
  ============================ */
  const handleGeneratePDF = async () => {
    window.print(); // keeping your original behavior
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");

      const query = new URLSearchParams(cleanFilters(filters)).toString();

      const response = await fetch(
        `${BaseURL}/api/reports/generate?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `SewaSetu_Admin_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading dashboard…</div>;
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
    { label: "Total Funds", value: summary?.totalFunds, icon: "💰" },
    { label: "Total NGOs", value: summary?.totalNGOs, icon: "🏢" },
    { label: "Active Campaigns", value: summary?.activeCampaigns, icon: "📅" },
    { label: "Total Donors", value: summary?.totalDonors, icon: "🎁" },
    { label: "Avg Donation", value: summary?.avgDonation, icon: "📈" },
    { label: "Requests Completed", value: summary?.completedRequests, icon: "✅" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>
          <button
            onClick={handleGeneratePDF}
            disabled={downloading}
            className={`px-5 py-2 rounded-lg font-semibold text-white ${
              downloading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {downloading ? "Generating…" : "Download PDF"}
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          <div className="grid md:grid-cols-4 gap-4">
            <FilterMonth
              label="From (Month)"
              value={filters.fromMonth}
              onChange={(v) => setFilters({ ...filters, fromMonth: v })}
            />

            <FilterMonth
              label="To (Month)"
              value={filters.toMonth}
              onChange={(v) => setFilters({ ...filters, toMonth: v })}
            />

            <div>
              <label className="block text-sm font-medium mb-1">NGO</label>
              <select
                value={filters.ngoId}
                onChange={(e) =>
                  setFilters({ ...filters, ngoId: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All NGOs</option>
                {ngoList.map((ngo) => (
                  <option key={ngo._id} value={ngo._id}>
                    {ngo.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Delhi"
                value={filters.city}
                onChange={(e) =>
                  setFilters({ ...filters, city: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <button
            onClick={fetchAnalytics}
            className="mt-5 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Apply Filters
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-4xl mb-2">{s.icon}</div>
              <p className="text-2xl font-bold">
                {s.value ? s.value.toLocaleString() : 0}
              </p>
              <p className="text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid md:grid-cols-2 gap-8">
          <ChartBox title="Requests by Status">
            <PieChartWrapper data={requestStatusDist} />
          </ChartBox>
          <ChartBox title="Donation Types">
            <PieChartWrapper data={donationTypeBreakdown} />
          </ChartBox>
          <ChartBox title="Donation Handling">
            <PieChartWrapper data={donationHandlingDist} />
          </ChartBox>
          <ChartBox title="Top Donors">
            <BarChartWrapper data={topDonors} x="donorName" y="totalDonated" />
          </ChartBox>
          <ChartBox title="Top Campaigns">
            <BarChartWrapper data={topCampaigns} x="campaignName" y="amount" />
          </ChartBox>
          <ChartBox title="Top NGOs">
            <BarChartWrapper data={ngoLeaderboard} x="ngoName" y="totalFunds" />
          </ChartBox>
          <ChartBox title="Monthly Donations" wide>
            <LineChartWrapper data={donationsOverTime} />
          </ChartBox>
        </div>
      </div>
    </div>
  );
}

/* ============================
   SMALL REUSABLE PARTS
============================ */
function FilterMonth({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}

function ChartBox({ title, children, wide }) {
  return (
    <section
      style={chartContainerStyle}
      className={wide ? "md:col-span-2" : ""}
    >
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function PieChartWrapper({ data }) {
  if (!data?.length) return <p className="text-gray-500 text-center">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" outerRadius={90}>
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

function BarChartWrapper({ data, x, y }) {
  if (!data?.length) return <p className="text-gray-500 text-center">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey={x} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={y} fill="#0a3f6a" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineChartWrapper({ data }) {
  if (!data?.length) return <p className="text-gray-500 text-center">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line dataKey="value" stroke="#650b53" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
