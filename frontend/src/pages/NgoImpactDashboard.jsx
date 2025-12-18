import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useAuth } from "@/context/AuthContext";
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

/* =========================
   HELPER
========================= */
const cleanFilters = (filters) =>
  Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
  );

export default function NgoImpactDashboard() {
  const { user } = useAuth(); // ✅ get logged-in user
  const ngoId = user?.ngo?._id;

  const [data, setData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     FILTER STATE
  ========================= */
  const [filters, setFilters] = useState({
    fromMonth: "",
    toMonth: "",
    campaignId: "",
  });

  /* =========================
     FETCH NGO CAMPAIGNS (ONLY OWN NGO)
  ========================= */
  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");

    const res = await axios.get(`${BaseURL}/api/v1/campaign`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // ✅ Frontend filter: only campaigns of logged-in NGO
    const ngoCampaigns = (res.data || []).filter(
      (campaign) => campaign.ngo?._id === ngoId
    );
    
    setCampaigns(ngoCampaigns);
    } catch (err) {
      console.error("Failed to fetch NGO campaigns:", err);
    }
  };

  /* =========================
     FETCH NGO ANALYTICS
  ========================= */
  const fetchNgoData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BaseURL}/api/analytics/ngo`, {
        headers: { Authorization: `Bearer ${token}` },
        params: cleanFilters(filters),
      });

      setData(res.data);
      setError(null);
    } catch (err) {
      console.error("NGO dashboard error:", err);
      setError("Unable to load NGO analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ngoId) {
      fetchCampaigns();
      fetchNgoData();
    }
  }, [ngoId]);

  /* =========================
     PDF DOWNLOAD
  ========================= */
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");
      const query = new URLSearchParams(cleanFilters(filters)).toString();

      const response = await fetch(`${BaseURL}/api/reports/ngo?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `SewaSetu_NGO_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download NGO report");
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

      <div className="max-w-6xl mx-auto py-10 px-6 space-y-10">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">NGO Impact Dashboard</h1>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className={`px-5 py-2 rounded-lg text-white ${
              downloading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="month"
              value={filters.fromMonth}
              onChange={(e) =>
                setFilters({ ...filters, fromMonth: e.target.value })
              }
              className="border rounded px-3 py-2"
            />

            <input
              type="month"
              value={filters.toMonth}
              onChange={(e) =>
                setFilters({ ...filters, toMonth: e.target.value })
              }
              className="border rounded px-3 py-2"
            />

            {/* ✅ CAMPAIGN DROPDOWN (ONLY OWN NGO) */}
            <select
              value={filters.campaignId}
              onChange={(e) =>
                setFilters({ ...filters, campaignId: e.target.value })
              }
              className="border rounded px-3 py-2"
            >
              <option value="">All Campaigns</option>
              {campaigns.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchNgoData}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Apply Filters
          </button>
        </div>

        {/* SUMMARY */}
        <SummaryGrid summary={summary} />

        {/* CHARTS */}
        <ChartSection title="Donation Handling Overview">
          <PieWrapper
            data={handledDonations?.map((h) => ({
              label: h._id,
              value: h.count,
            }))}
          />
        </ChartSection>

        <ChartSection title="Monthly Fund Inflow">
          <LineWrapper data={donationsOverTime} />
        </ChartSection>

        <ChartSection title="Donor Contribution Ranges">
          <BarWrapper data={donorContributionDist} />
        </ChartSection>

        {/* TABLES */}
        <TableSection title="Top Donors">
          {topDonors?.length ? (
            topDonors.map((d, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{d.donorName || "Anonymous"}</td>
                <td>₹{d.totalDonated.toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={3} />
          )}
        </TableSection>

        <TableSection title="Campaign Performance">
          {donationsByCampaign?.length ? (
            donationsByCampaign.map((c, i) => (
              <tr key={i}>
                <td>{c.campaignName}</td>
                <td>₹{c.amount.toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={2} />
          )}
        </TableSection>

        <TableSection title="Monthly Donation Breakdown">
          {donationsOverTime?.length ? (
            donationsOverTime.map((m, i) => (
              <tr key={i}>
                <td>{m.label}</td>
                <td>₹{m.value.toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={2} />
          )}
        </TableSection>
      </div>
    </div>
  );
}

/* =========================
   SUB COMPONENTS
========================= */

const SummaryGrid = ({ summary }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
    {[
      ["Total Funds (₹)", summary.totalFunds],
      ["Avg Donation (₹)", summary.avgDonation],
      ["Total Donors", summary.totalDonors],
      ["Active Campaigns", summary.activeCampaigns],
      ["Completed Requests", summary.completedRequests],
      ["Total Campaigns", summary.totalCampaigns],
    ].map(([label, value], i) => (
      <div key={i} className="bg-white p-5 rounded-xl shadow text-center">
        <h3 className="text-2xl font-bold">{value?.toLocaleString() || 0}</h3>
        <p className="text-gray-600">{label}</p>
      </div>
    ))}
  </div>
);

const ChartSection = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const TableSection = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <table className="min-w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th># / Label</th>
          <th>Name</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const EmptyRow = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-4 text-gray-500">
      No data available
    </td>
  </tr>
);

/* =========================
   CHARTS
========================= */
const PieWrapper = ({ data }) =>
  data?.length ? (
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
  ) : (
    <p className="text-center text-gray-500">No data available</p>
  );

const LineWrapper = ({ data }) =>
  data?.length ? (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line dataKey="value" stroke="#3B82F6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <p className="text-center text-gray-500">No data available</p>
  );

const BarWrapper = ({ data }) =>
  data?.length ? (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#16A34A" />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <p className="text-center text-gray-500">No data available</p>
  );
