// src/pages/ngo/CampaignRegistrationsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BaseURL } from "@/BaseURL";
import axios from "axios";

const CampaignRegistrationsPage = () => {
  const { id } = useParams(); // campaign ID
  const token = localStorage.getItem("token");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await axios.get(`${BaseURL}/api/v1/campaign/${id}/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRegistrations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="px-4 md:px-12 py-8">
      <h1 className="text-2xl font-bold mb-6">Campaign Registrations</h1>
      {registrations.length === 0 ? (
        <p className="text-gray-600">No users have registered yet.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#19398a] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {registrations.map((reg) => (
                <tr key={reg._id}>
                  <td className="px-6 py-4 text-sm">{reg.user?.name}</td>
                  <td className="px-6 py-4 text-sm">{reg.user?.email}</td>
                  <td className="px-6 py-4 text-sm capitalize">{reg.role}</td>
                  <td className="px-6 py-4 text-sm">{reg.status}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(reg.registeredAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignRegistrationsPage;
