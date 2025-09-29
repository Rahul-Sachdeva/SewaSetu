import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BaseURL } from "../BaseURL";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "../components/Navbar";

// Leaflet
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate, useParams } from "react-router-dom";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

// Subcomponent: handles map click events
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

const CampaignCreatePage = ({ mode = "create" }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    address: "",
    location_coordinates: "",
    targetFunds: "",
    targetVolunteers: "",
    razorpayQR: "", // new
  });

  const { id } = useParams(); // campaignId when editing
  const navigate = useNavigate();

  const [selectedCoords, setSelectedCoords] = useState([20.5937, 78.9629]); // Default India
  const [bannerImage, setBannerImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  // 🟢 Fetch existing campaign when editing
  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchCampaign = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${BaseURL}/api/v1/campaign/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = res.data;

        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          startDate: data.startDate?.slice(0, 10),
          endDate: data.endDate?.slice(0, 10),
          address: data.address,
          location_coordinates: data.location_coordinates,
          targetFunds: data.targetFunds,
          targetVolunteers: data.targetVolunteers,
          razorpayQR: data.razorpayQR || "",
        });

          if (data.bannerImage) {
            setPreviewUrl(data.bannerImage);
          }

          if (data.location_coordinates) {
            let lat, lng;

            // If array → [lng, lat]
            if (Array.isArray(data.location_coordinates)) {
              [lng, lat] = data.location_coordinates;
            }
            // If string → "lng,lat"
            else if (typeof data.location_coordinates === "string") {
              [lng, lat] = data.location_coordinates.split(",").map(Number);
            }

            setSelectedCoords([lat, lng]);
          }
        } catch (err) {
          console.error(err);
          alert("Failed to load campaign details");
        }
      };
      fetchCampaign();
    }
  }, [mode, id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setBannerImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

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
          mapRef.current.setView([latitude, longitude], 12);
        }
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (bannerImage) {
        data.append("bannerImage", bannerImage);
      }

      const token = localStorage.getItem("token");

      if (mode === "create") {
        await axios.post(`${BaseURL}/api/v1/campaign`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("✅ Campaign created successfully!");
      } else {
        await axios.put(`${BaseURL}/api/v1/campaign/${id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("✅ Campaign updated successfully!");
      }

      navigate("/ngo/my-campaigns");
    } catch (err) {
      console.error(err);
      alert("❌ Error: " + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ fontFamily: "'Inter', Arial, sans-serif", background: "#f4f6f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      

        <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
          <Card className="w-full max-w-4xl shadow-lg border border-gray-200 rounded-2xl">
            <CardContent className="p-6 md:p-10">
              {/* Header */}
              <h1 className="text-2xl md:text-3xl font-bold text-[#19398a] mb-2">
                {mode === "create" ? "Create a New Campaign" : "Edit Campaign"}
              </h1>
              <p className="text-gray-600 mb-6">
                Fill in the details below to start a new campaign for your NGO.
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section: Basic Info */}
                <div>
                  <h2 className="text-lg font-semibold text-[#19398a] mb-2">
                    Basic Information
                  </h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        onValueChange={(val) =>
                          setFormData((prev) => ({ ...prev, category: val }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white">
                          <SelectItem value="fundraising" className="hover:bg-[#19398a1d]">Fundraising</SelectItem>
                          <SelectItem value="food_drive" className="hover:bg-[#19398a1d]">Food Drive</SelectItem>
                          <SelectItem value="blood_donation" className="hover:bg-[#19398a1d]">
                            Blood Donation
                          </SelectItem>
                          <SelectItem value="medical_camp" className="hover:bg-[#19398a1d]">Medical Camp</SelectItem>
                          <SelectItem value="awareness" className="hover:bg-[#19398a1d]">Awareness</SelectItem>
                          <SelectItem value="others" className="hover:bg-[#19398a1d]">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Section: Dates & Address */}
                <div>
                  <h2 className="text-lg font-semibold text-[#19398a] mb-2">
                    Dates & Address
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Section: Location Selection (Map) */}
                <div>
                  <h2 className="text-lg font-semibold text-[#19398a] mb-2">
                    Location Coordinates
                  </h2>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="mb-2 px-3 py-1 bg-[#ffd600] text-black text-sm rounded hover:bg-yellow-500 transition"
                  >
                    Use My Current Location
                  </button>

                  <div className="rounded-lg overflow-hidden shadow border border-gray-200">
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
                  <p className="text-sm text-gray-500 mt-2">
                    Click on the map to select a location.
                  </p>
                </div>

                {/* Section: Goals */}
                <div>
                  <h2 className="text-lg font-semibold text-[#19398a] mb-2">
                    Campaign Goals
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="targetFunds">Target Funds (₹)</Label>
                      <Input
                        id="targetFunds"
                        type="number"
                        name="targetFunds"
                        value={formData.targetFunds}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetVolunteers">Target Volunteers</Label>
                      <Input
                        id="targetVolunteers"
                        type="number"
                        name="targetVolunteers"
                        value={formData.targetVolunteers}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

            {/* Section: Banner */}
            <div>
              <h2 className="text-lg font-semibold text-[#19398a] mb-2">
                Banner Image
              </h2>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#19398a] transition">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Upload Campaign Poster
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="banner"
                />
                <label
                  htmlFor="banner"
                  className="px-4 py-2 bg-[#19398a] text-white text-sm rounded-lg cursor-pointer hover:bg-[#2e58c2] transition"
                >
                  Choose File
                </label>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mt-3 w-50 h-30 object-cover rounded-md border"
                  />
                )}
              </div>
            </div>
            {formData.category === "fundraising" && (
              <div className="space-y-2">
                <Label htmlFor="razorpayQR">Razorpay QR (optional)</Label>
                <Input
                  id="razorpayQR"
                  type="text"
                  name="razorpayQR"
                  value={formData.razorpayQR}
                  onChange={handleChange}
                  placeholder="Paste Razorpay QR URL here"
                />
              </div>
            )}


                {/* Buttons */}
                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        title: "",
                        description: "",
                        category: "",
                        startDate: "",
                        endDate: "",
                        address: "",
                        location_coordinates: "",
                        targetFunds: "",
                        targetVolunteers: "",
                      })
                    }
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#19398a] hover:bg-[#142a66] text-white"
                  >
                    {loading
                      ? mode === "create"
                        ? "Creating..."
                        : "Updating..."
                      : mode === "create"
                        ? "Create Campaign"
                        : "Update Campaign"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </>
  );
};

export default CampaignCreatePage;
