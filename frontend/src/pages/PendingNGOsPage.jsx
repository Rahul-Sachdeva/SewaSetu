import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { BaseURL } from "../BaseURL";
import PendingNGOCard from "../components/PendingNGOCard";

const PendingNGOsPage = () => {
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingNGOs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BaseURL}/api/v1/ngo/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingNGOs(res.data);
    } catch (err) {
      console.error("Error fetching pending NGOs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingNGOs();
  }, []);

  const handleStatusChange = (ngoId, status) => {
    setPendingNGOs((prev) =>
      prev.filter((ngo) => ngo._id !== ngoId)
    );
  };

  if (loading)
    return <p className="text-center mt-10 text-lg text-gray-700">Loading pending NGOs...</p>;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pending NGO Approvals</h1>
        {pendingNGOs.length === 0 ? (
          <p className="text-gray-600">No pending NGOs at the moment.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingNGOs.map((ngo) => (
              <PendingNGOCard
                key={ngo._id}
                ngo={ngo}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PendingNGOsPage;
