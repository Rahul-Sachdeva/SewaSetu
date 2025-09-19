import { User } from "../Models/user.model.js";
import { generateToken } from "../Utils/jwt.js";
import uploadCloudinary from "../Utils/cloudinary.js";
import { sendEmail } from "../Utils/sendEmail.js";
import jwt from "jsonwebtoken";

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

export const updateProfile = async(req, res) => {
    try {
        const updates = req.body;
        let {location_coordinates} = req.body;
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
        const user = await User.findByIdAndUpdate(req.user._id, updates, {new: true}).select("-password");

        return res.status(200).json({ message: "Profile Updated Successfully", user });
    } catch(err){
        return res.status(500).json({message: "Error updating profile", error: err.message});
    }
};

