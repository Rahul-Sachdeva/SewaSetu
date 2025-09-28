import React, { useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import { Pencil } from "lucide-react";
import axios from "axios";
import { BaseURL } from "../BaseURL";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import Slider from "react-slick"; // Carousel library
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import EditNGOProfileDialog from "../components/EditNGOProfileDialog";
import { useParams } from "react-router-dom";

const NGOProfile = ({ mode = "profile" }) => {
  const { user } = useAuth();
  const { ngoId } = useParams(); // Used in visit mode
  const [ngo, setNgo] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isVisitor = mode === "visit";
  const token = localStorage.getItem("token");

  // Sample Stats (replace with backend)
  const stats = [
    { label: "Campaigns Run", value: 12, icon: "📢" },
    { label: "Donations Received", value: 340, icon: "💰" },
    { label: "Volunteers Engaged", value: 120, icon: "🤝" },
  ];

  // Sample Data (replace with backend calls if needed)
  const contributions = [
    { donor: "John Doe", amount: "$100", date: "Sep 5, 2025" },
    { donor: "Jane Smith", amount: "$250", date: "Sep 2, 2025" },
    { donor: "Michael Lee", amount: "$75", date: "Aug 29, 2025" },
  ];

  const members = [
    { name: "Alice Johnson", role: "Founder", img: "https://randomuser.me/api/portraits/women/65.jpg" },
    { name: "David Kim", role: "Coordinator", img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Sara Patel", role: "Volunteer Lead", img: "https://randomuser.me/api/portraits/women/44.jpg" },
  ];

  // Check if user is following this NGO
  const checkFollowing = async (ngoIdToCheck) => {
    try {
      const res = await axios.get(`${BaseURL}/api/v1/user/following/${ngoIdToCheck}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  // Follow / Unfollow toggle
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await axios.post(
          `${BaseURL}/api/v1/user/unfollow/${ngo._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${BaseURL}/api/v1/user/follow/${ngo._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch NGO details
  const fetchNGO = async () => {
    try {
      const idToFetch = isVisitor ? ngoId : user.ngo;
      const res = await axios.get(`${BaseURL}/api/v1/ngo/${idToFetch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNgo(res.data);

      if (isVisitor) checkFollowing(res.data._id);
    } catch (err) {
      console.error("Failed to fetch NGO profile", err);
    }
  };

  useEffect(() => {
    if (user || ngoId) {
      fetchNGO();
    }
  }, [ngoId, user]);

  if (!ngo)
    return (
      <p className="text-center font-bold text-2xl text-[#19398a] mt-10">
        Loading NGO profile...
      </p>
    );

  // Carousel settings
  const gallerySettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
  };

  return (
    <>
      

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-[#19398a] via-[#345ec9] to-[#19398a] text-white py-7 px-6 lg:px-20 rounded-b-3xl shadow-lg">
        <div className="flex items-center space-x-4">
          <img
            src={ngo.logo || "https://via.placeholder.com/120"}
            alt="NGO Logo"
            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold">{ngo.name}</h1>
            <p className="text-sm italic text-gray-200">
              {ngo.tagline || `"Empowering lives, changing futures."`}
            </p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${ngo.verification_status === "verified"
                  ? "bg-green-500"
                  : ngo.verification_status === "pending"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                } text-white`}
            >
              {ngo.verification_status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Conditional buttons */}
        {isVisitor ? (
          <button
            onClick={handleFollowToggle}
            className="absolute top-6 right-6 flex items-center px-4 py-2 bg-[#19398a] text-white text-sm font-medium rounded-lg hover:bg-[#2e58c2] shadow"
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        ) : (
          <button
            onClick={() => setIsEditOpen(true)}
            className="absolute top-6 right-6 flex items-center px-4 py-2 bg-white text-[#19398a] text-sm font-medium rounded-lg hover:bg-gray-200 shadow"
          >
            <Pencil className="w-4 h-4 mr-2" /> Edit NGO Profile
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="bg-white shadow-md rounded-xl p-5 space-y-3 lg:sticky lg:top-24 self-start flex flex-col justify-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">NGO Details</h3>
            <p><span className="font-semibold">Registration No:</span> {ngo.registration_number}</p>
            <p><span className="font-semibold">Email:</span> {ngo.email}</p>
            <p><span className="font-semibold">Phone:</span> {ngo.phone}</p>
            <p><span className="font-semibold">City:</span> {ngo.city}</p>
            <p><span className="font-semibold">State:</span> {ngo.state}</p>
            <p><span className="font-semibold">Address:</span> {ngo.address}</p>

            {/* Category Section */}
            <div className="mt-3">
              <span className="font-semibold">Categories:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {ngo.category && ngo.category.length > 0 ? (
                  ngo.category.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No categories specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Map Embed */}
          <div>
            <iframe
              title="NGO Location"
              className="w-full h-36 rounded-lg border"
              src={`https://www.google.com/maps?q=${ngo.latitude || 28.6139},${ngo.longitude || 77.2090}&hl=es;z=14&output=embed`}
            ></iframe>
          </div>
        </div>


        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tabs Section */}
          <Tab.Group>
            <Tab.List className="flex space-x-4 border-b max-w-full overflow-auto">
              {["About", "Campaigns", "Gallery", "Contributions", "Members"].map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    `px-4 py-2 text-sm font-semibold border-b-2 ${selected
                      ? "border-[#19398a] text-[#19398a]"
                      : "border-transparent text-gray-500 hover:text-[#19398a]"
                    }`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels className="mt-4">
              {/* About */}
              <Tab.Panel>
                <div className="bg-[#f9fafb] rounded-xl shadow-md p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">About Us</h3>
                  <p className="text-gray-600 text-sm">
                    {ngo.description ||
                      "This NGO is committed to driving social change and community development."}
                  </p>

                  {/* Documents */}
                  <h4 className="mt-4 font-semibold text-gray-700">Documents</h4>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {ngo.documents?.length > 0 ? (
                      ngo.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#19398a] text-white rounded-md text-sm hover:bg-[#2e58c2] shadow"
                        >
                          📄 Document {idx + 1}
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No documents uploaded</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {stats.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center rounded-xl p-4 shadow-md bg-gradient-to-tr from-[#19398a0d] to-[#ffd6000d]"
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-xl font-bold mt-1 text-[#19398a]">{s.value}</span>
                      <span className="text-xs text-gray-600">{s.label}</span>
                    </div>
                  ))}
                </div>
              </Tab.Panel>

              {/* Campaigns */}
              <Tab.Panel>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ngo.campaigns?.length > 0 ? (
                    ngo.campaigns.map((c, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                      >
                        <img src={c.image} alt={c.title} className="h-40 w-full object-cover" />
                        <div className="p-4">
                          <h4 className="font-bold text-[#19398a]">{c.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                          <button className="mt-3 px-3 py-1 text-sm bg-[#19398a] text-white rounded-md hover:bg-[#2e58c2]">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No campaigns available</p>
                  )}
                </div>
              </Tab.Panel>

              {/* Gallery */}
              <Tab.Panel>
                {ngo.gallery?.length > 0 ? (
                  <Slider {...gallerySettings}>
                    {ngo.gallery.map((img, idx) => (
                      <div key={idx} className="px-2">
                        <img
                          src={img}
                          alt={`NGO gallery ${idx}`}
                          className="rounded-lg object-cover w-full h-60 shadow"
                        />
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <p className="text-sm text-gray-500">No gallery images uploaded</p>
                )}
              </Tab.Panel>

              {/* Contributions */}
              <Tab.Panel>
                <div className="bg-white rounded-xl shadow-md p-4">
                  <h3 className="font-bold text-lg text-[#19398a] mb-3">Recent Contributions</h3>
                  <ul className="divide-y">
                    {contributions.map((c, idx) => (
                      <li key={idx} className="py-2 flex justify-between text-sm">
                        <span>{c.donor}</span>
                        <span className="font-semibold">{c.amount}</span>
                        <span className="text-gray-500">{c.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Tab.Panel>

              {/* Members */}
              <Tab.Panel>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl shadow-md flex flex-col items-center p-4 hover:shadow-lg transition"
                    >
                      <img
                        src={m.img}
                        alt={m.name}
                        className="w-20 h-20 rounded-full object-cover shadow mb-3"
                      />
                      <h4 className="font-bold text-[#19398a]">{m.name}</h4>
                      <p className="text-sm text-gray-600">{m.role}</p>
                    </div>
                  ))}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {!isVisitor && (
        <EditNGOProfileDialog
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          ngoData={ngo}
          onSuccess={fetchNGO}
        />
      )}
    </>
  );
};

export default NGOProfile;
