import express from "express";
import {
  createOrder,
  verifyPayment,
  getFundsByCampaign,
  getFundsByUser,
  razorpayWebhook,
} from "../Controllers/fund.controller.js";
import { authMiddleware } from "../Middlewares/auth.middleware.js";

const fundRouter = express.Router();

fundRouter.post("/create-order", authMiddleware, createOrder);
fundRouter.post("/verify-payment", authMiddleware, verifyPayment);
fundRouter.get("/campaign/:campaignId", getFundsByCampaign);
fundRouter.get("/my-funds", authMiddleware, getFundsByUser);
// Webhook must be raw body
fundRouter.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

export default fundRouter;
