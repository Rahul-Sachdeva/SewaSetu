import express from "express";
import multer from "multer";
import {
  createDonation,
  getDonations,
  getDonationById,
  updateDonationStatus, 
} from "../Controllers/donation.controller.js";

import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";

const donationRouter = express.Router();

// Multer setup for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
donationRouter.post(
  "/",
  authMiddleware,
  roleMiddleware(["user"]), // only "user" can donate
  upload.array("images", 5),
  createDonation
);

donationRouter.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(["ngo", "admin"]), // only NGO/Admin can update
  updateDonationStatus
);

donationRouter.get("/", getDonations);
donationRouter.get("/:id", getDonationById);

export default donationRouter;
