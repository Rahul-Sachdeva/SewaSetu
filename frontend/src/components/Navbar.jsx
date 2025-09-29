import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";  // import your useAuth hook
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth(); // get logged-in user

  // Style function for active links
const activeStyle = {
  borderBottom: "2px solid #123180ff",
  color: "#123180ff",
  fontWeight: "600",
  paddingBottom: 4,
};


  // Default link style
  const defaultStyle = {
    textDecoration: "none",
    color: "black",
  };

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
              <NavLink
                to="/"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                Home
              </NavLink>
              <NavLink
                to="/dashboard"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                NGO Dashboard
              </NavLink>
              <NavLink
                to="/campaigns"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                Campaigns
              </NavLink>
              <NavLink
                to="/chat"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                Chat
              </NavLink>
              
              <NavLink
                to="/notifications"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                Notifications
              </NavLink>

              <NavLink
                to="/ngo-profile"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                My Profile
              </NavLink>
              
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
              <NavLink
                to="/"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                Home
              </NavLink>
              <NavLink
                to="/donate"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                Donate
              </NavLink>
              <NavLink
                to="/request"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                Request Assistance
              </NavLink>
              <NavLink
                to="/user-requests"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                User Dashboard
              </NavLink>
              <NavLink
                to="/campaigns"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                Campaigns
              </NavLink>
              <NavLink
                to="/profile"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                My Profile
              </NavLink>
              <NavLink
                to="/notifications"
                style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
              >
                Notifications
              </NavLink>
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
            <NavLink
              className="signup-btn"
              to="/login"
              style={{ color: "white" }}
            >
              Login
            </NavLink>
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
                <NavLink
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/ngo-requests"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  NGO Dashboard
                </NavLink>
                <NavLink
                  to="/campaigns"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  Campaigns
                </NavLink>
                <NavLink
                  to="/ngo-profile"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="/create-campaign"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  Create Campaign
                </NavLink>
                <NavLink
                  to="/notifications"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  Notifications
                </NavLink>
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
                <NavLink
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/donate"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  Donate
                </NavLink>
                <NavLink
                  to="/request"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  Request Assistance
                </NavLink>
                <NavLink
                  to="/user-requests"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  User Dashboard
                </NavLink>
                <NavLink
                  to="/campaigns"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  Campaigns
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="/notifications"
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) =>
                    isActive ? activeStyle : defaultStyle
                  }
                >
                  Notifications
                </NavLink>
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
              <NavLink
                className="signup-btn"
                to="/login"
                style={{ color: "white" }}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </NavLink>
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
