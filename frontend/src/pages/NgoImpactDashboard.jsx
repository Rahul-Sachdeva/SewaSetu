import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { BaseURL } from "@/BaseURL";

const PIE_COLORS = ["#16A34A", "#3B82F6", "#F59E0B", "#DC2626", "#7C3AED"];

export default function NgoImpactDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchNgoData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BaseURL}/api/analytics/ngo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("NGO dashboard error:", err);
        setError("Unable to load NGO analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchNgoData();
  }, []);

  // 🧾 Dual Action PDF Generation (Browser + Backend)
  const handleDownloadPDF = async () => {
    // Step 1️⃣: Native browser print-to-PDF (fast preview)
    window.print();

    // Step 2️⃣: Also trigger backend Puppeteer-generated detailed report
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${BaseURL}/api/reports/ngo`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Backend NGO PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SewaSetu_NGO_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      console.log("✅ NGO PDF downloaded successfully!");
    } catch (err) {
      console.error("❌ Failed to download NGO report:", err);
      alert("Failed to download backend-generated NGO report. See console for details.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-red-600 text-center">{error}</div>;
  if (!data) return <div className="p-10 text-center">No data available</div>;

  const {
    summary,
    donationsByCampaign,
    donationsOverTime,
    handledDonations,
    topDonors,
    donorContributionDist,
  } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 🖨️ Print Styles */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #ngo-dashboard-root, #ngo-dashboard-root * { visibility: visible; }
            #ngo-dashboard-root { position: absolute; left: 0; top: 0; width: 100%; }
            .print-hide { display: none !important; }
            body { background: #fff !important; }
          }
        `}
      </style>

      <div id="ngo-dashboard-root" className="max-w-6xl mx-auto py-10 px-6 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between print-hide">
          <h1 className="text-3xl font-bold">NGO Impact Dashboard</h1>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className={`px-5 py-2 rounded-lg font-semibold text-white shadow transition ${
              downloading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { label: "Total Funds (₹)", value: summary.totalFunds, icon: "💰" },
            { label: "Avg Donation (₹)", value: summary.avgDonation, icon: "📈" },
            { label: "Total Donors", value: summary.totalDonors, icon: "🎁" },
            { label: "Active Campaigns", value: summary.activeCampaigns, icon: "📅" },
            { label: "Completed Requests", value: summary.completedRequests, icon: "✅" },
            { label: "Total Campaigns", value: summary.totalCampaigns, icon: "🏕️" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 text-center">
              <span className="text-4xl mb-2">{item.icon}</span>
              <h3 className="text-2xl font-bold">{item.value}</h3>
              <p className="text-gray-600 font-medium">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Section 1: Donation Handling Overview */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Donation Handling Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={handledDonations || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                isAnimationActive={false}
              >
                {(handledDonations || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Section 2: Top Donors Table */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Top Donors</h2>
          <table className="min-w-full text-left border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Donor Name</th>
                <th className="px-4 py-2">Total Donated (₹)</th>
              </tr>
            </thead>
            <tbody>
              {topDonors && topDonors.length > 0 ? (
                topDonors.map((donor, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{i + 1}</td>
                    <td className="px-4 py-2">{donor.donorName || "Anonymous"}</td>
                    <td className="px-4 py-2">{donor.totalDonated.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-3">
                    No donor data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 3: Campaign Performance Table */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Campaign Performance</h2>
          <table className="min-w-full text-left border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2">Campaign</th>
                <th className="px-4 py-2">Total Funds (₹)</th>
              </tr>
            </thead>
            <tbody>
              {donationsByCampaign && donationsByCampaign.length > 0 ? (
                donationsByCampaign.map((c, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{c.campaignName}</td>
                    <td className="px-4 py-2">{c.amount.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center py-3">
                    No campaign data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 4: Monthly Fund Inflow */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Monthly Fund Inflow</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={donationsOverTime || []}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Tooltip />
              <Legend />
              <XAxis dataKey="label" />
              <YAxis />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Section 5: Donor Contribution Ranges */}
        {donorContributionDist && donorContributionDist.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Donor Contribution Ranges</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donorContributionDist}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#16A34A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
