import { User } from "../Models/user.model.js";
import { generateToken } from "../Utils/jwt.js";
import uploadCloudinary from "../Utils/cloudinary.js";
import { sendEmail } from "../Utils/sendEmail.js";
import jwt from "jsonwebtoken";
import { NGO } from "../Models/ngo.model.js";
import { Conversation } from "../Models/conversation.model.js";

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
            about
        } = req.body;
        
        let {location_coordinates} = req.body;
        // Check mandatory fields
        if (!name || !email || !phone || !password || !user_type || !city || !state || !location_coordinates) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }
        
        // Ensure it's parsed from string to array
        if (typeof location_coordinates === "string") {
            try {
                location_coordinates = location_coordinates.split(",").map(Number);
            } catch (err) {
                console.log(err.message);
                return res.status(400).json({ message: "Invalid location_coordinates format" });
            }
        }
        
        // Ensure location_coordinates is an array of numbers
        if (!Array.isArray(location_coordinates) || location_coordinates.length !== 2) {
            return res.status(400).json({ message: "location_coordinates must be [longitude, latitude]" });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        let profileImageUrl="";
        if(req.file && req.file.buffer){
            const uploadResult = await uploadCloudinary(req.file.buffer);
            profileImageUrl = uploadResult.secure_url;
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            phone,
            about,
            password, // hashed automatically in pre("save")
            user_type,
            city,
            state,
            address,
            profile_image: profileImageUrl || "",
            ngo: user_type === "ngo" ? ngo : undefined, // only attach if NGO
            location_coordinates,
        });

        await sendVerificationEmail(user);

        return res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, name: user.name, email: user.email, role: user.user_type}
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error registering user",
            error: err.message,
        });
    }
};

export const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;
        
        const user = await User.findOne({ email });
        if(!user) return res.status(400).json({ message: "Invalid email"});

        const isMatch = await user.isPasswordCorrect(password);
        if(!isMatch) return res.status(400).json({ message: "Wrong Password"});

        if (!user.isVerified) {
            await sendVerificationEmail(user);
            return res.status(403).json({ message: "Please verify your email. Verification link sent." });
        }

        return res.status(200).json({
            message: "Login successful",
            token: generateToken(user),
            user: { id: user._id, name: user.name, email: user.email, role: user.user_type, ngo: user.ngo }
        });
    } catch (err) {
        console.log("Error: ", err.message)
        return res.status(500).json({message: "Error logging in", error: err.message});
    }
}

export const sendVerificationEmail = async (user) => {
  const token = jwt.sign(
    { userId: user._id },
    process.env.EMAIL_SECRET,
    { expiresIn: "1h" }
  );

  // Save token in DB
  user.verificationToken = token;
  user.verificationTokenExpiry = Date.now() + 86400000; // 1 hour
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
    
    if(user && user.isVerified){
        return res.status(200).json({message: "Email Already Verified"});
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

export const getProfile = async(req, res) => {
    try {
        return await res.json(req.user);
    } catch (error) {
        console.log("Error: ", error.message);
    }
}

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by ID and exclude sensitive fields
    const user = await User.findById(id).select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        let { location_coordinates } = req.body;

        // Handle profile image update
        let profileImageUrl = "";
        if (req.file && req.file.buffer) {
            try {
                const uploadResult = await uploadCloudinary(req.file.buffer);
                profileImageUrl = uploadResult.secure_url;
                updates.profile_image = profileImageUrl; // save in updates
            } catch (err) {
                return res.status(500).json({ message: "Error uploading profile image", error: err.message });
            }
        }

        // Ensure it's parsed from string to array
        if (typeof location_coordinates === "string") {
            try {
                location_coordinates = location_coordinates.split(",").map(Number);
            } catch (err) {
                console.log(err.message);
                return res.status(400).json({ message: "Invalid location_coordinates format" });
            }
        }

        // Ensure location_coordinates is an array of numbers
        if (!Array.isArray(location_coordinates) || location_coordinates.length !== 2) {
            return res.status(400).json({ message: "location_coordinates must be [longitude, latitude]" });
        }

        updates.location_coordinates = location_coordinates;

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select("-password");

        return res.status(200).json({
            message: "Profile Updated Successfully",
            user,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error updating profile",
            error: err.message,
        });
    }
};

// Follow an NGO
export const followNGO = async (req, res) => {
  try {
    const userId = req.user.id;
    const ngoId = req.params.id;

    const user = await User.findById(userId);
    const ngo = await NGO.findById(ngoId);

    if (!user || !ngo) return res.status(404).json({ message: "User or NGO not found" });

    // Prevent duplicate following
    if (user.following.includes(ngoId)) {
      return res.status(400).json({ message: "Already following NGO" });
    }

    // Add NGO to user's following
    user.following.push(ngoId);
    await user.save();

    // Add user to NGO's followers
    ngo.followers = ngo.followers || [];
    if (!ngo.followers.includes(userId)) {
      ngo.followers.push(userId);
      await ngo.save();
    }

    // 🔹 Add user to NGO conversation
    let conversation = await Conversation.findOne({
      type: "ngo_followers",
      ngo: ngo._id,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: "ngo_followers",
        ngo: ngo._id,
        participants: [],
      });
    }

    if (
      !conversation.participants.some(
        (p) => p.participant.toString() === userId.toString()
      )
    ) {
      conversation.participants.push({
        participantType: "User",
        participant: userId,
      });
      await conversation.save();
    }

    return res.status(200).json({ message: "NGO followed & added to chat", ngo });
  } catch (err) {
    return res.status(500).json({ message: "Error following NGO", error: err.message });
  }
};

// Unfollow an NGO
export const unfollowNGO = async (req, res) => {
  try {
    const userId = req.user.id;
    const ngoId = req.params.id;

    const user = await User.findById(userId);
    const ngo = await NGO.findById(ngoId);

    if (!user || !ngo) return res.status(404).json({ message: "User or NGO not found" });

    // Remove NGO from user's following
    user.following = user.following.filter((id) => id.toString() !== ngoId);
    await user.save();

    // Remove user from NGO's followers
    ngo.followers = ngo.followers?.filter((id) => id.toString() !== userId);
    await ngo.save();

    // 🔹 Remove user from NGO conversation
    const conversation = await Conversation.findOne({
      type: "ngo_followers",
      ngo: ngo._id,
    });

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

// Check if the current user is following an NGO
export const checkFollowing = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { ngoId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isFollowing = user.following.includes(ngoId);
    return res.status(200).json({ isFollowing });
  } catch (err) {
    console.error("Error checking following:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};