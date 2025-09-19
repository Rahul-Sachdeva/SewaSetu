import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthWrapper from "../components/AuthWrapper.jsx";
import axios from "axios";
import { BaseURL } from "../BaseURL.jsx";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState([20.5937, 78.9629]);
  const [verificationDocs, setVerificationDocs] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

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
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleVerificationDocsChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // max 5
    setVerificationDocs(files);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // max 5
    setGalleryImages(files);
  };


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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="NGO Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            name="registration_number"
            placeholder="Registration Number"
            value={formData.registration_number}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
          />
          <textarea
            name="address"
            placeholder="Full Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
          />
          <textarea
            name="description"
            placeholder="About your NGO (Mission, Work Areas, etc.)"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
          />

          {/* Profile Image */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Upload NGO Logo / Image
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

          {/* Verification Documents */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Upload Verification Documents (PDF, up to 5)
            </label>
            <input
              id="verificationDocsInput"
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleVerificationDocsChange}
              className="hidden"
            />
            <label
              htmlFor="verificationDocsInput"
              className="px-4 py-2 bg-[#19398a] text-white text-sm rounded-lg cursor-pointer hover:bg-[#2e58c2] transition"
            >
              Choose File
            </label>
            {verificationDocs.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{file.name}</span>
                <a
                  href={URL.createObjectURL(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View
                </a>
              </div>
            ))}
          </div>

          {/* Gallery */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Upload NGO Gallery (Images, up to 5)
            </label>
            <input
              id="galleryInput"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="hidden"
            />
            <label
              htmlFor="galleryInput"
              className="px-4 py-2 bg-[#19398a] text-white text-sm rounded-lg cursor-pointer hover:bg-[#2e58c2] transition"
            >
              Choose File
            </label>
            
            <div className="flex gap-2 mt-2 flex-wrap">
              {galleryImages.map((img, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded border"
                />
              ))}
            </div>
          </div>


          {/* Location Selection */}
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
            {loading ? "Registering NGO..." : "Register NGO"}
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
        <p className="mt-4 text-center text-sm">
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
