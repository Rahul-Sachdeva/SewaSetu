import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthWrapper from "../components/AuthWrapper.jsx";
import axios from "axios";
import { BaseURL } from "../BaseURL.jsx";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import NGOForm from "../components/NGOForm.jsx";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

const RegisterNGO = () => {
  const navigate = useNavigate();
  const mapRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    registration_number: "",
    email: "",
    phone: "",
    password: "",
    user_type: "ngo", // Important: this marks it as NGO user
    city: "",
    state: "",
    address: "",
    location_coordinates: [],
    description: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [verificationDocs, setVerificationDocs] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (
      !formData.name ||
      !formData.registration_number ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.city ||
      !formData.state ||
      !formData.address ||
      !formData.description
    ) {
      setMessage("❌ Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      // STEP 1: Register user
      const ngoForm = new FormData();
      Object.keys(formData).forEach((key) => {
        ngoForm.append(key, formData[key]);
      });
      if (profileImage) ngoForm.append("profile_image", profileImage);
      
      const userRes = await axios.post(
        `${BaseURL}/api/v1/user/register`,
        ngoForm,
        {headers: { "Content-Type": "multipart/form-data" }}
      );

      const userId = userRes.data.user?.id;
      if (!userId) throw new Error("User ID not returned");

      // STEP 2: Register NGO
      ngoForm.append("userId", userId);
      
      verificationDocs.forEach((doc) => {
        ngoForm.append("documents", doc);
      });

      galleryImages.forEach((img) => {
        ngoForm.append("gallery", img);
      });

      await axios.post(`${BaseURL}/api/v1/ngo/register`, ngoForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ NGO registration successful! Please verify your email.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      setMessage(
        `❌ ${
          err.response?.data?.message || "Something went wrong. Try again later."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6">
        {/* Logo */}
        <div className="text-center mb-4">
          <img
            src="/src/assets/logo.png"
            alt="SewaSetu"
            className="h-12 mx-auto mb-2"
          />
          <h2 className="text-2xl font-bold text-[#19398a]">Register NGO</h2>
          <p className="text-gray-500 text-sm">
            Register your NGO on SewaSetu
          </p>
        </div>

        <NGOForm 
          formData={formData}
          setFormData={setFormData}
          setProfileImage={setProfileImage}
          loading={loading}
          verificationDocs={verificationDocs}
          setVerificationDocs={setVerificationDocs}
          galleryImages={galleryImages}
          setGalleryImages={setGalleryImages}
          handleSubmit={handleSubmit}
          registering={true}
        />

        {/* Message */}
        {message && (
          <p className="mt-3 text-center text-sm font-semibold text-red-500">
            {message}
          </p>
        )}

        {/* Links */}
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="login-highlight">
            Login&nbsp;Here!
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          Are you a Normal User?{" "}
          <Link to="/register-user" className="login-highlight">
            Register&nbsp;Here!
          </Link>
        </p>
      </div>
    </AuthWrapper>
  );
};

export default RegisterNGO;
