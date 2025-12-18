import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import axios from "axios";
import { backendURL } from "../constant.js";
import { NGO } from "../Models/ngo.model.js";

export const generateNgoReport = async ({ ngoId, token, filters = {} }) => {
  const date = new Date();
  const reportsDir = path.resolve("reports");

  const reportFileName = `SewaSetu_NGO_Report_${ngoId}_${date
    .toISOString()
    .slice(0, 10)}.pdf`;

  const reportPath = path.join(reportsDir, reportFileName);
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  try {
    /* ==============================
       Ensure reports directory
    ============================== */
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    /* ==============================
       Verify NGO
    ============================== */
    const ngo = await NGO.findById(ngoId);
    if (!ngo || ngo.verification_status !== "verified") {
      throw new Error("NGO is not verified to generate reports");
    }

    /* ==============================
       Fetch NGO analytics (FILTERED)
    ============================== */
    const { data: analytics } = await axios.get(
      `${backendURL}/api/analytics/ngo`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ngoId,
          fromMonth: filters.fromMonth,
          toMonth: filters.toMonth,
          campaignId: filters.campaignId,
        },
      }
    );

    /* ==============================
       Normalize datasets
    ============================== */
    const donationTrend = analytics.donationsOverTime || [];
    const handlingData = (analytics.handledDonations || []).map((h) => ({
      label: h._id,
      value: h.count,
    }));
    const donors = analytics.topDonors || [];
    const campaigns = analytics.donationsByCampaign || [];

    /* ==============================
       Human-readable filters
    ============================== */
    const filterText = `
      Period: ${filters.fromMonth || "Start"} → ${filters.toMonth || "Present"}
      ${filters.campaignId ? ` | Campaign ID: ${filters.campaignId}` : ""}
    `;

    /* ==============================
       Build HTML
    ============================== */
    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px 40px;
              color: #222;
            }

            h1, h2, h3 { color: #0B5394; }
            h2 {
              border-bottom: 2px solid #0B5394;
              padding-bottom: 4px;
              margin-top: 30px;
            }

            .filters {
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 10px;
              border-radius: 6px;
              font-size: 13px;
              margin-top: 10px;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-top: 20px;
            }

            .card {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 12px;
              text-align: center;
              background: #f9fafb;
            }

            .card h3 {
              font-size: 14px;
              margin-bottom: 6px;
            }

            .card p {
              font-size: 18px;
              font-weight: bold;
            }

            .chart {
              margin-top: 25px;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 12px;
            }

            .nodata {
              text-align: center;
              font-size: 13px;
              color: #777;
              padding: 20px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              font-size: 13px;
            }

            th { background: #f1f5f9; }

            footer {
              margin-top: 40px;
              font-size: 12px;
              text-align: center;
              color: #777;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>

        <body>
          <h1>${ngo.name} – Impact Report</h1>
          <p><strong>Generated on:</strong> ${date.toDateString()}</p>

          <div class="filters">
            <strong>Applied Filters:</strong> ${filterText}
          </div>

          <h2>Summary Overview</h2>
          <div class="summary">
            <div class="card"><h3>Total Funds</h3><p>₹${analytics.summary.totalFunds.toLocaleString()}</p></div>
            <div class="card"><h3>Avg Donation</h3><p>₹${analytics.summary.avgDonation}</p></div>
            <div class="card"><h3>Total Donors</h3><p>${analytics.summary.totalDonors}</p></div>
            <div class="card"><h3>Active Campaigns</h3><p>${analytics.summary.activeCampaigns}</p></div>
            <div class="card"><h3>Completed Requests</h3><p>${analytics.summary.completedRequests}</p></div>
            <div class="card"><h3>Total Campaigns</h3><p>${analytics.summary.totalCampaigns}</p></div>
          </div>

          <h2>Donation Trends</h2>
          <div class="chart">
            ${
              donationTrend.length
                ? `<canvas id="trendChart"></canvas>`
                : `<div class="nodata">No donation trend data available for selected filters</div>`
            }
          </div>

          <h2>Donation Handling Status</h2>
          <div class="chart">
            ${
              handlingData.length
                ? `<canvas id="handlingChart"></canvas>`
                : `<div class="nodata">No donation handling data available</div>`
            }
          </div>

          <h2>Top Donors</h2>
          ${
            donors.length
              ? `
              <table>
                <thead><tr><th>Donor</th><th>Total Donated (₹)</th></tr></thead>
                <tbody>
                  ${donors
                    .map(
                      (d) =>
                        `<tr>
                          <td>${d.donorName || "Anonymous"}</td>
                          <td>${d.totalDonated.toLocaleString()}</td>
                        </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
              `
              : `<div class="nodata">No donor data available</div>`
          }

          <h2>Campaign Performance</h2>
          ${
            campaigns.length
              ? `
              <table>
                <thead><tr><th>Campaign</th><th>Funds Raised (₹)</th></tr></thead>
                <tbody>
                  ${campaigns
                    .map(
                      (c) =>
                        `<tr>
                          <td>${c.campaignName}</td>
                          <td>${c.amount.toLocaleString()}</td>
                        </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
              `
              : `<div class="nodata">No campaign data available</div>`
          }

          <footer>
            Generated automatically by Sewa Setu • ${date.toLocaleString()}
          </footer>

          <script>
            const trend = ${JSON.stringify(donationTrend)};
            const handling = ${JSON.stringify(handlingData)};

            if (trend.length) {
              new Chart(document.getElementById("trendChart"), {
                type: "line",
                data: {
                  labels: trend.map(d => d.label),
                  datasets: [{
                    label: "Funds Received (₹)",
                    data: trend.map(d => d.value),
                    borderColor: "#2563EB",
                    backgroundColor: "rgba(37,99,235,0.2)",
                    fill: true,
                    tension: 0.3
                  }]
                }
              });
            }

            if (handling.length) {
              new Chart(document.getElementById("handlingChart"), {
                type: "pie",
                data: {
                  labels: handling.map(h => h.label),
                  datasets: [{
                    data: handling.map(h => h.value),
                    backgroundColor: [
                      "#16A34A",
                      "#3B82F6",
                      "#F59E0B",
                      "#DC2626",
                      "#7C3AED"
                    ]
                  }]
                }
              });
            }
          </script>
        </body>
      </html>
    `;

    /* ==============================
       Generate PDF
    ============================== */
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await delay(2000);

    await page.pdf({
      path: reportPath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    console.log("✅ NGO report generated:", reportPath);
    return reportPath;
  } catch (err) {
    console.error("❌ Failed to generate NGO report:", err);
    throw err;
  }
};
