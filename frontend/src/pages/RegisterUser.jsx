import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthWrapper from "../components/AuthWrapper.jsx";
import axios from "axios";
import { BaseURL } from "../BaseURL.jsx";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Default marker icon fix for leaflet
import "leaflet/dist/leaflet.css";
import UserForm from "../components/UserForm.jsx";
const customIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35], // size of the icon
    iconAnchor: [17, 34], // point of the icon which corresponds to marker's location
    popupAnchor: [0, -30], // popup position relative to icon
});

const RegisterUser = () => {
  const navigate = useNavigate();
  const mapRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    about: "",
    user_type: "user",
    city: "",
    state: "",
    address: "",
    location_coordinates: [],
  });

  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    // basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.city || !formData.state || !formData.address) {
      setMessage("❌ Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });
    if (profileImage) {
      formDataObj.append("profile_image", profileImage);
    }

    try {
      const res = await axios.post(
        `${BaseURL}/api/v1/user/register`,
        formDataObj,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setMessage("✅ Registration successful! Please verify your email.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.log(err);
      setMessage(
        `❌ ${err.response?.data?.message || "Something went wrong. Try again later."}`
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
          <h2 className="text-2xl font-bold text-[#19398a]">Register</h2>
          <p className="text-gray-500 text-sm">Create your SewaSetu account</p>
        </div>

        <UserForm 
          formData={formData} 
          setFormData={setFormData} 
          setProfileImage={setProfileImage}
          loading={loading}
          message={message} 
          handleSubmit={handleSubmit} 
          registering={true}
        />

        {/* Links */}
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
            <Link to="/login" className="login-highlight">
                Login&nbsp;Here!
            </Link>
        </p>
        <p className="mt-1 text-center text-sm">
          Are you an NGO?{" "}
          <Link to="/register-ngo" className="login-highlight">
            Register&nbsp;your&nbsp;NGO!
          </Link>
        </p>
      </div>
    </AuthWrapper>
  );
};

export default RegisterUser;
