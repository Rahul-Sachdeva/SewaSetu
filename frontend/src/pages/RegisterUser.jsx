import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthWrapper from "../components/AuthWrapper.jsx";
import axios from "axios";
import { BaseURL } from "../BaseURL.jsx";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Default marker icon fix for leaflet
import "leaflet/dist/leaflet.css";
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
    user_type: "user",
    city: "",
    state: "",
    address: "",
    location_coordinates: [],
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState([20.5937, 78.9629]); // default India center

  // Component to handle map clicks
  function LocationMarker({ setFormData, selectedCoords, setSelectedCoords }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setSelectedCoords([lat, lng]);
            setFormData((prev) => ({
                ...prev,
                location_coordinates: `${lng},${lat}`,
            }));
        },
    });

    return selectedCoords ? (
        <Marker position={selectedCoords} icon={customIcon} />
    ) : null;
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            setSelectedCoords([latitude, longitude]);
            setFormData((prev) => ({
                ...prev,
                location_coordinates: `${longitude},${latitude}`,
            }));

            // Center and zoom map to user’s location
            if (mapRef.current) {
                mapRef.current.setView([latitude, longitude], 9); 
            }
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // preview
    }
  };

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:rind-[#19398a] text-sm"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:rind-[#19398a] text-sm"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:rind-[#19398a] text-sm"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:rind-[#19398a] text-sm"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:rind-[#19398a] text-sm"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:rind-[#19398a] text-sm"
          />
          <textarea
            name="address"
            placeholder="Full Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:rind-[#19398a] text-sm"
          />

          {/* Profile Image */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#19398a] transition">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Upload Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="profileImageInput"
            />
            <label
              htmlFor="profileImageInput"
              className="px-4 py-2 bg-[#19398a] text-white text-sm rounded-lg cursor-pointer hover:bg-[#2e58c2] transition"
            >
              Choose File
            </label>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-3 h-24 w-24 object-cover rounded-full border"
              />
            )}
          </div>

          {/* ---- Location Selection ---- */}
          <div>
            <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="mb-2 px-3 py-1 bg-[#ffd600] text-black text-sm rounded hover:bg-yellow-500 transition"
            >
                Use My Current Location
            </button>

            <MapContainer
                center={selectedCoords}
                zoom={5}
                style={{ height: "300px", width: "100%" }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    setFormData={setFormData}
                    selectedCoords={selectedCoords}
                    setSelectedCoords={setSelectedCoords}
                />
            </MapContainer>
        </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#19398a] text-white rounded-lg font-semibold hover:bg-[#2e58c2] transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

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
