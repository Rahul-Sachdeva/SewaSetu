import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

// Predefined categories
const categoriesList = [
  "Food & Shelter",
  "Clothes",
  "Medical Help",
  "Education Support",
  "Financial Help",
  "Legal Assistance",
  "Emergency/Disaster Relief",
  "Other",
];

const CategorySelector = ({ formData, setFormData }) => {
  const [inputValue, setInputValue] = useState("");

  const addCategory = (category) => {
    if (!formData.category.includes(category)) {
      setFormData((prev) => ({
        ...prev,
        category: [...prev.category, category],
      }));
    }
    setInputValue("");
  };

  const removeCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.filter((c) => c !== category),
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      addCategory(inputValue.trim());
      e.preventDefault();
    }
  };

  return (
    <div className="border border-gray-300 rounded p-2 flex flex-wrap gap-2">
      {formData.category.map((cat, idx) => (
        <div
          key={idx}
          className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
        >
          {cat}
          <button
            type="button"
            onClick={() => removeCategory(cat)}
            className="ml-1 font-bold"
          >
            ×
          </button>
        </div>
      ))}
      <input
        type="text"
        placeholder="Add category..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[120px] border-none outline-none text-sm"
      />
      <div className="w-full mt-1 flex flex-wrap gap-1">
        {categoriesList
          .filter((cat) => !formData.category.includes(cat))
          .map((cat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addCategory(cat)}
              className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              {cat}
            </button>
          ))}
      </div>
    </div>
  );
};

const NGOForm = ({
  formData,
  setFormData,
  setProfileImage,
  loading,
  verificationDocs,
  setVerificationDocs,
  galleryImages,
  setGalleryImages,
  handleSubmit,
  registering, // true => Register, false => Update
}) => {
  const mapRef = useRef();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState([20.5937, 78.9629]);

  const handleChangeMulti = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      category: selectedOptions,
    }));
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* NGO Name */}
      <input
        type="text"
        name="name"
        placeholder="NGO Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
      />

      {/* Registration Number (Read-only in update mode) */}
      <input
        type="text"
        name="registration_number"
        placeholder="Registration Number"
        value={formData.registration_number}
        onChange={handleChange}
        readOnly={!registering}
        className={`w-full px-4 py-3 border rounded-lg text-sm ${
          !registering ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
        }`}
      />

      {/* Email (Read-only in update mode) */}
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        readOnly={!registering}
        className={`w-full px-4 py-3 border rounded-lg text-sm ${
          !registering ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
        }`}
      />

      {/* Password (only show when registering) */}
      {registering && (
        <input
          type="password"
          name="password"
          placeholder="Password (min 6 chars)"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
        />
      )}

      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
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
      {/* Category */}
      <CategorySelector formData={formData} setFormData={setFormData} />



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
          NGO Logo / Image
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

      {/* Submit */}
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
  );
};

export default NGOForm;
