import React from "react";

const Navbar = () => (
  <nav
    style={{
      padding: "1rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#fff",
      borderBottom: "1px solid #eee",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}
  >
    {/* Logo + Brand */}
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src="/src/assets/logo.png"
        alt="SewaSetu"
        style={{ height: 32, marginRight: 8 }}
      />
      <span
        style={{
          color: "#123180ff",
          fontWeight: "bold",
          fontSize: "1.4rem",
          marginRight: "2rem",
        }}
      >
        SewaSetu
      </span>

      {/* Nav Links */}
      <a href="/" style={{ margin: "0 1rem", color: "black"}}>
        Home
      </a>
      <a href="/donate" style={{ margin: "0 1rem", color: "black" }}>
        Donate
      </a>
      <a href="/request" style={{ margin: "0 1rem", color: "black" }}>
        Request Assistance
      </a>
      <a href="/dashboard" style={{ margin: "0 1rem", color: "black" }}>
        NGO Dashboard
      </a>
      <a href="/campaigns" style={{ margin: "0 1rem", color: "black" }}>
        Campaigns
      </a>
      <a href="/about" style={{ margin: "0 1rem", color: "black" }}>
        About Us
      </a>
    </div>

    {/* Sign Up Button */}
    <button
      style={{
        padding: "0.6rem 1.4rem",
        background: "#2260ff",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Sign Up
    </button>
  </nav>
);

export default Navbar;
