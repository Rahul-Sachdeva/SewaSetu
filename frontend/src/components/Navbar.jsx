import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";  // import your useAuth hook
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth(); // get logged-in user

  return (
    <nav
      style={{
        padding: "1rem 2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        borderBottom: "3px solid #eee",
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

      {/* Desktop Nav */}
      <div className="nav-links desktop">

        {user ? (
          user.role === "ngo" ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/ngo-requests">NGO Dashboard</Link>
              <Link to="/campaigns">Campaigns</Link>
              <Link to="/ngo-profile">My Profile</Link>
              <Link to="/notifications">Notifications</Link>
              <a
                className="logout-btn"
                href="#logout"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{ color: "white", fontWeight: "bold" }}
              >
                Logout
              </a>
            </>
          ) : (
            // Links for regular users
            <>
              <Link to="/">Home</Link>
              <Link to="/donate">Donate</Link>
              <Link to="/request">Request Assistance</Link>
              <Link to="/user-requests">User Dashboard</Link>
              <Link to="/campaigns">Campaigns</Link>
              <Link to="/profile">My Profile</Link>
              <Link to="/notifications">Notifications</Link>
              <a
                className="logout-btn"
                href="#logout"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{ color: "white", fontWeight: "bold" }}
              >
                Logout
              </a>
            </>
          )
        ) : (
          // Not logged in links
          <>
            <Link className="signup-btn" to="/login" style={{ color: "white" }}>
              Login
            </Link>

          </>
        )}
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
              ? "/src/assets/dropdown.png" // close icon (can be same)
              : "/src/assets/dropdown.png" // hamburger icon
          }
          alt="menu toggle"
          style={{ width: 28, height: 28 }}
        />
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="nav-links mobile">


          {user ? (
            user.role === "ngo" ? (
              <>
                <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/ngo-requests" onClick={() => setMenuOpen(false)}>NGO Dashboard</Link>
                <Link to="/campaigns" onClick={() => setMenuOpen(false)}>Campaigns</Link>
                <Link to="/ngo-profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
                <Link to="/notifications" onClick={() => setMenuOpen(false)}>Notifications</Link>
                <a
                className="logout-btn"
                  href="#logout"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  style={{ color: "white", fontWeight: "bold" }}
                >
                  Logout
                </a>
              </>
            ) : (
              <>
                <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>

                <Link to="/donate" onClick={() => setMenuOpen(false)}>Donate</Link>
                <Link to="/request" onClick={() => setMenuOpen(false)}>Request Assistance</Link>
                <Link to="/user-requests" onClick={() => setMenuOpen(false)}>User Dashboard</Link>
                <Link to="/campaigns" onClick={() => setMenuOpen(false)}>Campaigns</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
                <Link to="/notifications" onClick={() => setMenuOpen(false)}>Notifications</Link>
                <a
                  className="logout-btn"
                  href="#logout"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  style={{ color: "white", fontWeight: "bold" }}
                >
                  Logout
                </a>
              </>
            )
          ) : (
            <>
              <Link
                className="signup-btn"
                to="/login"
                style={{ color: "white" }}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>

            </>
          )}
        </div>
      )}

      <style>
        {`
          .nav-links a {
            margin: 0 1rem;
            color: black;
            text-decoration: none;
          }
          
          .logout-btn {
          padding: 0.6rem 1.4rem;
            background: #be6147ff;
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
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
