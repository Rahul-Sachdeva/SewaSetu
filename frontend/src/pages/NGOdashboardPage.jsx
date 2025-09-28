import { useState } from "react";
import {
  LayoutDashboard,
  Gift,
  ClipboardList,
  FolderPlus,
  FolderOpen,
  List,
} from "lucide-react";
import MyCampaignsPage from "./MyCampaignsPage";
import NGOListPage from "./NGOListPage";
import CampaignCreatePage from "./CampaignCreatePage";
import NGOProfile from "./NGOProfile";


function Navbar({ setActive }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        padding: "1rem 2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        borderBottom: "2px solid #eee",
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
        <a href="/">Home</a>
        <a href="/donate">Donate</a>
        <a href="/request">Request Assistance</a>
        <a href="/dashboard">NGO Dashboard</a>
        <a href="/campaigns">Campaigns</a>
        <a href="/about">About Us</a>
        {/* ✅ Profile button */}
        <button className="profile-btn" onClick={() => setActive("profile")} >👤</button>
      </div>

      {/* Hamburger Button (Mobile Only) */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <img
          src="/src/assets/dropdown.png"
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
          <a href="/ngo-dashboard">NGO Dashboard</a>
          <a href="/campaigns">Campaigns</a>
          <a href="/about">About Us</a>
          <button className="profile-btn">👤</button>
        </div>
      )}

      <style>
        {`
          .nav-links a {
            margin: 0 1rem;
            color: black;
            text-decoration: none;
          }

          /* ✅ Profile button styling */
          /* ✅ Profile button styling */
.profile-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #e5eafc;   /* lighter background */
  color: #123180ff;      /* dark blue icon color */
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.profile-btn:hover {
  background: #c0cbf5;   /* slightly darker on hover */
}


          .desktop {
            display: flex;
            align-items: center;
          }

          .hamburger {
            background: none;
            border: none;
            cursor: pointer;
            display: none;
          }

          @media (max-width: 768px) {
            .desktop {
              display: none;
            }
            .hamburger {
              display: block;
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
            .mobile .profile-btn {
              margin-top: 0.5rem;
            }
          }
        `}
      </style>
    </nav>
  );
}

export default function NGODashboard() {
  const [active, setActive] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Overview / Summary", icon: <LayoutDashboard size={18} /> },
    { id: "requests", label: "Requests Management", icon: <ClipboardList size={18} /> },
    { id: "donations", label: "Donations Management", icon: <Gift size={18} /> },
    { id: "campaign-new", label: "Create New Campaign", icon: <FolderPlus size={18} /> },
    { id: "campaigns", label: "My Campaigns", icon: <FolderOpen size={18} /> },
    { id: "ngo-list", label: "NGO List", icon: <List size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar with Profile button */}
      <Navbar setActive={setActive} />


      {/*  Sidebar + Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-6 shadow-md">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${active === item.id
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Overview Cards */}
          {active === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-white rounded-xl shadow-md">
                <h3 className="text-gray-600">Donations Received</h3>
                <p className="text-3xl font-bold">350</p>
                <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet</p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-md">
                <h3 className="text-gray-600">Requests Fulfilled</h3>
                <p className="text-3xl font-bold">125</p>
                <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet</p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-md">
                <h3 className="text-gray-600">Pending Pickups</h3>
                <p className="text-3xl font-bold">48</p>
                <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet</p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-md">
                <h3 className="text-gray-600">Pending Donations</h3>
                <p className="text-3xl font-bold">21</p>
                <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet</p>
              </div>
            </div>
          )}

          {/* NGO Profile */}
          {active === "profile" && <NGOProfile />}

          {/* Create New Campaign */}
          {active === "campaign-new" && <CampaignCreatePage />}

          {/* My Campaigns */}
          {active === "campaigns" && <MyCampaignsPage />}

          {/* NGO List */}
          {active === "ngo-list" && <NGOListPage />}

          {/* Placeholders */}
          {active !== "overview" &&
            active !== "campaigns" &&
            active !== "ngo-list" &&
            active !== "campaign-new" && active !== "profile" &&(
              <div className="p-10 bg-white rounded-xl shadow-md text-center text-gray-500">
                {menuItems.find((item) => item.id === active)?.label} page coming soon...
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
