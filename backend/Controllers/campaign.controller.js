import { Campaign } from "../Models/campaign.model.js";
import uploadCloudinary from "../Utils/cloudinary.js";
import { Conversation } from "../Models/conversation.model.js";
import { Fund } from "../Models/fund.model.js";
import { updateUserPoints } from "../Controllers/user.controller.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// Create a campaign
export const createCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      location_coordinates,
      address,
      targetFunds,
      targetVolunteers,
      razorpayQR, // new field
    } = req.body;

    if (!title || !category || !startDate || !endDate || !location_coordinates) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Ensure location_coordinates is an array of numbers
    let coordinates = location_coordinates;
    if (typeof location_coordinates === "string") {
      try {
        coordinates = location_coordinates.split(",").map(Number);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid location_coordinates format" });
      }
    }

    // Handle banner upload
    let bannerImageUrl = "";
    if (req.file && req.file.buffer) {
      const uploadResult = await uploadCloudinary(req.file.buffer);
      bannerImageUrl = uploadResult.secure_url;
    }

    // Create campaign
    const campaign = await Campaign.create({
      ngo: req.user.ngo || req.user._id,
      title,
      description,
      category,
      startDate,
      endDate,
      location_coordinates: coordinates,
      address,
      bannerImage: bannerImageUrl,
      targetFunds: targetFunds || 0,
      targetVolunteers: targetVolunteers || 0,
      razorpayQR: razorpayQR || "", // save QR if provided
    });

    // 🔹 Create corresponding conversation
    await Conversation.create({
      type: "campaign",
      campaign: campaign._id,
      participants: [
        {
          participantType: "NGO",
          participant: req.user._id,
        },
      ],
    });

    return res
      .status(201)
      .json({ message: "Campaign created successfully", campaign });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error creating campaign", error: err.message });
  }
};

// List campaigns with optional filters
export const listCampaigns = async (req, res) => {
  try {
    const { category, status, ngoId } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (ngoId) filter.ngo = ngoId;

    const campaigns = await Campaign.find(filter)
      .populate("ngo", "name")
      .populate("participants.user", "name email")
      .populate("donations", "donor amount status createdAt")
      .exec();

    return res.status(200).json(campaigns);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching campaigns", error: err.message });
  }
};

// Get a single campaign by ID
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("ngo", "name")
      .populate("participants.user", "name email")
      .populate("donations", "donor amount status createdAt")
      .exec();

    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    return res.status(200).json(campaign);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching campaign", error: err.message });
  }
};

// Register a user for a campaign
export const registerForCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    const { role } = req.body;

    // Check if already registered
    if (
      campaign.participants.some(
        (p) => p.user.toString() === req.user._id.toString()
      )
    ) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Add participant to campaign doc
    campaign.participants.push({
      user: req.user._id,
      role: role || "attendee",
      registeredAt: new Date(),
      status: "pending",
    });
    await campaign.save();
    
    // Award 10 points for registering for campaign
    await updateUserPoints(req.user._id, "campaign_registration", 10);

    // Add user to campaign conversation
    let conversation = await Conversation.findOne({
      type: "campaign",
      campaign: campaign._id,
    });

    if (!conversation) {
      // If conversation somehow missing, create it
      conversation = await Conversation.create({
        type: "campaign",
        campaign: campaign._id,
        participants: [],
      });
    }

    // Only add if not already participant
    if (
      !conversation.participants.some(
        (p) => p.participant.toString() === req.user._id.toString()
      )
    ) {
      conversation.participants.push({
        participantType: "User",
        participant: req.user._id,
      });
      await conversation.save();
    }

    return res.status(200).json({
      message: "User registered successfully & added to campaign chat",
      campaign,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error registering for campaign",
      error: err.message,
    });
  }
};

// Unregister a user from a campaign
export const unregisterFromCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    // Check if user is registered
    const isRegistered = campaign.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (!isRegistered) {
      return res.status(400).json({ message: "User is not registered" });
    }

    // Remove from participants
    campaign.participants = campaign.participants.filter(
      (p) => p.user.toString() !== req.user._id.toString()
    );
    await campaign.save();

    // Deduct 10 points for unregistering from campaign
    await updateUserPoints(req.user._id, "campaign_unregistration", -10);

    // 🔹 Remove user from campaign conversation
    const conversation = await Conversation.findOne({
      type: "campaign",
      campaign: campaign._id,
    });

    if (conversation) {
      conversation.participants = conversation.participants.filter(
        (p) => p.participant.toString() !== req.user._id.toString()
      );
      await conversation.save();
    }

    return res.status(200).json({
      message: "User unregistered & removed from campaign chat",
      campaign,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error unregistering from campaign",
      error: err.message,
    });
  }
};

// Optional: Approve or reject a participant (NGO only)
export const updateParticipantStatus = async (req, res) => {
  try {
    const { campaignId, participantId, status } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const participant = campaign.participants.id(participantId);
    if (!participant) return res.status(404).json({ message: "Participant not found" });

    participant.status = status; // approved / rejected
    await campaign.save();

    return res.status(200).json({ message: "Participant status updated", participant });
  } catch (err) {
    return res.status(500).json({ message: "Error updating participant status", error: err.message });
  }
};

// Get participants of a campaign (NGO/Admin only)

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      category,
      startDate,
      endDate,
      location_coordinates,
      address,
      targetFunds,
      targetVolunteers,
      razorpayQR, // new field
    } = req.body;

    // 🔹 Find campaign
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // 🔹 Authorization check (only the NGO that owns it can update)
    if (String(campaign.ngo) !== String(req.user.ngo || req.user._id)) {
      return res.status(403).json({ message: "Unauthorized to update this campaign" });
    }

    // 🔹 Handle location_coordinates
    let coordinates = campaign.location_coordinates; // keep old if not provided
    if (location_coordinates) {
      if (typeof location_coordinates === "string") {
        try {
          coordinates = location_coordinates.split(",").map(Number);
        } catch (err) {
          return res.status(400).json({ message: "Invalid location_coordinates format" });
        }
      } else if (Array.isArray(location_coordinates)) {
        coordinates = location_coordinates.map(Number);
      }
    }

    // 🔹 Handle banner upload
    let bannerImageUrl = campaign.bannerImage; // keep old if not updated
    if (req.file && req.file.buffer) {
      const uploadResult = await uploadCloudinary(req.file.buffer);
      bannerImageUrl = uploadResult.secure_url;
    }

    // 🔹 Update campaign fields
    campaign.title = title || campaign.title;
    campaign.description = description || campaign.description;
    campaign.category = category || campaign.category;
    campaign.startDate = startDate || campaign.startDate;
    campaign.endDate = endDate || campaign.endDate;
    campaign.location_coordinates = coordinates;
    campaign.address = address || campaign.address;
    campaign.bannerImage = bannerImageUrl;
    campaign.targetFunds = targetFunds !== undefined ? targetFunds : campaign.targetFunds;
    campaign.targetVolunteers =
      targetVolunteers !== undefined ? targetVolunteers : campaign.targetVolunteers;
    campaign.razorpayQR = razorpayQR !== undefined ? razorpayQR : campaign.razorpayQR;

    await campaign.save();

    return res
      .status(200)
      .json({ message: "Campaign updated successfully", campaign });
  } catch (err) {
    console.error("Update Campaign Error:", err);
    return res
      .status(500)
      .json({ message: "Error updating campaign", error: err.message });
  }
};

// Delete campaign
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    // Only NGO who created it or admin
    if (
      req.user.user_type !== "admin" &&
      campaign.ngo.toString() !== req.user.ngo?.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to delete this campaign" });
    }

    await campaign.deleteOne();
    return res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting campaign", error: err.message });
  }
};

export const getCampaignParticipants = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate(
      "participants.user",
      "name email phone"
    );
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    // Only allow NGO owner or admin
    if (
      req.user.user_type !== "admin" &&
      campaign.ngo.toString() !== req.user.ngo?.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to view participants" });
    }

    return res.status(200).json(campaign.participants);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching participants", error: err.message });
  }
};

// Get all campaigns for a specific NGO
export const getCampaignsByNGO = async (req, res) => {
  try {
    const { ngoId } = req.params;

    if (!ngoId) {
      return res.status(400).json({ message: "NGO ID is required" });
    }

    const campaigns = await Campaign.find({ ngo: ngoId })
      .populate("ngo", "name email") // add more fields if needed
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json(campaigns);
  } catch (err) {
    console.error("Error fetching NGO campaigns:", err);
    res.status(500).json({
      message: "Error fetching NGO campaigns",
      error: err.message,
    });
  }
};

export const getTopDonors = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const funds = await Fund.find({ campaign: campaignId, status: "paid" })
      .populate("donor", "name email")
      .sort({ amount: -1 })
      .limit(10);
    res.json(funds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCampaignDonations = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id).populate("donations").exec();

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.json({
      campaignId: campaign._id,
      title: campaign.title,
      targetFunds: campaign.targetFunds,
      collectedFunds: campaign.collectedFunds,
      donations: campaign.donations
    });
  } catch (err) {
    console.error("Get campaign donations error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const initiateCampaignDonation = async (req, res) => {
  try {
    const { id: campaignId } = req.params; // campaign ID
    const { amount } = req.body;           // donation amount
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid donation amount" });
    }

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `fund_${campaignId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Create Fund entry in DB
    const fund = await Fund.create({
      campaign: campaignId,
      donor: userId,
      amount,
      orderId: order.id,
      status: "created"
    });

    // Respond with order info for frontend Razorpay checkout
    res.json({
      orderId: order.id,
      amount,
      currency: "INR",
      fundId: fund._id
    });

  } catch (err) {
    console.error("Initiate donation error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
