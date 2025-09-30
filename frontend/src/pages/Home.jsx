import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../BaseURL";
import CampaignCard from "../components/CampaignCard";
import CampaignDialog from "../components/CampaignsDialog";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    img: "/src/assets/donate.png",
    title: "Donate & Schedule Pickups",
    desc: "Easily donate essentials and schedule pickups for convenience.",
  },
  {
    img: "/src/assets/help.png",
    title: "Request for Help",
    desc: "Report urgent needs for vulnerable individuals in your community.",
  },
  {
    img: "/src/assets/ngo.png",
    title: "NGO Campaigns & Fundraising",
    desc: "Support ongoing campaigns and fundraising projects transparently.",
  },
  {
    img: "/src/assets/volunteer.png",
    title: "Volunteer Opportunities",
    desc: "Participate in local volunteer programs and community events organized by NGOs.",
  },
  {
    img: "/src/assets/impact.png",
    title: "Impact Reporting",
    desc: "Track donations and contributions with full transparency.",
  },
];

const stats = [
  { label: "Meals Donated", value: "50K+" },
  { label: "NGOs Registered", value: "1K+" },
  { label: "Volunteers Active", value: "5K+" },
  { label: "Lives Impacted", value: "200K+" },
];

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(`${BaseURL}/api/v1/campaign`);
        setCampaigns(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
        setError("Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Open dialog with selected campaign details
  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
  };

  // Update campaigns list after registration
  const handleRegister = (campaignId, updatedData) => {
    setCampaigns((prev) =>
      prev.map((c) => (c._id === campaignId ? { ...c, ...updatedData } : c))
    );
  };

  // Close dialog
  const closeDialog = () => {
    setSelectedCampaign(null);
  };

  const previewCampaigns = campaigns.slice(0, 3);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#fff" }}>
      <Navbar />

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "2rem 2rem",
          gap: "1rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "2.8rem",
              fontWeight: "700",
              marginBottom: "1rem",
              color: "#111",
            }}
          >
            Connecting Donors, NGOs & Volunteers to Make a Difference
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "#333",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}
          >
            Donate essentials, request help, or support campaigns – all in one place.
          </p>
          <div>
            {user && user.role === "ngo" ? (
              // NGO-specific CTA
              <>
                <Link to="/dashboard">
                  <button
                    style={{
                      marginRight: 16,
                      padding: "1rem 1rem",
                      background: "#FFD600",
                      color: "#111",
                      border: "2px solid #f1ca56ff",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "1.05rem",
                      cursor: "pointer",
                    }}
                  >
                    Go to NGO Dashboard
                  </button>
                </Link>
                <Link to="/campaigns">
                  <button
                    style={{
                      padding: "1rem 1rem",
                      background: "#fff",
                      border: "2px solid #19398aff",
                      color: "#19398aff",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "1.05rem",
                      cursor: "pointer",
                    }}
                  >
                    View Campaigns
                  </button>
                </Link>
              </>
            ) : (
              // User/General CTA
              <>
                <Link to="/donate">
                  <button
                    style={{
                      marginRight: 16,
                      padding: "1rem 2rem",
                      background: "#FFD600",
                      color: "#111",
                      border: "2px solid #f1ca56ff",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "1.05rem",
                      cursor: "pointer",
                    }}
                  >
                    Donate Now
                  </button>
                </Link>
                <Link to="/request">
                  <button
                    style={{
                      padding: "1rem 2rem",
                      background: "#fff",
                      border: "2px solid #19398aff",
                      color: "#19398aff",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "1.05rem",
                      cursor: "pointer",
                    }}
                  >
                    Request Assistance
                  </button>
                </Link>
              </>
            )}
          </div>

        </div>
        <img
          src="/src/assets/hero-family.jpeg"
          alt="Family donating"
          style={{
            flex: 1,
            maxWidth: 610,
          }}
        />
      </section>

      {/* Features Section */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 2.5rem" }}>
        <h2
          style={{
            fontSize: "2rem",
            textAlign: "center",
            marginBottom: "2rem",
            fontWeight: "700",
            color: "black",
          }}
        >
          Key Features
        </h2>
        <div
          className="features-container"
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {features.map((feat, idx) => (
            <div
              key={idx}
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px #0002",
                padding: "2rem",
                width: 250,
                alignContent: "center",
                textAlign: "center",
              }}
            >
              <img
                src={feat.img}
                alt={feat.title}
                style={{ width: 125, height: 120, marginBottom: 20, marginLeft: 30 }}
              />
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: 2,
                  fontWeight: "600",
                  color: "black",
                }}
              >
                {feat.title}
              </h3>
              <p style={{ color: "#555", fontSize: "0.95rem" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Campaigns Section */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem 0rem" }}>
        <h2
          style={{
            fontSize: "2rem",
            textAlign: "center",
            marginBottom: "2rem",
            fontWeight: "700",
            color: "black",
          }}
        >
          Live Campaigns
        </h2>

        {loading && <p style={{ textAlign: "center" }}>Loading campaigns...</p>}
        {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            <div
              className="campaigns-container"
              style={{
                display: "flex",
                gap: 20,
                justifyContent: "center",
                flexWrap: "nowrap",  // Change from "wrap" to "nowrap"
                overflowX: "auto",   // Optional: horizontal scroll if needed
              }}
            >
              {previewCampaigns.length > 0 ? (
                previewCampaigns.map((c) => (
                  <CampaignCard key={c._id} campaign={c} onClick={handleCampaignClick} />
                ))
              ) : (
                <p>No live campaigns available.</p>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Link to="/campaigns">
                <button
                  style={{
                    background: "#19398aff",
                    color: "#fff",
                    padding: "0.75rem 1.5rem",
                    fontWeight: "bold",
                    borderRadius: "30px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                    boxShadow: "0 4px 10px rgba(25, 57, 138, 0.5)",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112d77")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#19398aff")}
                >
                  View All Campaigns
                </button>
              </Link>
            </div>
          </>
        )}

        {/* Campaign Dialog for details and registration */}
        {selectedCampaign && (
          <CampaignDialog
            campaign={selectedCampaign}
            onClose={closeDialog}
            onRegister={handleRegister}
          />
        )}
      </section>

      {/* Impact Stats Section */}
      <section
        style={{
          background: "#f5f8ff",
          padding: "3rem 1rem 2rem",
          margin: "2rem 0 0 0",
          textAlign: "center",
        }}
      >
        <div
          className="stats-container"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 60,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "2rem",
                  color: "#19398aff",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "1rem", color: "#222" }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <button
          style={{
            background: "#19398aff",
            color: "#fff",
            padding: "1rem 2rem",
            border: "none",
            borderRadius: "30px",
            fontWeight: "bold",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          Support Our Work
        </button>
      </section>
    </div>
  );
};

export default Home;
