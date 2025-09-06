import React from "react";
import Navbar from "../components/Navbar";

// Feature data
const features = [
  {
    icon: "📦",
    title: "Donate & Schedule Pickups",
    desc: "Donate essentials and schedule pickups easily.",
  },
  {
    icon: "✋",
    title: "Request for Help",
    desc: "Report urgent needs for vulnerable individuals.",
  },
  {
    icon: "📣",
    title: "NGO Campaigns & Fundraising",
    desc: "Support ongoing campaigns and current projects.",
  },
  {
    icon: "📊",
    title: "Impact Reporting",
    desc: "Track donations and contributions transparently.",
  },
];

// Campaign data
const campaigns = [
  {
    img: "/src/assets/food-drive.jpg",
    title: "Food Drive",
    desc: "Collecting donations for a local food bank.",
  },
  {
    img: "/src/assets/emergency.jpg",
    title: "Emergency Response",
    desc: "Providing immediate assistance for flood victims.",
  },
  {
    img: "/src/assets/clothes.jpg",
    title: "Clothes Donation",
    desc: "Collecting garments for homeless shelters.",
  },
];

// Impact stats
const stats = [
  { label: "Meals Donated", value: "50K+" },
  { label: "NGOs Registered", value: "1K+" },
  { label: "Volunteers Active", value: "5K+" },
  { label: "Lives Impacted", value: "200K+" },
];

const Home = () => (
  <div style={{ fontFamily: "sans-serif", background: "#f7f9fb" }}>
    <Navbar />

    {/* Hero Section */}
    <section
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1200,
        margin: "0 auto",
        padding: "3rem 1rem",
        gap: "2rem",
      }}
    >
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          Connecting Donors, NGOs & Volunteers to Make a Difference
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#222",
            marginBottom: "2rem",
            lineHeight: 1.5,
          }}
        >
          Donate essentials, request help, or support campaigns – all in one
          place
        </p>
        <div>
          <button
            style={{
              marginRight: 16,
              padding: "0.9rem 2rem",
              background: "#ffd600",
              color: "#222",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1.05rem",
              cursor: "pointer",
            }}
          >
            Donate Now
          </button>
          <button
            style={{
              padding: "0.9rem 2rem",
              background: "#fff",
              border: "2px solid #2260ff",
              color: "#2260ff",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1.05rem",
              cursor: "pointer",
            }}
          >
            Request Assistance
          </button>
        </div>
      </div>
      <img
        src="/src/assets/hero-family.png"
        alt="Family donating"
        style={{ flex: 1, maxWidth: 400 }}
      />
    </section>

    {/* Features */}
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "2rem" }}>
        Key Features
      </h2>
      <div
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
              boxShadow: "0 2px 8px #0001",
              padding: "2rem",
              width: 240,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>
              {feat.icon}
            </div>
            <h3 style={{ fontSize: "1.15rem", marginBottom: 8 }}>
              {feat.title}
            </h3>
            <p style={{ color: "#444", fontSize: "1rem" }}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Live Campaigns */}
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "2rem" }}>
        Live Campaigns
      </h2>
      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {campaigns.map((c, idx) => (
          <div
            key={idx}
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px #0001",
              width: 280,
              overflow: "hidden",
            }}
          >
            <img
              src={c.img}
              alt={c.title}
              style={{ height: 160, width: "100%", objectFit: "cover" }}
            />
            <div style={{ padding: "1.2rem" }}>
              <h4 style={{ fontWeight: 600 }}>{c.title}</h4>
              <p
                style={{
                  color: "#444",
                  fontSize: "1rem",
                  marginTop: 8,
                  lineHeight: 1.4,
                }}
              >
                {c.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Impact Stats */}
    <section
      style={{
        background: "#eef4ff",
        padding: "2.5rem 1rem 1.5rem",
        margin: "2rem 0 0 0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 60,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {stats.map((stat, idx) => (
          <div key={idx}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "2rem",
                color: "#2260ff",
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
          background: "#2260ff",
          color: "#fff",
          padding: "1rem 2rem",
          border: "none",
          borderRadius: "30px",
          fontWeight: "bold",
          fontSize: "1.15rem",
          cursor: "pointer",
        }}
      >
        Support Our Work
      </button>
    </section>
  </div>
);

export default Home;
