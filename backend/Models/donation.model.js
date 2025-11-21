import mongoose from "mongoose";
// import shortid from "shortid"; // For generating unique short IDs
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890abcdef', 8); // 8-char hex


const DonationSchema = new mongoose.Schema(
  {
    donar_id: {
      type: String,
      unique: true,
      default: () => `REQ-${nanoid()}`,
      required: true, 
    },
    // request_id: {
    //   type: String,
    //   unique: true,
    //   default: () => `REQ-${shortid.generate()}`, // Auto-generate ID like REQ-Jk3lP9
    // },
    full_name: {
      type: String,
      required: true,
    },
    phone: {
      type: String, // optional
    },
    address: {
      type: String,
      required: true,
    },
    location_coordinates: {
      type: [Number], // [longitude, latitude], optional
      default: undefined,
    },
    category: {
      type: String, // Donation Category
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number, // or String, depending on your UI
      required: true,
      min: 1,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open", // All requests start as open
    },
    donatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    selectedNGOs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NGO",
      },
    ],
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export const Donation = mongoose.model(
  "Donation",
  DonationSchema
);
