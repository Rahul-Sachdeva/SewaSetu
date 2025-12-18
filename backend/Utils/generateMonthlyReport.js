import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import axios from "axios";
import { backendURL } from "../constant.js";

export const generateMonthlyReport = async (admin_token, filters = {}) => {
  const date = new Date();
  const reportsDir = path.resolve("reports");

  const reportFileName = `SewaSetu_PublicImpact_${date
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
       Fetch Admin Analytics (FILTERED)
    ============================== */
    const { data: analytics } = await axios.get(
      `${backendURL}/api/analytics`,
      {
        headers: { Authorization: `Bearer ${admin_token}` },
        params: {
          fromMonth: filters.fromMonth,
          toMonth: filters.toMonth,
          city: filters.city,
          ngoId: filters.ngoId,
        },
      }
    );

    /* ==============================
       Build HTML
    ============================== */
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px 40px;
              color: #222;
              background: #fff;
            }

            h1, h2, h3 { color: #0B5394; }
            h1 { font-size: 30px; margin-bottom: 5px; }
            h2 {
              font-size: 20px;
              margin-top: 35px;
              border-bottom: 2px solid #0B5394;
              padding-bottom: 6px;
            }

            p { font-size: 14px; }

            .filters {
              margin-top: 12px;
              background: #f8fafc;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 10px 14px;
              font-size: 13px;
            }

            .filters ul {
              margin: 6px 0 0;
              padding-left: 18px;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 14px;
              margin-top: 20px;
            }

            .card {
              background: #f9fafb;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 14px;
              text-align: center;
            }

            .card h3 {
              font-size: 14px;
              margin-bottom: 6px;
              color: #444;
            }

            .card p {
              font-size: 18px;
              font-weight: bold;
              margin: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              font-size: 13px;
              text-align: left;
            }

            th {
              background: #f1f5f9;
              font-weight: bold;
            }

            .charts {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 26px;
              margin-top: 25px;
            }

            .chart-container {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 12px;
            }

            footer {
              margin-top: 45px;
              font-size: 12px;
              text-align: center;
              color: #777;
              border-top: 1px solid #ddd;
              padding-top: 12px;
            }
          </style>
        </head>

        <body>
          <h1>Sewa Setu – Public Impact Report</h1>
          <p><strong>Generated on:</strong> ${date.toDateString()}</p>

          <div class="filters">
            <strong>Applied Filters:</strong>
            <ul>
              <li>Date Range: ${filters.fromMonth || "All"} → ${filters.toMonth || "All"}</li>
              <li>City: ${filters.city || "All"}</li>
              <li>NGO: ${filters.ngoId || "All"}</li>
            </ul>
          </div>

          <h2>Summary Overview</h2>
          <div class="summary">
            <div class="card"><h3>Total Funds Raised</h3><p>₹${analytics.summary.totalFunds.toLocaleString()}</p></div>
            <div class="card"><h3>Total NGOs</h3><p>${analytics.summary.totalNGOs}</p></div>
            <div class="card"><h3>Active Campaigns</h3><p>${analytics.summary.activeCampaigns}</p></div>
            <div class="card"><h3>Total Donors</h3><p>${analytics.summary.totalDonors}</p></div>
            <div class="card"><h3>Avg Donation</h3><p>₹${analytics.summary.avgDonation}</p></div>
            <div class="card"><h3>Requests Completed</h3><p>${analytics.summary.completedRequests}</p></div>
          </div>

          <h2>Donation & Request Analytics</h2>
          <div class="charts">
            <div class="chart-container">
              <h3>Monthly Donations Trend</h3>
              <canvas id="donationsTrend"></canvas>
            </div>

            <div class="chart-container">
              <h3>Donations by Type</h3>
              <canvas id="donationType"></canvas>
            </div>

            <div class="chart-container">
              <h3>Requests by Status</h3>
              <canvas id="requestStatus"></canvas>
            </div>

            <div class="chart-container">
              <h3>Top NGO Fund Contribution</h3>
              <canvas id="ngoFunds"></canvas>
            </div>
          </div>

          <h2>Top Campaigns</h2>
          <table>
            <thead>
              <tr><th>Campaign</th><th>Funds Raised (₹)</th></tr>
            </thead>
            <tbody>
              ${analytics.topCampaigns.map(
                (c) =>
                  `<tr>
                    <td>${c.campaignName}</td>
                    <td>${c.amount.toLocaleString()}</td>
                  </tr>`
              ).join("")}
            </tbody>
          </table>

          <footer>
            Generated automatically by Sewa Setu • ${date.toLocaleString()}
          </footer>

          <script>
            const donationsOverTime = ${JSON.stringify(analytics.donationsOverTime || [])};
            const donationType = ${JSON.stringify(analytics.donationTypeBreakdown || [])};
            const requestStatus = ${JSON.stringify(analytics.requestStatusDist || [])};
            const ngoLeaderboard = ${JSON.stringify(analytics.ngoLeaderboard || [])};

            new Chart(donationsTrend, {
              type: "line",
              data: {
                labels: donationsOverTime.map(d => d.label),
                datasets: [{
                  data: donationsOverTime.map(d => d.value),
                  borderColor: "#2563EB",
                  backgroundColor: "rgba(37,99,235,0.2)",
                  fill: true,
                  tension: 0.3
                }]
              },
              options: { plugins: { legend: { display: false } } }
            });

            new Chart(donationType, {
              type: "pie",
              data: {
                labels: donationType.map(d => d.label),
                datasets: [{
                  data: donationType.map(d => d.value),
                  backgroundColor: ["#16A34A","#3B82F6","#F59E0B","#DC2626","#7C3AED"]
                }]
              }
            });

            new Chart(requestStatus, {
              type: "pie",
              data: {
                labels: requestStatus.map(r => r.label),
                datasets: [{
                  data: requestStatus.map(r => r.value),
                  backgroundColor: ["#16A34A","#3B82F6","#F59E0B","#DC2626"]
                }]
              }
            });

            new Chart(ngoFunds, {
              type: "bar",
              data: {
                labels: ngoLeaderboard.map(n => n.ngoName),
                datasets: [{
                  data: ngoLeaderboard.map(n => n.totalFunds),
                  backgroundColor: "#0B5394"
                }]
              },
              options: { plugins: { legend: { display: false } } }
            });
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
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await delay(2000);

    await page.pdf({
      path: reportPath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    console.log("✅ Admin public impact PDF generated:", reportPath);
    return reportPath;
  } catch (err) {
    console.error("❌ Failed to generate admin report:", err);
    throw err;
  }
};
