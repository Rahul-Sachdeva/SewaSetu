import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseURL } from "@/BaseURL";
import NGOCard from "@/components/NGOCard";
import { Input } from "@/components/ui/input";

const NGOListPage = () => {
  const [ngos, setNgos] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

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
  }, []);

  useEffect(() => {
    const result = ngos.filter((n) =>
      n.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, ngos]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <Input
        placeholder="Search NGOs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-2xl bg-white"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length ? (
          filtered.map((ngo) => <NGOCard key={ngo._id} ngo={ngo} />)
        ) : (
          <p className="text-center text-gray-500 col-span-full">No NGOs found</p>
        )}
      </div>
    </div>
  );
};

export default NGOListPage;
