import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { NavLink, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const activeStyle = {
    borderBottom: "2px solid #123180ff",
    color: "#123180ff",
    fontWeight: "600",
    paddingBottom: 4,
  };

  const defaultStyle = {
    textDecoration: "none",
    color: "black",
  };

  const isUserDashboardActive =
    location.pathname.startsWith("/user-requests") ||
    location.pathname.startsWith("/user-donation");

  return (
    <nav
      style={{
        padding: "1rem 1.5rem",
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
      {/* Logo */}
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
              <NavLink to="/" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                Home
              </NavLink>
              <NavLink to="/dashboard" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                NGO Dashboard
              </NavLink>
              <NavLink to="/campaigns" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                Campaigns
              </NavLink>
              <NavLink to="/chat" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                Chat
              </NavLink>
              <NavLink to="/notifications" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                Notifications
              </NavLink>
              <NavLink to="/ngo-profile" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                My Profile
              </NavLink>
              <a
                className="logout-btn"
                href="#logout"
                onClick={(e) => {
                  e.preventDefault(); // Prevent anchor default navigation
                  localStorage.clear();
                  navigate("/login");
                }}
                style={{ color: "white", fontWeight: "bold" }}
              >
                Logout
              </a>
            </>
          ) : (
            <>
              <NavLink to="/" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                Home
              </NavLink>
              <NavLink to="/donate" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                Donate
              </NavLink>
              <NavLink to="/request" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                Request Assistance
              </NavLink>
              <NavLink to="/campaigns" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                Campaigns
              </NavLink>
              <NavLink to="/ngo-list" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                View NGOs
              </NavLink>


              {/* User Dashboard Dropdown */}
              <div className="dropdown" style={{ paddingLeft: 1 }}>
                <span style={isUserDashboardActive ? activeStyle : defaultStyle}>
                  User Dashboard ▾
                </span>
                <div className="dropdown-content">
                  <NavLink to="/user-requests" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                    My Requests
                  </NavLink>
                  <NavLink to="/user-donation" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                    My Donations
                  </NavLink>
                  <NavLink to="/profile" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                    My Profile
                  </NavLink>
                  <NavLink to="/chat" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                    Chat
                  </NavLink>
                  <NavLink to="/notifications" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                    Notifications
                  </NavLink>
                </div>
              </div>


              <a
                className="logout-btn"
                href="#logout"
                onClick={(e) => {
                  e.preventDefault(); // Prevent anchor default navigation
                  localStorage.clear();
                  navigate("/login");
                }}
                style={{ color: "white", fontWeight: "bold" }}
              >
                Logout
              </a>
            </>
          )
        ) : (
          <NavLink className="signup-btn" to="/login" style={{ color: "white" }}>
            Login
          </NavLink>
        )}
      </div>

      {/* Hamburger Button */}
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <img src="/src/assets/dropdown.png" alt="menu toggle" style={{ width: 28, height: 28 }} />
      </button>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="nav-links mobile">
          {user ? (
            user.role === "ngo" ? (
              <>
                <NavLink to="/" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  Home
                </NavLink>
                <NavLink to="/ngo-requests" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  NGO Dashboard
                </NavLink>
                <NavLink to="/campaigns" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  Campaigns
                </NavLink>
                <NavLink to="/ngo-profile" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  My Profile
                </NavLink>
                <NavLink to="/create-campaign" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  Create Campaign
                </NavLink>
                <NavLink to="/notifications" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  Notifications
                </NavLink>
                <a
                  className="logout-btn"
                  href="#logout"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent anchor default navigation
                    localStorage.clear();
                    navigate("/login");
                  }}
                  style={{ color: "white", fontWeight: "bold" }}
                >
                  Logout
                </a>
              </>
            ) : (
              <>
                <NavLink to="/" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  Home
                </NavLink>
                <NavLink to="/donate" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  Donate
                </NavLink>
                <NavLink to="/request" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  Request Assistance
                </NavLink>

                <NavLink to="/campaigns" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  Campaigns
                </NavLink>
                <NavLink to="/ngo-list" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                  View NGOs
                </NavLink>


                {/* Mobile User Dashboard Dropdown */}
                <div className="dropdown-mobile">
                  <span
                    className={`dropdown-toggle ${isUserDashboardActive ? "active" : ""}`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    User Dashboard ▾
                  </span>
                  {dropdownOpen && (
                    <div className="dropdown-menu-mobile">
                      <NavLink
                        to="/user-requests"
                        onClick={() => {
                          setMenuOpen(false);
                          setDropdownOpen(false);
                        }}
                        style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
                      >
                        My Requests
                      </NavLink>
                      <NavLink
                        to="/user-donation"
                        onClick={() => {
                          setMenuOpen(false);
                          setDropdownOpen(false);
                        }}
                        style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}
                      >
                        My Donations
                      </NavLink>
                      <NavLink to="/profile" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                        My Profile
                      </NavLink>
                      <NavLink to="/chat" style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                        Chat
                      </NavLink>
                      <NavLink to="/notifications" onClick={() => setMenuOpen(false)} style={({ isActive }) => (isActive ? activeStyle : defaultStyle)}>
                        Notifications
                      </NavLink>
                    </div>
                  )}
                </div>


                <a
                  className="logout-btn"
                  href="#logout"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent anchor default navigation
                    localStorage.clear();
                    navigate("/login");
                  }}
                  style={{ color: "white", fontWeight: "bold" }}
                >
                  Logout
                </a>
              </>
            )
          ) : (
            <NavLink className="signup-btn" to="/login" style={{ color: "white" }} onClick={() => setMenuOpen(false)}>
              Login
            </NavLink>
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
          .dropdown {
            position: relative;
            display: inline-block;
          }
          .dropdown-content {
            display: none;
            position: absolute;
            background-color: #fff;
            min-width: 160px;
            box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
            padding: 0.5rem;
            z-index: 10;
            border-radius: 6px;
          }
          .dropdown:hover .dropdown-content {
            display: flex;
            flex-direction: column;
          }
          .dropdown-content a {
            margin: 0.4rem 0;
          }
          .desktop { display: flex; align-items: center; }
          .hamburger { background: none; border: none; cursor: pointer; display: none; }

          @media (max-width: 768px) {
            .desktop { display: none; }
            .hamburger { display: block; }
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
            .mobile a { margin: 0.5rem 0; }
            .mobile .signup-btn { margin-top: 0.5rem; }
            .dropdown-mobile {
              display: flex;
              flex-direction: column;
              margin: 0.5rem 0;
            }
            .dropdown-toggle {
              cursor: pointer;
              font-weight: 500;
              margin-bottom: 0.3rem;
            }
            .dropdown-toggle.active {
              border-bottom: 2px solid #123180ff;
              color: #123180ff;
              font-weight: 600;
              padding-bottom: 4px;
            }
            .dropdown-menu-mobile a {
              margin: 0.3rem 0 0.3rem 1rem;
              text-decoration: none;
              color: black;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;