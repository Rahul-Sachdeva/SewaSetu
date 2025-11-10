import express from "express";
import { getAnalytics, getNgoAnalytics } from "../Controllers/analytics.controller.js";
import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";

const analyticsRouter = express.Router();

analyticsRouter.get("/", authMiddleware, roleMiddleware(["admin"]), getAnalytics);
// NGO-specific (auth required)
analyticsRouter.get("/ngo", authMiddleware, roleMiddleware(["ngo", "admin"]), getNgoAnalytics);

export default analyticsRouter;
