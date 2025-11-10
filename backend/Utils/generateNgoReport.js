// backend/Utils/generateNgoReport.js
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import axios from "axios";
import { backendURL } from "../constant.js";

export const generateNgoReport = async ({ ngoId, token }) => {
  const date = new Date();
  const reportsDir = path.resolve("reports");
  const reportFileName = `SewaSetu_NGO_Report_${date.toISOString().slice(0, 10)}.pdf`;
  const reportPath = path.join(reportsDir, reportFileName);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    // 1️⃣ Fetch NGO analytics
    const { data: analytics } = await axios.get(`${backendURL}/api/analytics/ngo`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { ngoId },
    });

    // 2️⃣ Build the HTML
    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px 40px; color: #222; }
            h1, h2, h3 { color: #0B5394; }
            h1 { font-size: 26px; margin-bottom: 10px; }
            h2 { font-size: 20px; margin-top: 25px; border-bottom: 2px solid #0B5394; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ccc; padding: 8px; font-size: 13px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 20px; }
            .card { background: #f9fafb; border-radius: 8px; padding: 10px; border: 1px solid #ddd; text-align: center; }
            .chart-container { margin-top: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
            footer { text-align: center; margin-top: 40px; color: #777; font-size: 12px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Sewa Setu – NGO Monthly Report</h1>
          <p><strong>Date:</strong> ${date.toDateString()}</p>

          <h2>Summary Overview</h2>
          <div class="summary">
            <div class="card"><h3>Total Funds</h3><p>₹${analytics.summary.totalFunds.toLocaleString()}</p></div>
            <div class="card"><h3>Avg Donation</h3><p>₹${analytics.summary.avgDonation}</p></div>
            <div class="card"><h3>Total Donors</h3><p>${analytics.summary.totalDonors}</p></div>
            <div class="card"><h3>Active Campaigns</h3><p>${analytics.summary.activeCampaigns}</p></div>
            <div class="card"><h3>Completed Requests</h3><p>${analytics.summary.completedRequests}</p></div>
            <div class="card"><h3>Total Campaigns</h3><p>${analytics.summary.totalCampaigns}</p></div>
          </div>

          <div class="chart-container">
            <h3>Donation Handling Distribution</h3>
            <canvas id="donationHandlingChart"></canvas>
          </div>

          <div class="chart-container">
            <h3>Monthly Donation Trend</h3>
            <canvas id="donationTrendChart"></canvas>
          </div>

          <h2>Top Donors</h2>
          <table>
            <thead><tr><th>Donor</th><th>Total Donated (₹)</th></tr></thead>
            <tbody>
              ${analytics.topDonors
                .map(
                  (d) =>
                    `<tr><td>${d.donorName || "Anonymous"}</td><td>${d.totalDonated.toLocaleString()}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>

          <h2>Campaign Performance</h2>
          <table>
            <thead><tr><th>Campaign</th><th>Funds Raised (₹)</th></tr></thead>
            <tbody>
              ${analytics.donationsByCampaign
                .map(
                  (c) =>
                    `<tr><td>${c.campaignName}</td><td>${c.amount.toLocaleString()}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>

          <footer>Generated automatically by Sewa Setu • ${date.toLocaleString()}</footer>

          <script>
            const handled = ${JSON.stringify(analytics.handledDonations)};
            const donationsOverTime = ${JSON.stringify(analytics.donationsOverTime)};

            const ctx1 = document.getElementById('donationHandlingChart').getContext('2d');
            new Chart(ctx1, {
              type: 'pie',
              data: {
                labels: handled.map(d => d._id),
                datasets: [{ data: handled.map(d => d.count), backgroundColor: ['#16A34A','#3B82F6','#F59E0B','#DC2626','#7C3AED'] }]
              }
            });

            const ctx2 = document.getElementById('donationTrendChart').getContext('2d');
            new Chart(ctx2, {
              type: 'line',
              data: {
                labels: donationsOverTime.map(d => d.label),
                datasets: [{
                  label: 'Monthly Donations',
                  data: donationsOverTime.map(d => d.value),
                  borderColor: '#2563EB',
                  backgroundColor: 'rgba(37,99,235,0.2)',
                  fill: true
                }]
              }
            });
          </script>
        </body>
      </html>
    `;

    // 3️⃣ Generate PDF
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await delay(2000); // Wait for charts
    await page.pdf({ path: reportPath, format: "A4", printBackground: true });
    await browser.close();

    console.log("✅ NGO PDF generated:", reportPath);
    return reportPath;
  } catch (err) {
    console.error("❌ Failed to generate NGO report:", err);
    throw err;
  }
};
