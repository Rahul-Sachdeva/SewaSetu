import express from "express";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { createDonation, getUserDonations, getIncomingDonationsForNGO, updateDonationStatus } from "../Controllers/donation.controller.js";
import { confirmPickup, submitFeedback } from "../Controllers/user_donation_handling.controller.js";

// Assign selected NGOs to a request
const router = express.Router();

// Create new request
router.post("/", authMiddleware, createDonation);
// router.post("/assign-ngos", assignNGOsToRequest);

// Get all requests by logged-in user
router.get("/user", authMiddleware, getUserDonations);
router.get("/ngo", authMiddleware, (req, res, next) => {
  console.log("Route /api/donations/ngo reached");
  next();
}, getIncomingDonationsForNGO);
router.put("/update-status", authMiddleware, updateDonationStatus);
router.put("/confirm-pickup", authMiddleware, confirmPickup);
router.post("/feedback", authMiddleware, submitFeedback);


export default router;
