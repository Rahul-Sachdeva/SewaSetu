import { useState } from "react";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import { BaseURL } from "../BaseURL";
import UserForm from "./UserForm";
import { useNavigate } from "react-router-dom";

const EditProfileDialog = ({ isEditOpen, setIsEditOpen, onProfileUpdated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    about: "",
    city: "",
    state: "",
    address: "",
    password: "",
    location_coordinates: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Submit handler for update
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
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      const res = await axios.put(`${BaseURL}/api/v1/user/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Profile updated successfully!");
      setIsEditOpen(false);

      if (onProfileUpdated) {
        onProfileUpdated(res.data.user); // callback to refresh profile in parent
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isEditOpen}
      onClose={() => setIsEditOpen(false)}
      className="relative z-[200]"
    >
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {/* Centered container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
        <Dialog.Panel
            className="
                w-full max-w-2xl 
                max-h-[90vh] overflow-y-auto
                bg-white rounded-xl shadow-lg
                p-6
            "
            >
            <Dialog.Title className="text-lg font-bold text-gray-800">
                Edit Profile
            </Dialog.Title>

            <UserForm
                formData={formData}
                setFormData={setFormData}
                setProfileImage={setProfileImage}
                loading={loading}
                message={message}
                handleSubmit={handleUpdate}
                registering={false}
            />

            <div className="flex justify-end mt-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
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

export default EditProfileDialog;
