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
  "#0a3f6aff",
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

export default function PublicImpactDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true); // Toggle filters panel

  /* 🔹 FILTERS */
  const [filters, setFilters] = useState({
    period: "allTime",        // allTime, thisMonth, last3Months, last6Months, custom
    startDate: "",
    endDate: "",
    ngoId: "all",
    campaignId: "all",
    city: "all",
    donationType: "all",
  });

  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    campaigns: [],
    ngos: [],
  });

  const [search, setSearch] = useState({
    ngo: "",
    campaign: "",
  });

  /* 🔹 DEBOUNCED FETCH */
  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = {
        period: filters.period,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.ngoId !== "all" && { ngoId: filters.ngoId }),
        ...(filters.campaignId !== "all" && { campaignId: filters.campaignId }),
        ...(filters.city !== "all" && { city: filters.city }),
        ...(filters.donationType !== "all" && { donationType: filters.donationType }),
      };

      const res = await axios.get(`${BaseURL}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setAnalytics(res.data);
      setFilterOptions({
        cities: res.data.cities || [],
        campaigns: res.data.campaignList || [],
        ngos: res.data.ngoList || [],
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Unable to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /* 🔹 PERIOD HANDLER */
  const handlePeriodChange = (newPeriod) => {
    setFilters(prev => ({ ...prev, period: newPeriod, startDate: "", endDate: "" }));
  };

  /* 🔹 DATE RANGE HANDLER */
  const handleDateRangeChange = (type) => (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      [type]: value,
      period: "custom"
    }));
  };

  /* 🔹 RESET FILTERS */
  const resetFilters = () => {
    setFilters({
      period: "allTime",
      startDate: "",
      endDate: "",
      ngoId: "all",
      campaignId: "all",
      city: "all",
      donationType: "all",
    });
    setSearch({ ngo: "", campaign: "" });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAnalytics();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchAnalytics]);

  /* 🔹 PDF DOWNLOAD */
  // 🧾 ROBUST PDF DOWNLOAD WITH PROPER FILTER HANDLING
  const handleGeneratePDF = async () => {
    // 1️⃣ Browser print (always works)
    window.print();

    // 2️⃣ Backend PDF with proper filter handling
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");

      // ✅ Build clean query params (skip empty/"all" values)
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.append(key, value);
        }
      });

      const endpoint = params.get("ngoId") ? "/api/reports/ngo" : "/api/reports/generate";
      const url = `${BaseURL}${endpoint}${params.toString() ? `?${params.toString()}` : ""}`;

      console.log("📄 Downloading PDF from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/pdf"
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (!response.headers.get("content-type")?.includes("application/pdf")) {
        throw new Error("Invalid response: Expected PDF");
      }

      const blob = await response.blob();
      const urlObj = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObj;
      a.download = `SewaSetu_${params.get("ngoId") ? "NGO" : "Admin"}_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlObj);

      console.log("✅ PDF downloaded successfully!");

    } catch (err) {
      console.error("❌ Backend PDF failed:", err);

      // Graceful fallback message
      alert(
        `Backend PDF failed: ${err.message}\n\n` +
        "✅ Browser print-to-PDF still works perfectly!\n" +
        "💡 Try: Ctrl+P → Save as PDF"
      );
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

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #dashboard-root, #dashboard-root * { visibility: visible; }
          #dashboard-root { position: absolute; left: 0; top: 0; width: 100%; }
          .print-hide { display: none !important; }
          .chart-box { page-break-inside: avoid; }
          body { background-color: #fff !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10" id="dashboard-root">
        {/* Header */}
        <div className="flex justify-between items-center print-hide">
          <h1 className="text-3xl font-bold text-gray-800">Admin Analytics Dashboard</h1>
          <button
            onClick={handleGeneratePDF}
            disabled={downloading}
            className={`px-5 py-2 rounded-lg font-semibold text-white shadow ${downloading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>

        {/* 🔹 FILTER PANEL */}
        <div className="bg-white p-6 rounded-xl shadow print-hide">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Filters</h3>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isFilterOpen ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {isFilterOpen && (
            <div className="space-y-6">
              {/* Time Period */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Time Period</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "allTime", label: "All Time" },
                    { value: "thisMonth", label: "This Month" },
                    { value: "last3Months", label: "Last 3M" },
                    { value: "last6Months", label: "Last 6M" },
                    { value: "custom", label: "Custom" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handlePeriodChange(value)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition ${filters.period === value
                          ? "bg-blue-600 text-white shadow"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {filters.period === "custom" && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-sm"
                      value={filters.startDate}
                      onChange={handleDateRangeChange("startDate")}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-sm"
                      value={filters.endDate}
                      onChange={handleDateRangeChange("endDate")}
                    />
                  </div>
                )}
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NGO */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">NGO</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search NGO..."
                      value={search.ngo}
                      onChange={(e) => setSearch({ ...search, ngo: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                    <select
                      className="w-full border rounded mt-1 px-3 py-2 text-sm"
                      value={filters.ngoId}
                      onChange={(e) => setFilters({ ...filters, ngoId: e.target.value })}
                    >
                      <option value="all">All NGOs</option>
                      {filterOptions.ngos
                        .filter(ngo => ngo.name.toLowerCase().includes(search.ngo.toLowerCase()))
                        .map(ngo => (
                          <option key={ngo._id} value={ngo._id}>{ngo.name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Campaign */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Campaign</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Campaign..."
                      value={search.campaign}
                      onChange={(e) => setSearch({ ...search, campaign: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                    <select
                      className="w-full border rounded mt-1 px-3 py-2 text-sm"
                      value={filters.campaignId}
                      onChange={(e) => setFilters({ ...filters, campaignId: e.target.value })}
                    >
                      <option value="all">All Campaigns</option>
                      {filterOptions.campaigns
                        .filter(campaign => campaign.name.toLowerCase().includes(search.campaign.toLowerCase()))
                        .map(campaign => (
                          <option key={campaign._id} value={campaign._id}>{campaign.name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">City</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  >
                    <option value="all">All Cities</option>
                    {filterOptions.cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Donation Type */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Donation Type</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={filters.donationType}
                    onChange={(e) => setFilters({ ...filters, donationType: e.target.value })}
                  >
                    <option value="all">All Types</option>
                    <option value="money">Money</option>
                    <option value="food">Food</option>
                    <option value="clothes">Clothes</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Badges */}
          {Object.values(filters).some(f => f !== "all" && f) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.period !== "allTime" && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {filters.period.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              )}
              {filters.ngoId !== "all" && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  {filterOptions.ngos.find(n => n._id === filters.ngoId)?.name || filters.ngoId}
                </span>
              )}
              {filters.campaignId !== "all" && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                  {filterOptions.campaigns.find(c => c._id === filters.campaignId)?.name || filters.campaignId}
                </span>
              )}
              {filters.city !== "all" && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                  {filters.city}
                </span>
              )}
              {filters.donationType !== "all" && (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                  {filters.donationType}
                </span>
              )}
            </div>
          )}
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
          <ChartBox title="Top Donors">
            <BarChartWrapper data={topDonors} xKey="donorName" yKey="totalDonated" />
          </ChartBox>
          <ChartBox title="Top Campaigns">
            <BarChartWrapper data={topCampaigns} xKey="campaignName" yKey="amount" />
          </ChartBox>
          <ChartBox title="Top NGOs">
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

/* ---------- CHART COMPONENTS ---------- */
function ChartBox({ title, children, wide }) {
  return (
    <section
      style={chartContainerStyle}
      className={`chart-box ${wide ? "md:col-span-2" : ""}`}
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>
      {children}
    </section>
  );
}

function PieChartWrapper({ data, nameKey, dataKey }) {
  if (!data || data.length === 0)
    return <p className="text-center text-gray-500 italic">No data yet</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          outerRadius={90}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
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
  if (!data || data.length === 0)
    return <p className="text-center text-gray-500 italic">No data yet</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey={xKey} angle={-20} textAnchor="end" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={yKey} fill="#07989aff" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineChartWrapper({ data }) {
  if (!data || data.length === 0)
    return <p className="text-center text-gray-500 italic">No data yet</p>;

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
