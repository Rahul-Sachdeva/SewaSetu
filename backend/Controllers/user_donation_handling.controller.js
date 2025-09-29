// controllers/user_donation_handling.controller.js
import { UserDonationHandling } from "../Models/user_donation_handling.model.js";
import { Donation } from "../Models/donation.model.js";

/**
 * Create a new donation handling record (when an NGO accepts a donation)
 */
export const createDonationHandling = async (req, res) => {
  try {
    const { donation_id, handledBy } = req.body;

    if (!donation_id || !handledBy) {
      return res.status(400).json({ message: "donation_id and handledBy are required" });
    }

    // Check if donation exists
    const donation = await Donation.findById(donation_id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Optional: avoid duplicate handling entries for same donation by same NGO
    const existing = await UserDonationHandling.findOne({ donation_id, handledBy });
    if (existing) {
      return res.status(409).json({ message: "Handling entry already exists for this NGO and donation" });
    }

    // Create handling entry
    const handling = await UserDonationHandling.create({
      donation_id,
      handledBy,
    });

    res.status(201).json({ message: "Donation handling created successfully", handling });
  } catch (error) {
    console.error("Error creating donation handling:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get all donation handling records for the authenticated donor
 */
export const getUserDonationHandlings = async (req, res) => {
  try {
    const donorId = req.user._id; // ensure auth middleware populates req.user
    const donations = await Donation.find({ donor: donorId }).select("_id");

    const donationIds = donations.map(d => d._id);
    const handlings = await UserDonationHandling.find({ donation_id: { $in: donationIds } })
      .populate("donation_id")
      .populate("handledBy", "name email phone");

    res.status(200).json(handlings);
  } catch (error) {
    console.error("Error fetching user donation handlings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update the status of a donation handling record
 */
export const updateDonationHandlingStatus = async (req, res) => {
  try {
    const { handlingId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "rejected", "scheduled", "picked", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const handling = await UserDonationHandling.findByIdAndUpdate(
      handlingId,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!handling) {
      return res.status(404).json({ message: "Donation handling not found" });
    }

    res.status(200).json({ message: "Status updated successfully", handling });
  } catch (error) {
    console.error("Error updating donation status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Confirm pickup by donor
 */
export const confirmDonationPickup = async (req, res) => {
  try {
    const { handlingId } = req.params;

    const handling = await UserDonationHandling.findByIdAndUpdate(
      handlingId,
      { donorConfirmed: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!handling) {
      return res.status(404).json({ message: "Donation handling not found" });
    }

    res.status(200).json({ message: "Pickup confirmed successfully", handling });
  } catch (error) {
    console.error("Error confirming pickup:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Submit feedback for a completed donation handling
 */
export const submitDonationFeedback = async (req, res) => {
  try {
    const { handlingId } = req.params;
    const { rating, comments } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const handling = await UserDonationHandling.findByIdAndUpdate(
      handlingId,
      {
        feedbackGiven: true,
        feedbackRating: rating,
        feedbackComments: comments || "",
        feedbackDate: Date.now(),
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!handling) {
      return res.status(404).json({ message: "Donation handling not found" });
    }

    res.status(200).json({ message: "Feedback submitted successfully", handling });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
