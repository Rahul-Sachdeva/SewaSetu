// src/pages/DonationsManagement.jsx
import { useState, useEffect } from "react";
import api from "../services/api";

export default function DonationsManagement() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await api.get("/donations");
      setDonations(res.data);
    } catch (err) {
      console.error("Error fetching donations:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/donations/${id}`, { status });
      // Update UI immediately without full reload
      setDonations((prev) =>
        prev.map((d) =>
          d._id === id ? { ...d, status } : d
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <p className="text-center">Loading donations...</p>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Donations Management</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg font-semibold text-center">
          Total: {donations.length}
        </div>
        <div className="bg-gray-100 p-4 rounded-lg font-semibold text-center">
          Pending: {donations.filter((d) => d.status?.toLowerCase() === "pending").length}
        </div>
        <div className="bg-gray-100 p-4 rounded-lg font-semibold text-center">
          Accepted: {donations.filter((d) => d.status?.toLowerCase() === "accepted").length}
        </div>
      </div>

      {/* Donations Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold">Donor</th>
              <th className="px-4 py-3 font-semibold">Item Type</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Quantity</th>
              <th className="px-4 py-3 font-semibold">Pickup Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No donations yet.
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation._id} className="border-t">
                  <td className="px-4 py-3">{donation.name || "Anonymous"}</td>
                  <td className="px-4 py-3">{donation.type}</td>
                  <td className="px-4 py-3">{donation.description || "—"}</td>
                  <td className="px-4 py-3">{donation.quantity}</td>
                  <td className="px-4 py-3">{donation.pickupDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-white font-medium text-sm min-w-[90px] text-center
                        ${donation.status?.toLowerCase() === "pending"
                          ? "bg-yellow-500"
                          : donation.status?.toLowerCase() === "accepted"
                          ? "bg-blue-500"
                          : donation.status?.toLowerCase() === "picked"
                          ? "bg-green-500"
                          : donation.status?.toLowerCase() === "rejected"
                          ? "bg-red-500"
                          : "bg-gray-400"
                        }`}
                    >
                      {donation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {donation.status?.toLowerCase() === "pending" && (
                        <>
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition min-w-[80px]"
                            onClick={() => updateStatus(donation._id, "Accepted")}
                          >
                            Accept
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition min-w-[80px]"
                            onClick={() => updateStatus(donation._id, "Rejected")}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {donation.status?.toLowerCase() === "accepted" && (
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition min-w-[110px]"
                          onClick={() => updateStatus(donation._id, "Picked")}
                        >
                          Mark Picked
                        </button>
                      )}
                      {donation.status?.toLowerCase() === "rejected" && (
                        <span className="px-4 py-2 bg-red-500 text-white rounded-md min-w-[90px] text-center">
                          Rejected
                        </span>
                      )}
                      {donation.status?.toLowerCase() === "picked" && (
                        <span className="px-4 py-2 bg-green-500 text-white rounded-md min-w-[90px] text-center">
                          Picked
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
