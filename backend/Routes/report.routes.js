import express from "express";
import fs from "fs";
import path from "path";
import { generateMonthlyReport } from "../Utils/generateMonthlyReport.js";
import { generateNgoReport } from "../Utils/generateNgoReport.js";
import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";

const reportRouter = express.Router();

/**
 * ==============================
 * ADMIN – PUBLIC IMPACT REPORT
 * ==============================
 */
reportRouter.get(
  "/generate",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      const { fromMonth, toMonth, city, ngoId } = req.query;

      const reportPath = await generateMonthlyReport(token, {
        fromMonth,
        toMonth,
        city,
        ngoId,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(reportPath)}"`
      );

      fs.createReadStream(reportPath).pipe(res);
    } catch (err) {
      console.error("❌ Admin report generation failed:", err);
      res.status(500).json({ error: "Failed to generate admin report" });
    }
  }
);

/**
 * ==============================
 * NGO – NGO-SPECIFIC REPORT
 * ==============================
 */
reportRouter.get(
  "/ngo",
  authMiddleware,
  roleMiddleware(["ngo"]),
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const ngoId = req.user?.ngo;

      if (!ngoId) {
        return res.status(400).json({ error: "NGO account not linked" });
      }

      const { fromMonth, toMonth, campaignId } = req.query;

      const reportPath = await generateNgoReport({
        ngoId,
        token,
        filters: { fromMonth, toMonth, campaignId },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(reportPath)}"`
      );

      fs.createReadStream(reportPath).pipe(res);
    } catch (err) {
      console.error("❌ NGO report generation failed:", err);
      res.status(500).json({ error: "Failed to generate NGO report" });
    }
  }
);

export default reportRouter;
