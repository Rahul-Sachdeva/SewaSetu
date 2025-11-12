import { User } from "../Models/user.model.js";
import { generateToken } from "../Utils/jwt.js";
import uploadCloudinary from "../Utils/cloudinary.js";
import { sendEmail } from "../Utils/sendEmail.js";
import jwt from "jsonwebtoken";
import { NGO } from "../Models/ngo.model.js";
import { Conversation } from "../Models/conversation.model.js";
import { Notification } from "../Models/notification.model.js";
import { sendNotification } from "../Utils/notification.utils.js";

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      user_type,
      city,
      state,
      address,
      ngo,
      about,
    } = req.body;

    let { location_coordinates } = req.body;
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !user_type ||
      !city ||
      !state ||
      !location_coordinates
    ) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }
    if (typeof location_coordinates === "string") {
      try {
        location_coordinates = location_coordinates.split(",").map(Number);
      } catch (err) {
        return res.status(400).json({ message: "Invalid location_coordinates format" });
      }
    }
    if (!Array.isArray(location_coordinates) || location_coordinates.length !== 2) {
      return res.status(400).json({ message: "location_coordinates must be [longitude, latitude]" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    let profileImageUrl = "";
    if (req.file && req.file.buffer) {
      const uploadResult = await uploadCloudinary(req.file.buffer);
      profileImageUrl = uploadResult.secure_url;
    }

    const user = await User.create({
      name,
      email,
      phone,
      about,
      password,
      user_type,
      city,
      state,
      address,
      profile_image: profileImageUrl || "",
      ngo: user_type === "ngo" ? ngo : undefined,
      location_coordinates,
    });

    await updateUserPoints(user._id, "registration", 10);
    await sendVerificationEmail(user);

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.user_type },
    });
  } catch (err) {
    return res.status(500).json({ message: "Error registering", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Step 1: Find user
    const user = await User.findOne({ email }).populate("ngo");
    if (!user) return res.status(400).json({ message: "Invalid email" });

    // 🔹 Step 2: Validate password
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    // 🔹 Step 3: Ensure email verified
    if (!user.isVerified) {
      await sendVerificationEmail(user);
      return res.status(403).json({
        message: "Please verify your email. A new verification link has been sent.",
      });
    }

    // 🔹 Step 4: If user is an NGO, check NGO verification status
    if (user.user_type === "ngo") {
      const ngoId = user.ngo?._id || user.ngo;
      if (!ngoId)
        return res.status(400).json({ message: "NGO profile not linked to this account" });

      const ngo = await NGO.findById(ngoId).lean();
      if (!ngo)
        return res.status(404).json({ message: "NGO record not found for this account" });

      if (ngo.verification_status !== "verified") {
        return res.status(403).json({
          message:
            "Your NGO account is pending admin verification. Please wait for approval before logging in.",
        });
      }
    }

    // 🔹 Step 5: Include notification permission info
    const notifyPermissionNeeded = !user.notificationPermissionRequested;

    // 🔹 Step 6: Generate token & respond
    return res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        role: user.user_type,
        ngo: user.ngo,
        city: user.city,
        state: user.state,
        notificationPermissionNeeded: notifyPermissionNeeded,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res
      .status(500)
      .json({ message: "Error logging in", error: err.message });
  }
};

export const sendVerificationEmail = async (user) => {
  const token = jwt.sign({ userId: user._id }, process.env.EMAIL_SECRET, { expiresIn: "1h" });
  user.verificationToken = token;
  user.verificationTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const html = `
    <h2>Email Verification</h2>
    <p>Hello ${user.name},</p>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verifyUrl}">Verify Email</a>
    <p>This link will expire in 1 hour.</p>
  `;
  await sendEmail(user.email, "Verify your email", html);
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    const user = await User.findById(decoded.userId);
    if (user && user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }
    if (!user || user.verificationToken !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

export const getProfile = async (req, res) => {
  try {
    return await res.json(req.user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    let { location_coordinates } = req.body;
    let profileImageUrl = "";
    if (req.file && req.file.buffer) {
      const uploadResult = await uploadCloudinary(req.file.buffer);
      profileImageUrl = uploadResult.secure_url;
      updates.profile_image = profileImageUrl;
    }
    if (typeof location_coordinates === "string") {
      try {
        location_coordinates = location_coordinates.split(",").map(Number);
      } catch (err) {
        return res.status(400).json({ message: "Invalid location_coordinates format" });
      }
    }
    if (!Array.isArray(location_coordinates) || location_coordinates.length !== 2) {
      return res.status(400).json({ message: "location_coordinates must be [longitude, latitude]" });
    }
    updates.location_coordinates = location_coordinates;

    // Update user
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

// Follow NGO
export const followNGO = async (req, res) => {
  try {
    const userId = req.user.id;
    const ngoId = req.params.id;
    const user = await User.findById(userId);
    const ngo = await NGO.findById(ngoId);
    if (!user || !ngo) return res.status(404).json({ message: "User or NGO not found" });

    if (user.following.includes(ngoId)) {
      return res.status(400).json({ message: "Already following NGO" });
    }
    user.following.push(ngoId);
    await user.save();

    ngo.followers = ngo.followers || [];
    if (!ngo.followers.includes(userId)) {
      ngo.followers.push(userId);
      await ngo.save();
    }

    let conversation = await Conversation.findOne({ type: "ngo_followers", ngo: ngo._id });
    if (!conversation) {
      conversation = await Conversation.create({ type: "ngo_followers", ngo: ngo._id, participants: [] });
    }
    if (!conversation.participants.some((p) => p.participant.toString() === userId.toString())) {
      conversation.participants.push({ participantType: "User", participant: userId });
      await conversation.save();
    }

    return res.status(200).json({ message: "NGO followed & added to chat", ngo });
  } catch (err) {
    return res.status(500).json({ message: "Error following NGO", error: err.message });
  }
};

// Unfollow NGO
export const unfollowNGO = async (req, res) => {
  try {
    const userId = req.user.id;
    const ngoId = req.params.id;
    const user = await User.findById(userId);
    const ngo = await NGO.findById(ngoId);
    if (!user || !ngo) return res.status(404).json({ message: "User or NGO not found" });

    user.following = user.following.filter((id) => id.toString() !== ngoId);
    await user.save();

    ngo.followers = (ngo.followers || []).filter((id) => id.toString() !== userId);
    await ngo.save();

    const conversation = await Conversation.findOne({ type: "ngo_followers", ngo: ngo._id });
    if (conversation) {
      conversation.participants = conversation.participants.filter(
        (p) => p.participant.toString() !== userId
      );
      await conversation.save();
    }

    return res.status(200).json({ message: "Unfollowed NGO & removed from chat" });
  } catch (err) {
    return res.status(500).json({ message: "Error unfollowing NGO", error: err.message });
  }
};

// Check if following NGO
export const checkFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ngoId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isFollowing = user.following.includes(ngoId);
    return res.status(200).json({ isFollowing });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const saveDeviceToken = async (req, res) => {
  try {
    let userId = req.user._id;
    if (req.user.ngo) userId = req.user.ngo;
    let userType = req.user.ngo ? "NGO" : "User";
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Device token is required" });

    let user;
    if (userType == "User") {
      user = await User.findById(userId);
    }
    else {
      user = await NGO.findById(userId);
    }
    if (!user) return res.status(404).json({ message: "User not found" });

    // Use a Set or ensure no duplicates
    if (!user.deviceTokens) user.deviceTokens = [];
    if (!user.deviceTokens.includes(token)) {
      user.deviceTokens.push(token);
      await user.save();
    }

    return res.status(200).json({ message: "Device token saved successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error saving device token", error: err.message });
  }
};

// Utility: badge thresholds
const badgeThresholds = [
  { name: "Bronze", points: 100 },
  { name: "Silver", points: 300 },
  { name: "Gold", points: 600 },
  { name: "Platinum", points: 1000 }
];

// Update points and badges based on activity
export const updateUserPoints = async (userId, activity, pointsEarned) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Update points and activity
  user.points += pointsEarned;
  user.activityHistory.push({
    activity: activity,       // activity name string
    points: pointsEarned,     // numeric points
    date: new Date(),         // timestamp of activity
  });


  // Check badge eligibility
  for (const badge of badgeThresholds) {
    if (user.points >= badge.points && !user.badges.includes(badge.name)) {
      user.badges.push(badge.name);



      // In-app notification
      await Notification.create({
        user: user._id,
        userModel: "User",
        type: "badge_unlocked",
        title: `Badge Unlocked: ${badge.name}`,
        message: `Congratulations! You have successfully earned the prestigious ${badge.name} badge on SewaSetu. This milestone is a testament to your dedication and positive impact within our community. Keep up the fantastic work and continue making a difference – more achievements and rewards await you!`,
        referenceId: null,
        referenceModel: null,
      });

      // Send Email
      const emailHTML = `
    <h2>SewaSetu - Your Bridge To Serve</h2></div>
    <h2>Congratulations!</h2>
    <p>You have successfully earned the prestigious <strong>${badge.name}</strong> badge on SewaSetu. This milestone is a testament to your dedication and positive impact within our community. Keep up the fantastic work and continue making a difference – more achievements and rewards await you!</p>`;
      await sendEmail(user.email, `Badge Unlocked: ${badge.name}`, emailHTML);
    }
  }
  console.log(`User badges count: ${user.badges.length}`);
  await user.save();
  return user;
};

// API to get user points and badges
export const getUserPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("points badges activityHistory");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ points: user.points, badges: user.badges, activityHistory: user.activityHistory });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user points", error: error.message });
  }
};

export const getUserLeaderboard = async (req, res) => {
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

    // Aggregate total points based on period
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
                      cond: { $gte: ["$$activity.date", new Date(startOfMonth)] }
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
          email: 1,
          points: "$totalPoints",
          badges: 1,
          profile_image: 1,
          city: 1,
          state: 1
        }
      }
    ];

    const leaderboard = await User.aggregate(pipeline);

    return res.json({ leaderboard });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user leaderboard", error: error.message });
  }
};

export const getUserRank = async (req, res) => {
  try {
    const userId = req.params.id;
    const period = req.query.period || "allTime";
    console.log(`Calculating rank for user ${userId} in period ${period}`);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    if (period === "thisMonth") {
      const startOfMonth = new Date();
      startOfMonth.setHours(0, 0, 0, 0);

      // Calculate user's points for this month from activityHistory
      const monthlyPoints = user.activityHistory
        .filter(a => a.date >= startOfMonth)
        .reduce((acc, a) => acc + a.points, 0);

      console.log(`User monthly points: ${monthlyPoints}`);

      // Count how many users have higher points this month
      const higherRankCount = await User.countDocuments({
        "activityHistory.date": { $gte: startOfMonth },
        $expr: {
          $gt: [{
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
          }, monthlyPoints]
        }
      });

      const rank = higherRankCount + 1;
      console.log(`User this month rank: ${rank}`);

      return res.json({ rank, points: monthlyPoints, badges: user.badges });

    } else {
      // All time rank based on total points
      const higherRankCount = await User.countDocuments({ points: { $gt: user.points } });
      const rank = higherRankCount + 1;
      console.log(`User all-time points: ${user.points}, rank: ${rank}`);
      return res.json({ rank, points: user.points, badges: user.badges });
    }

  } catch (error) {
    console.error("Error fetching user rank:", error);
    return res.status(500).json({ message: "Error fetching user rank", error: error.message });
  }
};

