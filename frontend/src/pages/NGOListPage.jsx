import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "@/BaseURL";
import NGOCard from "@/components/NGOCard";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { useAuth } from "../context/AuthContext";

const NGOListPage = () => {
  const [ngos, setNgos] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
    const { user } = useAuth();
  
  // Filter states (example: city and verification)
  const [cityFilter, setCityFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const res = await axios.get(`${BaseURL}/api/v1/ngo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNgos(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Failed to fetch NGOs", err);
      }
    };

    fetchNGOs();
  }, [token]);

  useEffect(() => {
    let result = ngos;

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((n) => n.name.toLowerCase().includes(searchLower));
    }

    // Apply city filter if selected
    if (cityFilter) {
      result = result.filter((n) => n.city === cityFilter);
    }

    // Apply verification filter if selected
    if (verificationFilter) {
      result = result.filter((n) => n.verification_status === verificationFilter);
    }

    setFiltered(result);
  }, [search, cityFilter, verificationFilter, ngos]);

  // Extract unique cities and verification statuses for filter dropdowns
  const uniqueCities = Array.from(new Set(ngos.map((n) => n.city))).filter(Boolean);
  const uniqueVerificationStatuses = Array.from(
    new Set(ngos.map((n) => n.verification_status))
  ).filter(Boolean);

  return (
    <>
      {user && user.role !== "ngo" && <Navbar />}

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <Input
          placeholder="Search NGOs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-2xl bg-white"
        />

        {/* Filters Section */}
        <div className="flex flex-wrap gap-4">
          <select
            className="rounded-xl border-gray-300 p-2"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border-gray-300 p-2"
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
          >
            <option value="">All Verification Status</option>
            {uniqueVerificationStatuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch("");
              setCityFilter("");
              setVerificationFilter("");
            }}
            className="bg-orange-500 text-white px-2 py-1 rounded-xl"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length ? (
            filtered.map((ngo) => <NGOCard key={ngo._id} ngo={ngo} />)
          ) : (
            <p className="text-center text-gray-500 col-span-full">No NGOs found</p>
          )}
        </div>
      </div>
    </>
  );
};

export default NGOListPage;
