import { User } from "../Models/user.model.js";
import { generateToken } from "../Utils/jwt.js";

export const registerUser = async (req, res) => {
    try {
        const {name, email, phone, password, user_type, city, location_coordinates} = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) return res.status(400).json({ message: "Email already in Use"});

        const user = await User.create({
            name, email, phone, password, user_type, city, location_coordinates
        });

        return res.status(201).json({
            message: "User registered successfully",
            token: generateToken(user),
            user: { id: user._id, name: user.name, email: user.email, role: user.user_type}
        })
    } catch (err) {
        return res.status(500).json({ message: "Error registering user", error: err.message});
    }
}

export const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;
        
        const user = await User.findOne({ email });
        if(!user) return res.status(400).json({ message: "Invalid email"});

        const isMatch = await user.isPasswordCorrect(password);
        if(!isMatch) return res.status(400).json({ message: "Wrong Password"});

        return res.status(200).json({
            message: "Login successful",
            token: generateToken(user),
            user: { id: user._id, name: user.name, email: user.email, role: user.user_type }
        });
    } catch (err) {
        return res.status(500).json({message: "Error logging in", error: err.message});
    }
}

export const getProfile = async(req, res) => {
    return res.json(req.user);
}

export const updateProfile = async(req, res) => {
    try {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, updates, {new: true}).select("-password");

        return res.status(200).json({ message: "Profile Updated Successfully", user });
    } catch(err){
        return res.status(500).json({message: "Error updating profile", error: err.message});
    }
};

