import React, { useState, useEffect } from "react";
import CampaignCard from "@/components/CampaignCard";
import CampaignDialog from "@/components/CampaignsDialog";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { BaseURL } from "@/BaseURL";
import Navbar from "@/components/Navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BaseURL}/api/v1/campaign`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setCampaigns(response.data);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch campaigns:", e);
      setError("Failed to load campaigns. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCampaigns();
  }, []); // Only run once


  // In Campaigns.jsx
  const handleRegister = (campaignId, updatedCampaign) => {
    setCampaigns((prevCampaigns) =>
      prevCampaigns.map((c) =>
        c._id === campaignId ? { ...c, ...updatedCampaign } : c
      )
    );
    fetchCampaigns();
  };


  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      category === "All" || campaign.category === category;
    const matchesStatus = status === "All" || campaign.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <>
    <Navbar/>
    <div className="bg-amber-50 min-h-screen">
      {/* Hero Section */}
      <div className="px-4 md:px-12 py-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#19398a]">
          Discover Campaigns & Drives
        </h1>
        <p className="mt-3 text-gray-700 md:text-lg max-w-2xl mx-auto">
          Browse and participate in charity initiatives to make a difference in your community.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-12 mb-8">
        {/* Search */}
        <div className="relative flex-1 md:max-w-md w-full">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1 text-lg text-[#19398a] rounded-lg border-2 border-[#19398a] shadow-sm transition"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg text-[#19398a]" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 md:gap-4 md:w-auto">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-36 z-50 border-[#19398a] text-[#19398a] font-semibold">
              <SelectValue placeholder="All Categories" className="bg-white hover:bg-amber-50" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white">
              <SelectItem value="All" className="bg-white hover:bg-amber-50">All Categories</SelectItem>
              <SelectItem value="fundraising" className="bg-white hover:bg-amber-50">Fundraising</SelectItem>
              <SelectItem value="food_drive" className="bg-white hover:bg-amber-50">Food Drive</SelectItem>
              <SelectItem value="blood_donation" className="bg-white hover:bg-amber-50">Blood Donation</SelectItem>
              <SelectItem value="medical_camp" className="bg-white hover:bg-amber-50">Medical Camp</SelectItem>
              <SelectItem value="awareness" className="bg-white hover:bg-amber-50">Awareness</SelectItem>
              <SelectItem value="others" className="bg-white hover:bg-amber-50">Others</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-30 z-50 border-[#19398a] text-[#19398a] font-semibold">
              <SelectValue placeholder="All Status" className="bg-white hover:bg-amber-50"/>
            </SelectTrigger>
            <SelectContent className="z-50 bg-white">
              <SelectItem value="All" className="bg-white hover:bg-amber-50">All Status</SelectItem>
              <SelectItem value="upcoming" className="bg-white hover:bg-amber-50">Upcoming</SelectItem>
              <SelectItem value="ongoing" className="bg-white hover:bg-amber-50">Ongoing</SelectItem>
              <SelectItem value="completed" className="bg-white hover:bg-amber-50">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="px-4 md:px-12 pb-12">
        {isLoading && <p className="text-center text-gray-500">Loading campaigns...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!isLoading && !error && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign._id}
                  campaign={campaign}
                  onClick={setSelectedCampaign}
                />
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">
                No campaigns found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Campaign Dialog */}
      {selectedCampaign && (
        <CampaignDialog
          campaign={selectedCampaign}
          onRegister={()=>handleRegister()}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
    </>
  );
};

export default Campaigns;
