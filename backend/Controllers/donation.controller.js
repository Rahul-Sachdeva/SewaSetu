import { Donation } from "../Models/donation.model.js";
import { DonationHandling } from "../Models/user_donation_handling.model.js";
import { NGO } from "../Models/ngo.model.js";
import { DonationNotification } from "../Models/don_notification.model.js";
import { sendDonationNotification } from "../Utils/don_notification.utils.js";
import { updateNGOPoints } from "./ngo.controller.js";
import uploadCloudinary from "../Utils/cloudinary.js";
import { updateUserPoints } from "../Controllers/user.controller.js"; // Add your badge, leaderboard logic hooks if they exist

// ------------------------
// Create new donation
// ------------------------
export const createDonation = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      address,
      location_coordinates,
      category,
      description,
      quantity,
      selectedNGOs
    } = req.body;

    // Validation
    if (!full_name || !address || !category || !description || !quantity || !selectedNGOs?.length) {
      return res.status(400).json({ message: "All required fields must be provided and at least one NGO selected" });
    }

    if (selectedNGOs.length > 3) {
      return res.status(400).json({ message: "You can select up to 3 NGOs only" });
    }

    // Support multiple image uploads (from your original logic)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadCloudinary(file.buffer);
        imageUrls.push(uploaded.secure_url);
      }
    }

    // Automatically assign donor from logged-in user
    const donorId = req.user?._id;
    if (!donorId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Create donation with images
    const donation = await Donation.create({
      full_name,
      phone,
      address,
      location_coordinates,
      category,
      description,
      quantity,
      images: imageUrls,
      donatedBy: donorId,
      selectedNGOs,
      status: "open"
    });

    console.log("Donation Created:", donation._id);

    // Assign donation to selected NGOs and notify
    const assignments = await Promise.all(
      selectedNGOs.map(async (ngoId) => {
        const handling = await DonationHandling.create({
          donar_id: donation._id,
          handledBy: ngoId,
          status: "pending",
          assignedAt: new Date()
        });

        await DonationNotification.create({
          user: ngoId,
          userModel: "NGO",
          type: "donation_received",
          title: "New Donation",
          message: `A new donation has been submitted by ${full_name}.`,
          reference: donation._id
        });

        await sendDonationNotification(ngoId, "NGO", {
          title: "New Donation",
          message: `A new donation has been submitted by ${full_name}.`,
          type: "donation_received",
          referenceId: donation._id,
          referenceModel: "Donation"
        });

        return handling;
      })
    );

    // Your user point update and badge check (preserve your extra features)
    await updateUserPoints(donorId, "donation_request", 50);

    return res.status(201).json({
      message: "Donation submitted successfully",
      donation,
      assignments
    });

  } catch (err) {
    console.error("Create Donation Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------
// Get all donations for logged-in user
// ------------------------
export const getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donatedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'selectedNGOs',
        select: 'name email'
      });

    const result = await Promise.all(donations.map(async (reqItem) => {
      const handling = await DonationHandling.find({ donar_id: reqItem._id })
        .populate('handledBy', 'name email');
      return {
        ...reqItem.toObject(),
        handling
      };
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("Get User Donations Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------
// NGO updates request status (accept/reject/schedule/completed)
// ------------------------
export const updateDonationStatus = async (req, res) => {
  try {
    const { donationHandlingId, status, scheduled_details } = req.body;

    if (!donationHandlingId || !status) {
      return res.status(400).json({ message: "DonationHandling ID and status are required" });
    }

    const handling = await DonationHandling.findByIdAndUpdate(
      donationHandlingId,
      { status, scheduled_details, updatedAt: new Date() },
      { new: true }
    ).populate('donar_id');

    if (!handling) return res.status(404).json({ message: "DonationHandling not found" });

    if (!handling.donar_id) {
      console.error("DonationHandling exists but donar_id is null");
      return res.status(500).json({ message: "Associated Donation not found" });
    }

    console.log("Updating notifications for user:", handling.donar_id.donatedBy);

    const userModel = req.user.role === "ngo" ? "NGO" : "User";

    await DonationNotification.create({
      user: handling.donar_id.donatedBy,
      userModel,
      type: "donation_status_update",
      title: `Donation ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your donation "${handling.donar_id.category}" has been ${status} by NGO.`,
      reference: handling._id
    });

    await sendDonationNotification(handling.donar_id.donatedBy, userModel, {
      title: `Donation ID ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your donation for "${handling.donar_id.category}" has been ${status} by NGO.`,
      type: "donation_status_update",
      referenceId: handling.donar_id._id,
    });

    if (status === "scheduled") {
      await DonationHandling.updateMany(
        {
          donar_id: handling.donar_id._id,
          _id: { $ne: handling._id },
          status: "pending"
        },
        { status: "cancelled" }
      );
    }

    if (status === "accepted") {
      await updateNGOPoints(handling.handledBy, "donation_accepted", 10);
    } else if (status === "completed") {
      await updateNGOPoints(handling.handledBy, "donation_completed", 20);
    }

    return res.status(200).json({ message: "Donation status updated successfully", handling });
  } catch (err) {
    console.error("Update Donation Status Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------
// Get all incoming requests for a particular NGO
// ------------------------
export const getIncomingDonationsForNGO = async (req, res) => {
  try {
    const ngoId = req.user.ngo;
    console.log("NGO ID:", ngoId);
    const incoming = await DonationHandling.find({ handledBy: ngoId })
      .sort({ assignedAt: -1 })
      .populate({
        path: 'donar_id',
        populate: { path: 'donatedBy', select: 'name email phone' }
      });
    console.log("Incoming donations count:", incoming.length);
    return res.status(200).json(incoming);

  } catch (err) {
    console.error("Get Incoming Donations Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
