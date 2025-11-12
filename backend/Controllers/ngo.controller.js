import { NGO } from "../Models/ngo.model.js";
import mongoose from "mongoose";
import uploadCloudinary from "../Utils/cloudinary.js";
import { User } from "../Models/user.model.js";
import { Conversation } from "../Models/conversation.model.js";
import { sendEmail } from "../Utils/sendEmail.js";
import { Notification } from "../Models/notification.model.js";
import { sendNotification } from "../Utils/notification.utils.js";
import { DonationNotification } from "../Models/don_notification.model.js";
import { sendDonationNotification } from "../Utils/don_notification.utils.js";

export const registerNGO = async (req, res) => {
  try {
    const {
      name,
      registration_number,
      email,
      phone,
      address,
      city,
      state,
      location_coordinates,
      category,
      description,
      userId,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !registration_number ||
      !city ||
      !state ||
      !address ||
      !category ||
      !location_coordinates
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User Id must be provided" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User Id" });
    }

    if (!req.files?.documents || req.files.documents.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one document must be uploaded" });
    }

    // Check if NGO already exists by registration number or email
    const existing = await NGO.findOne({
      $or: [{ registration_number }, { email }],
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "NGO with same email or registration Id already registered" });
    }

    // Ensure location coordinates is array of [long, lat]
    let coords = location_coordinates;
    if (typeof coords === "string") {
      coords = coords.split(",").map(Number);
    }
    if (!Array.isArray(coords) || coords.length !== 2) {
      return res
        .status(400)
        .json({ message: "location_coordinates must be [longitude, latitude]" });
    }

    // --- Handle file uploads ---
    let logoUrl = "";
    let documentUrls = [];
    let galleryUrls = [];

    if (req.files?.profile_image?.[0]) {
      const logoRes = await uploadCloudinary(
        req.files.profile_image[0].buffer,
        "sewasetu/ngos/logo"
      );
      logoUrl = logoRes.secure_url;
    }
    if (req.files?.documents?.length) {
      const docsRes = await Promise.all(
        req.files.documents.map((file) =>
          uploadCloudinary(file.buffer, "sewasetu/ngos/documents")
        )
      );
      documentUrls = docsRes.map((doc) => doc.secure_url);
    }
    if (req.files?.gallery?.length) {
      const galleryRes = await Promise.all(
        req.files.gallery.map((file) =>
          uploadCloudinary(file.buffer, "sewasetu/ngos/gallery")
        )
      );
      galleryUrls = galleryRes.map((img) => img.secure_url);
    }

    let categories = category;
    if (typeof categories === "string") {
      categories = categories.split(",").map(c => c.trim());
    }

    // Create NGO
    const ngo = await NGO.create({
      name,
      registration_number,
      email,
      phone,
      address,
      city,
      state,
      location_coordinates: coords,
      documents: documentUrls,
      logo: logoUrl,
      category: categories,
      description,
      gallery: galleryUrls,
      account: userId,
      members: [userId],
    });

    // Update user to link with NGO
    await User.findByIdAndUpdate(userId, { ngo: ngo._id });

    // 🔹 Create corresponding NGO conversation
    await Conversation.create({
      type: "ngo_followers",
      ngo: ngo._id,
      participants: [
        {
          participantType: "NGO",
          participant: userId,
        },
      ],
    });

    await updateNGOPoints(ngo._id, "registration", 10);

    return res.status(201).json({
      message: "NGO registered successfully, pending admin verification",
      ngo,
    });
  } catch (err) {
    console.error("NGO registration error:", err);
    return res.status(500).json({
      message: "Error registering NGO",
      error: err.message,
    });
  }
};

export const getNGOPoints = async (req, res) => {
  try {
    const ngoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ message: "Invalid NGO ID" });
    }

    const ngo = await NGO.findById(ngoId).select("points badges activityHistory");

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    return res.status(200).json({
      points: ngo.points,
      badges: ngo.badges || [],
      activityHistory: ngo.activityHistory || [],
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching NGO points", error: error.message });
  }
};

export const updateNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    // Authorization check (only NGO account user or admin can update)
    if (ngo._id.toString() !== req.user.ngo.toString() && req.user.user_type !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updates = req.body;

    // --- Handle location coordinates ---
    if (updates.location_coordinates) {
      let coords = updates.location_coordinates;
      if (typeof coords === "string") {
        coords = coords.split(",").map(Number);
      }
      if (!Array.isArray(coords) || coords.length !== 2) {
        return res.status(400).json({ message: "location_coordinates must be [longitude, latitude]" });
      }
      updates.location_coordinates = coords;
    }

    // --- Handle file uploads ---
    if (req.files?.profile_image?.[0]) {
      const logoRes = await uploadCloudinary(req.files.profile_image[0].buffer, "sewasetu/ngos/logo");
      updates.logo = logoRes.secure_url;
    }

    if (req.files?.documents?.length) {
      const docsRes = await Promise.all(
        req.files.documents.map(file => uploadCloudinary(file.buffer, "sewasetu/ngos/documents"))
      );
      updates.documents = docsRes.map(doc => doc.secure_url);
    }

    if (req.files?.gallery?.length) {
      const galleryRes = await Promise.all(
        req.files.gallery.map(file => uploadCloudinary(file.buffer, "sewasetu/ngos/gallery"))
      );
      updates.gallery = galleryRes.map(img => img.secure_url);
    }

    if (updates.category) {
      if (typeof updates.category === "string") {
        updates.category = updates.category.split(",").map(c => c.trim());
      }
    }


    // --- Update NGO ---
    const updatedNGO = await NGO.findByIdAndUpdate(req.params.id, updates, { new: true });

    // --- Update linked User (req.user._id) ---
    const userUpdates = {};
    if (updates.name) userUpdates.name = updates.name;
    if (updates.city) userUpdates.city = updates.city;
    if (updates.state) userUpdates.state = updates.state;
    if (updates.address) userUpdates.address = updates.address;
    if (updates.logo) userUpdates.profile_image = updates.logo; // sync NGO logo to user profile
    if (updates.location_coordinates) userUpdates.location_coordinates = updates.location_coordinates;

    let updatedUser = null;
    if (Object.keys(userUpdates).length > 0) {
      updatedUser = await User.findByIdAndUpdate(req.user._id, userUpdates, { new: true }).select("-password");
    }

    return res.status(200).json({
      message: "NGO and linked User updated successfully",
      ngo: updatedNGO,
      user: updatedUser
    });

  } catch (err) {
    console.error("NGO update error:", err);
    return res.status(500).json({ message: "Error updating NGO", error: err.message });
  }
};


export const listNGOs = async (req, res) => {
  try {
    const { city, status } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (status) filter.status = status;

    const ngos = await NGO.find(filter);
    return res.status(200).json(ngos);
  } catch (err) {
    return res.status(500).json({ message: "Error listing NGOs", error: err.message });
  }
};

export const listFilteredNGOs = async (req, res) => {
  try {
    const { city, category, verification_status } = req.query;

    const filter = {
      verification_status: verification_status,
    };

    if (city) {
      filter.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    const ngos = await NGO.find(filter);

    return res.status(200).json(ngos);
  } catch (err) {
    return res.status(500).json({ message: "Error listing NGOs", error: err.message });
  }
};



export const updateNGOStatus = async (req, res) => {
  try {
    if (req.user.user_type !== "admin") {
      return res.status(403).json({ message: "Only admin can approve NGOs" });
    }

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ngo = await NGO.findByIdAndUpdate(req.params.id, { verification_status: status }, { new: true });
    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    // Send email notification
    let subject, body;
    if (status === "approved") {
      subject = "Sewa Setu NGO Application Approved";
      body = `Dear ${ngo.name}, your NGO application has been approved. You can now login and manage your profile.`;
    } else {
      subject = "NGO Application Rejected";
      body = `Dear ${ngo.name}, we regret to inform you that your NGO application has been rejected.`;
    }

    await sendEmail(ngo.email, subject, body);

    // await Notification.create({
    //   user: ngo._id,
    //   userModel: "admin",
    //   type: "general",
    //   title: `Your NGO profile was ${status}`,
    //   message: status === "approved" ? "Your NGO has been approved." : "Your NGO has been rejected.",
    // });

    // // Push notification (optional)
    // await sendNotification(ngo._id, "NGO", {
    //   title: `NGO profile ${status}`,
    //   message: status === "approved" ? "Your NGO has been approved." : "Your NGO has been rejected.",
    //   type: "general",
    // });

    return res.status(200).json({ message: `NGO updated to status: ${status}`, ngo });
  } catch (err) {
    return res.status(500).json({ message: "Error updating status", error: err.message });
  }
};

export const getNGOById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid NGO ID" });
  }

  try {
    const ngo = await NGO.findById(id);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }
    return res.status(200).json(ngo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching NGO", error: err.message });
  }
};

export const getPendingNGOs = async (req, res) => {
  try {
    const pendingNGOs = await NGO.find({ verification_status: "pending" });
    res.status(200).json(pendingNGOs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending NGOs", error: err.message });
  }
};

// Update NGO points based on activity and assign badges
export const updateNGOPoints = async (ngoId, activity, points) => {
  const ngo = await NGO.findById(ngoId);
  if (!ngo) throw new Error("NGO not found");

  if (!ngo.points) ngo.points = 0;
  if (!ngo.badges) ngo.badges = [];
  if (!ngo.activityHistory) ngo.activityHistory = [];

  ngo.points += points;
  ngo.activityHistory.push({ activity, points, date: new Date() });

  // Badge thresholds example
  const badgeThresholds = [
    { name: "Bronze", points: 100 },
    { name: "Silver", points: 300 },
    { name: "Gold", points: 600 },
    { name: "Platinum", points: 1000 }
  ];

  // Assign badges
  for (const badge of badgeThresholds) {
    if (ngo.points >= badge.points && !ngo.badges.includes(badge.name)) {
      ngo.badges.push(badge.name);

      // In-app notification
      await Notification.create({
        user: ngo._id,
        userModel: "NGO",
        type: "badge_unlocked",
        title: `Badge Unlocked: ${badge.name}`,
        message: `Congratulations! You have successfully earned the prestigious ${badge.name} badge on SewaSetu. This milestone is a testament to your dedication and positive impact within our community. Keep up the fantastic work and continue making a difference – more achievements and rewards await you!`,
        referenceId: null,
        referenceModel: null,
      });
      
      // Send Email
      const emailHTML = `
    <h2>SewaSetu - Your Bridge To Serve</h2>
    <h3>Congratulations!</h3>
    <p>You have successfully earned the prestigious <strong>${badge.name}</strong> badge on SewaSetu. This milestone ...</p>
`;

      await sendEmail(ngo.email, `Badge Unlocked: ${badge.name}`, emailHTML);
    }
  }


  await ngo.save();
  return ngo;
};


// Get NGO leaderboard with period filter and totalPoints aggregation
export const getNGOLeaderboard = async (req, res) => {
  try {
    const period = req.query.period || "allTime"; // Accept "thisMonth" or default "allTime"
    let matchStage = {};
    const startOfMonth = new Date();
    if (period === "thisMonth") {
      startOfMonth.setHours(0, 0, 0, 0);

      matchStage = {
        "activityHistory.date": { $gte: startOfMonth }
      };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $addFields: {
          totalPoints: period === "thisMonth"
            ? {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$activityHistory",
                      as: "activity",
                      cond: { $gte: ["$$activity.date", startOfMonth] }
                    }
                  },
                  as: "activity",
                  in: "$$activity.points"
                }
              }
            }
            : "$points"
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 20 },
      {
        $project: {
          name: 1,
          city: 1,
          state: 1,
          points: "$totalPoints",
          badges: 1,
          logo: 1,
          category: 1
        }
      }
    ];

    const leaderboard = await NGO.aggregate(pipeline);
    return res.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching NGO leaderboard:", error);
    return res.status(500).json({ message: "Error fetching NGO leaderboard", error: error.message });
  }
};



// Get NGO rank based on points
export const getNGORank = async (req, res) => {
  try {
    const ngoId = req.params.id;
    const ngo = await NGO.findById(ngoId);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    const higherRankCount = await NGO.countDocuments({ points: { $gt: ngo.points } });
    const rank = higherRankCount + 1;

    return res.json({ rank, points: ngo.points, badges: ngo.badges });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching NGO rank", error: error.message });
  }
};
