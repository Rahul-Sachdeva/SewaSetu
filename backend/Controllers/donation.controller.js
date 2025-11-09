import { Donation } from "../Models/donation.model.js";
import uploadCloudinary from "../Utils/cloudinary.js";
import { updateUserPoints } from "../Controllers/user.controller.js";

// Create Donation

export const createDonation = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      location,
      type,
      title,
      description,
      quantity,
      pickupDate,
      pickupTime,
    } = req.body;

    // Basic validation
    if (!name || !phone || !location || !type || !title || !description || !quantity) {
      return res.status(400).json({ message: "Missing required donation fields" });
    }

    // Ensure donor is attached from auth middleware
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // Upload images if provided
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadCloudinary(file.buffer);
        imageUrls.push(uploaded.secure_url);
      }
    }

    // Save to DB with logged-in user as donor
    const donation = await Donation.create({
      donor: req.user._id,  // <--- main part of step 2
      name,
      phone,
      email,
      location,
      type,
      title,
      description,
      quantity,
      images: imageUrls,
      pickupDate,
      pickupTime,
      status: "pending",
    });

    // Award 50 points for donation request
    await updateUserPoints(req.user._id, "donation_request", 50);
    
    return res.status(201).json({
      message: "Donation created successfully",
      donation,
    });
  } catch (err) {
    console.error("Create Donation Error:", err);
    return res.status(500).json({
      message: "Error creating donation",
      error: err.message,
    });
  }
};


// Get all donations
export const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    return res.status(200).json(donations);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching donations",
      error: err.message,
    });
  }
};

// Get single donation
export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    return res.status(200).json(donation);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching donation",
      error: err.message,
    });
  }
};

// Update donation status
export const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // allowed statuses
    const validStatuses = ["pending", "accepted", "rejected", "picked"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: status.toLowerCase() },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    return res.status(200).json({
      message: "Donation status updated successfully",
      donation,
    });
  } catch (err) {
    console.error("Update Donation Status Error:", err);
    return res.status(500).json({
      message: "Error updating donation status",
      error: err.message,
    });
  }
};


// Get donations made by the currently logged-in user
export const getMyDonations = async (req, res) => {
  try {
    // Make sure user is authenticated
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // Find all donations created by this user
    const myDonations = await Donation.find({ donor: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json(myDonations);
  } catch (err) {
    console.error("Error fetching user donations:", err);
    return res.status(500).json({
      message: "Error fetching user donations",
      error: err.message,
    });
  }
};

