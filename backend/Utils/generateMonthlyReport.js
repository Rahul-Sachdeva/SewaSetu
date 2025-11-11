import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import axios from "axios";
import { backendURL } from "../constant.js";

export const generateMonthlyReport = async () => {
  const date = new Date();
  const reportsDir = path.resolve("reports");
  const reportFileName = `SewaSetu_PublicImpact_${date.toISOString().slice(0, 10)}.pdf`;
  const reportPath = path.join(reportsDir, reportFileName);

  // Simple delay helper (works in all Node versions)
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  try {
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      console.log("📁 Created reports directory:", reportsDir);
    }

    // 1️⃣ Fetch analytics
    const token = process.env.ADMIN_TOKEN;
    const { data: analytics } = await axios.get(`${backendURL}/api/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2️⃣ Build HTML Template
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 20px 40px;
              color: #222;
              background: #fff;
            }
            h1, h2, h3 { color: #0B5394; }
            h1 { font-size: 28px; margin-bottom: 10px; }
            h2 { font-size: 20px; margin-top: 30px; border-bottom: 2px solid #0B5394; padding-bottom: 5px; }
            p, li { font-size: 14px; line-height: 1.5; }
            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-top: 20px;
            }
            .card {
              background: #f9fafb;
              border-radius: 8px;
              padding: 12px;
              border: 1px solid #ddd;
              text-align: center;
            }
            .card h3 {
              margin: 0;
              font-size: 16px;
              color: #444;
            }
            .card p {
              font-size: 18px;
              font-weight: bold;
              color: #111;
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
            th {
              background: #f1f5f9;
              font-weight: bold;
            }
            .charts {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 25px;
              margin-top: 25px;
            }
            .chart-container {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 10px;
            }
            footer {
              text-align: center;
              font-size: 12px;
              margin-top: 40px;
              color: #777;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <h1>Sewa Setu – Monthly Impact Report</h1>
          <p><strong>Date:</strong> ${date.toDateString()}</p>

          <h2>Summary Overview</h2>
          <div class="summary">
            <div class="card"><h3>Total Funds Raised</h3><p>₹${analytics.summary.totalFunds.toLocaleString()}</p></div>
            <div class="card"><h3>Total NGOs</h3><p>${analytics.summary.totalNGOs}</p></div>
            <div class="card"><h3>Active Campaigns</h3><p>${analytics.summary.activeCampaigns}</p></div>
            <div class="card"><h3>Total Donors</h3><p>${analytics.summary.totalDonors}</p></div>
            <div class="card"><h3>Avg Donation</h3><p>₹${analytics.summary.avgDonation}</p></div>
            <div class="card"><h3>Requests Completed</h3><p>${analytics.summary.completedRequests}</p></div>
          </div>

          <h2>Donation Trends & Distribution</h2>
          <div class="charts">
            <div class="chart-container">
              <h3>Monthly Donations Trend</h3>
              <canvas id="donationsTrend"></canvas>
            </div>
            <div class="chart-container">
              <h3>Donations by Type</h3>
              <canvas id="donationType"></canvas>
            </div>
          </div>

          <h2>Top Campaigns by Funds Raised</h2>
          <table>
            <thead><tr><th>Campaign</th><th>Funds Raised (₹)</th></tr></thead>
            <tbody>
              ${analytics.topCampaigns
                .map(
                  (c) =>
                    `<tr><td>${c.campaignName}</td><td>${c.amount.toLocaleString()}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>

          <h2>Top NGOs by Funds Raised</h2>
          <table>
            <thead><tr><th>NGO Name</th><th>Funds Raised (₹)</th></tr></thead>
            <tbody>
              ${analytics.ngoLeaderboard
                .map(
                  (n) =>
                    `<tr><td>${n.ngoName}</td><td>${n.totalFunds.toLocaleString()}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>

          <footer>
            <p>Generated automatically by Sewa Setu • ${date.toLocaleString()}</p>
          </footer>

          <script>
            const donationsOverTime = ${JSON.stringify(analytics.donationsOverTime)};
            const donationTypeBreakdown = ${JSON.stringify(analytics.donationTypeBreakdown)};

            // Line Chart
            const ctx1 = document.getElementById('donationsTrend').getContext('2d');
            new Chart(ctx1, {
              type: 'line',
              data: {
                labels: donationsOverTime.map(d => d.label),
                datasets: [{
                  label: 'Donations Over Time',
                  data: donationsOverTime.map(d => d.value),
                  borderColor: '#2563EB',
                  backgroundColor: 'rgba(37,99,235,0.2)',
                  fill: true,
                  tension: 0.3
                }]
              },
              options: { plugins: { legend: { display: false } } }
            });

            // Pie Chart
            const ctx2 = document.getElementById('donationType').getContext('2d');
            new Chart(ctx2, {
              type: 'pie',
              data: {
                labels: donationTypeBreakdown.map(d => d.label),
                datasets: [{
                  data: donationTypeBreakdown.map(d => d.value),
                  backgroundColor: ['#16A34A','#3B82F6','#F59E0B','#DC2626','#7C3AED'],
                }]
              },
              options: { plugins: { legend: { position: 'bottom' } } }
            });
          </script>
        </body>
      </html>
    `;

    // 3️⃣ Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // ✅ Wait for charts to render (2s delay)
    await delay(2000);

    await page.pdf({ path: reportPath, format: "A4", printBackground: true });
    await browser.close();

    console.log("✅ Detailed PDF report generated successfully:", reportPath);
    return reportPath;
  } catch (err) {
    console.error("❌ Failed to generate report:", err);
    throw err;
  }
};
