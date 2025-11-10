import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import Navbar from "../components/Navbar";
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

// Sample summary values (will always show, feel free to adjust)
const statsConfig = [
  { key: "totalMeals", label: "Total Meals Donated", icon: "🍽️", bg: "#d1fae5", color: "#065f46", value: 5826 },
  { key: "totalNGOs", label: "Total NGOs Onboarded", icon: "🏢", bg: "#bfdbfe", color: "#1e3a8a", value: 17 },
  { key: "citiesImpacted", label: "Cities Impacted", icon: "🏙️", bg: "#ede9fe", color: "#6d28d9", value: 12 },
  { key: "activeCampaigns", label: "Active Campaigns This Month", icon: "📅", bg: "#fef9c3", color: "#b45309", value: 4 },
  { key: "totalDonors", label: "Total Donors", icon: "🎁", bg: "#fde0e6", color: "#be123c", value: 120 },
  { key: "totalRequestsCompleted", label: "Requests Completed", icon: "✅", bg: "#e0e7ff", color: "#4338ca", value: 95 },
];

const PIE_COLORS = ["#4CAF50", "#0862abff", "#9C27B0", "#cec14eff", "#a41309ff", "#c0780dff"];

// Bar chart: Top cities impacted by requests
const citiesData = [
  { city: "Ahmedabad", count: 18 },
  { city: "Bangalore", count: 13 },
  { city: "Delhi", count: 12 },
  { city: "Mumbai", count: 9 },
  { city: "Pune", count: 8 },
  { city: "Surat", count: 7 },
  { city: "Jaipur", count: 6 },
  { city: "Hyderabad", count: 5 },
  { city: "Kolkata", count: 5 },
  { city: "Chennai", count: 4 },
];

// Pie chart: Donations by campaign
const donationsByCampaign = [
  { campaignName: "Food Drive", amount: 4100 },
  { campaignName: "Book Collection", amount: 1700 },
  { campaignName: "Medical Camp", amount: 2400 },
  { campaignName: "Winter Clothes", amount: 900 },
];

// Pie chart: Request status distribution
const requestStatusDist = [
  { label: "completed", value: 64 },
  { label: "open", value: 17 },
  { label: "in_progress", value: 12 },
  { label: "cancelled", value: 3 },
];

// Bar chart: Top NGOs by donations
const topNGOs = [
  { ngoName: "Helping Hands NGO", value: 1250 },
  { ngoName: "Sewa Setu Trust", value: 1100 },
  { ngoName: "HealthPlus", value: 890 },
  { ngoName: "EduForAll", value: 850 },
  { ngoName: "Udaan Initiative", value: 720 },
];

// Line chart: Donations over time (monthly)
const donationsOverTime = [
  { label: "2025-1", value: 450 },
  { label: "2025-2", value: 580 },
  { label: "2025-3", value: 720 },
  { label: "2025-4", value: 900 },
  { label: "2025-5", value: 800 },
  { label: "2025-6", value: 1000 },
  { label: "2025-7", value: 930 },
  { label: "2025-8", value: 1050 },
  { label: "2025-9", value: 1120 },
  { label: "2025-10", value: 1300 },
  { label: "2025-11", value: 1400 },
  { label: "2025-12", value: 1600 },
];

const chartContainerStyle = {
  background: "white",
  padding: "1rem",
  borderRadius: "0.75rem",
  boxShadow: "0 2px 6px rgb(0 0 0 / 0.1)",
};

// Function to replace 'oklch' color values with safe hex colors recursively
const replaceOklchColors = (element) => {
  if (!element) return;

  // Collect element and all descendants
  const elements = [element, ...element.querySelectorAll("*")];
  elements.forEach((el) => {
    const computedStyle = window.getComputedStyle(el);

    // Properties to check
    ["backgroundColor", "color", "borderColor"].forEach((prop) => {
      const value = computedStyle[prop];
      if (value && value.includes("oklch")) {
        // Replace with fallback safe color: background gets light gray, others dark gray
        if (prop === "backgroundColor") {
          el.style[prop] = "#f9fafb";
        } else {
          el.style[prop] = "#111827";
        }
      }
    });
  });
};

const PublicImpactDashboard = () => {
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const element = document.getElementById("dashboard-content");
    if (element) {
      element.style.backgroundColor = "#f9fafb";
      element.style.color = "#111827";
    }
  }, []);

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    const element = document.getElementById("dashboard-content");
    if (!element) {
      alert("Dashboard content not found");
      setPdfLoading(false);
      return;
    }

    // Replace all 'oklch' colors before generating PDF
    const replaceOklchColors = (element) => {
      if (!element) return;

      const elements = [element, ...element.querySelectorAll("*")];
      const propsToCheck = [
        "backgroundColor",
        "color",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "boxShadow",
        "textShadow",
      ];

      elements.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);

        propsToCheck.forEach((prop) => {
          const value = computedStyle[prop];
          if (value && value.includes("oklch")) {
            if (prop === "backgroundColor") {
              el.style[prop] = "#f9fafb";
            } else if (prop.includes("shadow")) {
              // Remove shadows to avoid complex color formats
              el.style[prop] = "none";
            } else {
              el.style[prop] = "#111827";
            }
          }
        });
      });
    };


    try {
      await html2pdf()
        .set({
          margin: [10, 10],
          filename: "ImpactDashboard.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, logging: true, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
    } catch (error) {
      console.error("PDF generation error:", error);
    }
    setPdfLoading(false);
  };

  return (
    <div className="bg-[#f9fafb] text-[#111827] min-h-screen flex flex-col">
      {/* Navbar with bottom border and background matching dashboard */}
      <header className="bg-white shadow-md sticky top-0 z-20">
        <Navbar />
      </header>
      <div className="max-w-7xl mx-auto px-20 py-12 space-y-12 bg-[#f9fafb] text-[#111827]">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Public Impact Dashboard
          </h1>
          <button
            onClick={handleGeneratePDF}
            className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow"
            disabled={pdfLoading}
          >
            {pdfLoading ? "Generating PDF..." : "Download PDF Report"}
          </button>
        </div>

        <div id="dashboard-content">
          {/* Summary cards: 4 in first row, 2 centered in second */}
          <div className="grid grid-cols-4 gap-8 justify-center mx-auto max-w-5xl">
            {statsConfig.map(({ key, label, icon, bg, color, value }, index) => (
              <div
                key={key}
                style={{ background: bg, color: color }}
                className={`rounded-xl shadow-md p-6 flex flex-col items-center justify-center ${index >= 4 ? "col-span-2" : ""
                  }`}
                role="region"
                aria-label={label}
              >
                <div className="text-5xl mb-4" aria-hidden="true">
                  {icon}
                </div>
                <p className="text-3xl font-bold">{value.toLocaleString()}</p>
                <p className="mt-2 text-lg font-semibold text-center">{label}</p>
              </div>
            ))}
          </div>

          {/* Layout charts: center with max width and spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 max-w-6xl mx-auto">
            {/* Bar Chart: Cities Impacted */}
            <section style={chartContainerStyle}>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Cities Impacted (Top 10)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={citiesData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <XAxis dataKey="city" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#6366f1" name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* Pie Chart: Donations by Campaign */}
            <section style={chartContainerStyle}>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Donations by Campaign</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={donationsByCampaign}
                    dataKey="amount"
                    nameKey="campaignName"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    fill="#8884d8"
                  >
                    {donationsByCampaign.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </section>

            {/* Pie Chart: Request Status Distribution */}
            <section style={chartContainerStyle}>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Requests by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={requestStatusDist}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    fill="#4caf50"
                  >
                    {requestStatusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </section>

            {/* Bar Chart: Top NGOs by Donations */}
            <section style={chartContainerStyle}>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Top NGOs by Donations</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topNGOs} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <XAxis dataKey="ngoName" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#10b981" name="Donations" />
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* Line Chart: Donations Over Time */}
            <section style={chartContainerStyle} className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Donations Over Time (Past Year)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={donationsOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" name="Donations" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicImpactDashboard;
