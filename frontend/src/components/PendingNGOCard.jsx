import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../BaseURL";

const PendingNGOCard = ({ ngo, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BaseURL}/api/v1/ngo/${ngo._id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Notify parent to remove this NGO from the pending list
      onStatusChange(ngo._id, status);
    } catch (err) {
      console.error("Error updating NGO status:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition p-4 flex flex-col justify-between">
      <div>
        <img
          src={ngo.logo || "https://via.placeholder.com/120"}
          alt={ngo.name}
          className="w-full h-36 object-cover rounded-lg mb-3"
        />
        <h2 className="text-lg font-bold text-gray-800">{ngo.name}</h2>
        <p className="text-sm text-gray-600 mt-1">{ngo.email}</p>
        <p className="text-sm text-gray-600 mt-1">
          {ngo.city}, {ngo.state}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => navigate(`/ngo/${ngo._id}`)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow"
        >
          View Profile
        </button>

        <div className="flex space-x-2">
          <button
            disabled={updating}
            onClick={() => handleStatusUpdate("approved")}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow"
          >
            Approve
          </button>
          <button
            disabled={updating}
            onClick={() => handleStatusUpdate("rejected")}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingNGOCard;
