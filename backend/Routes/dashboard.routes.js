import express from "express";
import { getPublicDashboardStats } from "../Controllers/dashboard.controller.js";

const router = express.Router();

// Public dashboard, no auth needed
router.get("/public", getPublicDashboardStats);

export default router;
