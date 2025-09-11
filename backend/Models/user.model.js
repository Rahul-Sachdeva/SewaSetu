import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
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
            enum: ["donor", "ngo_member", "volunteer", "admin"],
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        profileImage: {
            type: String, 
        },
        location_coordinates: {
            type: [Number], 
            required: true,
        }
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
