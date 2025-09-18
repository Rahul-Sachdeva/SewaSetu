import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: Number, 
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        user_type: {
            type: String,
            enum: [
                "user",        // general donors
                "ngo",          // organization’s main account
                "admin"         // system super-admin
            ],
            required: true,
        },
        ngo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO"
        },
        address: {
            type: String
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        profile_image: {
            type: String, 
        },
        location_coordinates: {
            type: [Number], 
            required: true,
        },
        // 🔑 For email verification
        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String }, 
        verificationTokenExpiry: { type: Date },
    },
    {timestamps: true}
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model("User", userSchema);
