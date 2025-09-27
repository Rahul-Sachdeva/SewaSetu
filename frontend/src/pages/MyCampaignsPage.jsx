import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { BaseURL } from "@/BaseURL";
import CampaignCard from "@/components/CampaignCard";
import CampaignDialog from "@/components/CampaignsDialog";

const MyCampaignsPage = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    if (!user?.ngo) return;
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(
          `${BaseURL}/api/v1/campaign/ngo/${user.ngo}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCampaigns(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [user, token]);

  const handleDelete = (id) => {
    setCampaigns((prev) => prev.filter((c) => c._id !== id));
    setSelectedCampaign(null); // close dialog if deleted
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="px-4 md:px-12 py-8">
      <h1 className="text-2xl font-bold mb-6">My Campaigns</h1>
      {campaigns.length === 0 ? (
        <p className="text-gray-600">You haven’t created any campaigns yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign._id}
              campaign={campaign}
              isOwner={true}
              onClick={setSelectedCampaign} // ✅ open dialog
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ✅ Campaign Dialog */}
      {selectedCampaign && (
        <CampaignDialog
          campaign={selectedCampaign}
          isOwner={true} // so NGO sees edit/delete options inside dialog
          onDelete={handleDelete}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
};

export default MyCampaignsPage;
