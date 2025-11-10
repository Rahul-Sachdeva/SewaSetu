// cron/monthlyReportJob.js
import cron from "node-cron";
import { generateMonthlyReport } from "../Utils/generateMonthlyReport.js";
import { sendEmailReport } from "../Utils/sendEmailReport.js";

// Run on 1st day of every month at 09:00 AM
cron.schedule("*/10 * * * *", async () => {
  console.log("🕘 Running Monthly Impact Report Job...");
  try {
    const pdfPath = await generateMonthlyReport();
    await sendEmailReport(pdfPath, [
    //   "gov-impact@ministry.gov.in",
    //   "analytics@ngo.gov.in",
      "rahulsachdeva112005@gmail.com",
    ]);
    console.log("✅ Monthly report process completed!");
  } catch (err) {
    console.error("❌ Monthly report job failed:", err);
  }
});
