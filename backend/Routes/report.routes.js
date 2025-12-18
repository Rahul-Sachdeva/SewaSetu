// backend/routes/reportRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import { generateMonthlyReport } from "../Utils/generateMonthlyReport.js";
import { generateNgoReport } from "../Utils/generateNgoReport.js";

const reportRouter = express.Router();

// ✅ Generate & return the latest detailed PDF report
reportRouter.get("/generate", async (req, res) => {
try {
console.log("📄 Request received: Generating admin PDF report...");
const reportPath = await generateMonthlyReport();

const fileName = path.basename(reportPath);
res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

const fileStream = fs.createReadStream(reportPath);
fileStream.pipe(res);

fileStream.on("end", () => {
console.log("✅ PDF report sent successfully:", fileName);
});
} catch (err) {
console.error("❌ Failed to generate or send report:", err);
res.status(500).json({ error: "Failed to generate report" });
}
});

reportRouter.get("/ngo", async (req, res) => {
try {
const token = req.headers.authorization?.split(" ")[1];
const ngoId = req.query.ngoId || req.user?.ngoId;

const reportPath = await generateNgoReport({ ngoId, token });
const fileName = path.basename(reportPath);

res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
fs.createReadStream(reportPath).pipe(res);
} catch (err) {
console.error("❌ NGO report generation failed:", err);
res.status(500).json({ error: "Failed to generate NGO report" });
}
});

export default reportRouter;
