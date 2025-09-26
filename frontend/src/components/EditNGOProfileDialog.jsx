import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import { BaseURL } from "../BaseURL";
import NGOForm from "./NGOForm";

const EditNGOProfileDialog = ({ isOpen, setIsOpen, ngoData, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    registration_number: "",
    city: "",
    state: "",
    address: "",
    description: "",
    location_coordinates: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [verificationDocs, setVerificationDocs] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  
  // Prefill form when ngoData changes
  // Prefill form when ngoData changes
  useEffect(() => {
    if (ngoData) {
      // avoid mutating ngoData directly
      const coords = Array.isArray(ngoData.location_coordinates)
        ? ngoData.location_coordinates.join(",")
        : ngoData.location_coordinates;

      setFormData({
        name: ngoData.name || "",
        email: ngoData.email || "",
        phone: ngoData.phone || "",
        registration_number: ngoData.registration_number || "",
        city: ngoData.city || "",
        state: ngoData.state || "",
        address: ngoData.address || "",
        description: ngoData.description || "",
        location_coordinates: coords || "",
      });
    }
  }, [ngoData]); // ✅ only re-run if ngoData changes

  // ✅ Submit handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (profileImage) data.append("profile_image", profileImage);
      verificationDocs.forEach((doc) => data.append("documents", doc));
      galleryImages.forEach((img) => data.append("gallery", img));

      const res = await axios.put(`${BaseURL}/api/v1/ngo/${ngoData._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("NGO profile updated successfully!");
      setIsOpen(false);

      if (onSuccess) onSuccess(res.data.ngo);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update NGO profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-[4000]">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {/* Centered container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <Dialog.Panel
            className="
              w-full max-w-3xl 
              max-h-[90vh] overflow-y-auto
              bg-white rounded-xl shadow-lg
              p-6
            "
          >
            <Dialog.Title className="text-lg font-bold text-gray-800">
              Edit NGO Profile
            </Dialog.Title>

            {/* NGOForm */}
            <NGOForm
              formData={formData}
              setFormData={setFormData}
              setProfileImage={setProfileImage}
              loading={loading}
              message={message}
              verificationDocs={verificationDocs}
              setVerificationDocs={setVerificationDocs}
              galleryImages={galleryImages}
              setGalleryImages={setGalleryImages}
              handleSubmit={handleUpdate}
              registering={false}
            />

            {/* Footer */}
            <div className="flex justify-end mt-3 w-full">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#ffd600] font-semibold rounded-lg hover:bg-yellow-300 py-2 transition"
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default EditNGOProfileDialog;
