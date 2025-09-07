import React from "react";
import Navbar from "../components/Navbar";

// Feature data with icons (replace with SVGs if available)
const features = [
  {
    img: "/src/assets/donate.png",
    title: "Donate & Schedule Pickups",
    desc: "Easily donate essentials and schedule pickups for convenience.",
  },
  {
    icon: "🖐️",
    title: "Request for Help",
    desc: "Report urgent needs for vulnerable individuals in your community.",
  },
  {
    icon: "📢",
    title: "NGO Campaigns & Fundraising",
    desc: "Support ongoing campaigns and fundraising projects transparently.",
  },
  {
    icon: "📈",
    title: "Impact Reporting",
    desc: "Track donations and contributions with full transparency.",
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
  <div style={{ fontFamily: "Arial, sans-serif", background: "#fff" }}>
    <Navbar />

    {/* Hero Section */}
    <section
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
          Donate essentials, request help, or support campaigns – all in one
          place.
        </p>
        <div>
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
          <button
            style={{
              padding: "1rem 2rem",
              background: "#fff",
              border: "2px solid #2260ff",
              color: "#2260ff",
              borderRadius: "8px",
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
        src="/src/assets/hero-family.jpeg"
        alt="Family donating"
        style={{
          flex: 1,
          maxWidth: 610,
          WebkitMaskImage: `
    linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%),
    linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%),
    linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%)
  `,
          WebkitMaskComposite: 'source-in',
          maskImage: `
    linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%),
    linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%),
    linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%)
  `,
          maskComposite: 'intersect'
        }}


      />
    </section>

    {/* Features */}
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2
        style={{
          fontSize: "2rem",
          textAlign: "center",
          marginBottom: "2rem",
          fontWeight: "700",
        }}
      >
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
              boxShadow: "0 2px 8px #0002",
              padding: "2rem",
              width: 250,
              textAlign: "center",
            }}
          >

            <img src={feat.img} alt={feat.title} style={{ width: 150, height: 100 }} />

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

    {/* Live Campaigns */}
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2
        style={{
          fontSize: "2rem",
          textAlign: "center",
          marginBottom: "2rem",
          fontWeight: "700",
        }}
      >
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
              boxShadow: "0 2px 8px #0002",
              width: 300,
              overflow: "hidden",
            }}
          >
            <img
              src={c.img}
              alt={c.title}
              style={{ height: 180, width: "100%", objectFit: "cover" }}
            />
            <div style={{ padding: "1.2rem" }}>
              <h4 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{c.title}</h4>
              <p
                style={{
                  color: "#555",
                  fontSize: "0.95rem",
                  marginTop: 8,
                  lineHeight: 1.5,
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
        background: "#f5f8ff",
        padding: "3rem 1rem 2rem",
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
          marginBottom: 32,
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
          fontSize: "1.1rem",
          cursor: "pointer",
        }}
      >
        Support Our Work
      </button>
    </section>
  </div>
);

export default Home;
