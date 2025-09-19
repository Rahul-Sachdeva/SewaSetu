import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { BaseURL } from "../BaseURL";

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

const UserForm = ({
  formData,
  setFormData,
  setProfileImage,
  loading,
  message,
  handleSubmit,
  registering,
}) => {
  const mapRef = useRef();

  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState([20.5937, 78.9629]); // default India

  // ✅ Fetch profile data when updating
  useEffect(() => {
    if (!registering) {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${BaseURL}/api/v1/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const profile = res.data;
          setFormData({
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            about: profile.about || "",
            city: profile.city || "",
            state: profile.state || "",
            address: profile.address || "",
            password: "", // don’t prefill password
            location_coordinates: profile.location_coordinates || "",
          });

          if (profile.profileImage) {
            setPreviewUrl(profile.profileImage);
          }

          if (profile.location_coordinates) {
            const [lng, lat] = profile.location_coordinates.split(",");
            setSelectedCoords([lat, lng]);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      };
      fetchProfile();
    }
  }, [registering, setFormData]);

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

  return (
    <>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mt-8">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          readOnly={!registering} // ✅ lock field in update mode
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          readOnly={!registering} // ✅ lock field in update mode
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
        />
        {registering && (
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
          />
        )}
        <input
          type="text"
          name="about"
          placeholder="Tell us About Yourself"
          value={formData.about}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
        />
        <textarea
          name="address"
          placeholder="Full Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
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
          {loading
            ? registering
              ? "Registering..."
              : "Updating..."
            : registering
            ? "Register"
            : "Update"}
        </button>
      </form>

      {/* Message */}
      {message && (
        <p className="mt-3 text-center text-sm font-semibold text-red-500">
          {message}
        </p>
      )}
    </>
  );
};

export default UserForm;
