import express from "express";
import multer from "multer";
import {
  createDonation,
  getDonations,
  getDonationById,
  updateDonationStatus,
  getMyDonations,
} from "../Controllers/donation.controller.js";

import {
  createDonationHandling,
  getUserDonationHandlings,
  updateDonationHandlingStatus,
  confirmDonationPickup,
  submitDonationFeedback,
} from "../Controllers/user_donation_handling.controller.js";

import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";

const donationRouter = express.Router();

// Multer setup for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Create a donation (user only)
donationRouter.post(
  "/",
  authMiddleware,
  roleMiddleware(["user"]),
  upload.array("images", 5),
  createDonation
);

// ✅ Update donation status (ngo/admin)
donationRouter.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(["ngo", "admin"]),
  updateDonationStatus
);

// ✅ Get ALL donations (public or admin)
donationRouter.get("/", getDonations);

// ✅ Get donations created by the logged-in user (IMPORTANT: must be above "/:id")
donationRouter.get(
  "/my",
  authMiddleware,
  roleMiddleware(["user"]),
  getMyDonations
);

// ✅ Get a single donation by ID (keep this at the bottom!)
donationRouter.get("/:id", getDonationById);

// ✅ Handling donation by NGO
donationRouter.post(
  "/handling",
  authMiddleware,
  roleMiddleware(["ngo"]),
  createDonationHandling
);

// ✅ Get all donation handlings for a user
donationRouter.get(
  "/handling/my",
  authMiddleware,
  roleMiddleware(["user"]),
  getUserDonationHandlings
);

// ✅ Update handling status (NGO/Admin)
donationRouter.patch(
  "/handling/:handlingId/status",
  authMiddleware,
  roleMiddleware(["ngo", "admin"]),
  updateDonationHandlingStatus
);

// ✅ Confirm pickup (User)
donationRouter.patch(
  "/handling/:handlingId/confirm",
  authMiddleware,
  roleMiddleware(["user"]),
  confirmDonationPickup
);

// ✅ Submit feedback (User)
donationRouter.post(
  "/handling/:handlingId/feedback",
  authMiddleware,
  roleMiddleware(["user"]),
  submitDonationFeedback
);

export default donationRouter;
