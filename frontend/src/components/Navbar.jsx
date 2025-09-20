import React, { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        padding: "1rem 2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        borderBottom: "1px solid #eee",
        position: "sticky",
        top: 0,
        zIndex: 3000,
      }}
    >
      {/* Logo + Brand */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="/src/assets/logo.png"
          alt="SewaSetu"
          style={{ height: 36, marginRight: 12 }}
        />
        <span
          style={{
            color: "#123180ff",
            fontWeight: "bold",
            fontSize: "1.6rem",
          }}
        >
          SewaSetu
        </span>
      </div>
<tab>  space  </tab>
      {/* Desktop Nav */}
      <div className="nav-links desktop">
        <a href="/">Home</a>
        <a href="/donate">Donate</a>
        <a href="/request">Request Assistance</a>
        <a href="/dashboard">NGO Dashboard</a>
        <a href="/campaigns">Campaigns</a>
        <a href="/about">About Us</a>
        <button className="signup-btn">Sign Up</button>
      </div>

      {/* Hamburger Button (Mobile Only Visible) */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <img
          src={
            menuOpen
              ? "/src/assets/dropdown.png" // close icon
              : "/src/assets/dropdown.png" // hamburger icon
          }
          alt="menu toggle"
          style={{ width: 28, height: 28 }}
        />
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="nav-links mobile">
          <a href="/">Home</a>
          <a href="/donate">Donate</a>
          <a href="/request">Request Assistance</a>
          <a href="/dashboard">NGO Dashboard</a>
          <a href="/campaigns">Campaigns</a>
          <a href="/about">About Us</a>
          <button className="signup-btn">Sign Up</button>
        </div>
      )}

      <style>
        {`
          .nav-links a {
            margin: 0 1rem;
            color: black;
            text-decoration: none;
          }
          
          .signup-btn {
            padding: 0.6rem 1.4rem;
            background: #19398aff;
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
          }

          /* Desktop Layout */
          .desktop {
            display: flex;
            align-items: center;
          }

          .hamburger {
            background: none;
            border: none;
            cursor: pointer;
            display: none; /* hidden by default (desktop) */
          }

          /* Mobile Layout */
          @media (max-width: 768px) {
            .desktop {
              display: none;
            }
            .hamburger {
              display: block; /* visible only on mobile */
            }
            .mobile {
              position: absolute;
              top: 60px;
              right: 20px;
              background: #fff;
              padding: 1rem;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            }
            .mobile a {
              margin: 0.5rem 0;
            }
            .mobile .signup-btn {
              margin-top: 0.5rem;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
