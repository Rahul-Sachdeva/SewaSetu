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
import DonationsManagement from "./DonationsManagement";
import Navbar from "../components/Navbar";
import NgoDashboard from "./NgoDashboard";






export default function NGODashboard() {
  const [active, setActive] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Overview / Summary", icon: <LayoutDashboard size={18} /> },
    { id: "ngo-requests", label: "Requests Management", icon: <ClipboardList size={18} /> },
    { id: "donations", label: "Donations Management", icon: <Gift size={18} /> },
    { id: "campaign-new", label: "Create New Campaign", icon: <FolderPlus size={18} /> },
    { id: "campaigns", label: "My Campaigns", icon: <FolderOpen size={18} /> },
    { id: "ngo-list", label: "NGO List", icon: <List size={18} /> },
  ];

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", background: "#f4f6f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />


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
          
          {active === "ngo-requests" && <NgoDashboard />}

          {/* My Campaigns */}
          {active === "campaigns" && <MyCampaignsPage />}

          {/* NGO List */}
          {active === "ngo-list" && <NGOListPage />}

          {/* Donations Management */}
          {active === "donations" && <DonationsManagement />}


        


          {/* Placeholders */}
          {active !== "overview" &&
            active !== "campaigns" &&
            active !== "ngo-list" &&
            active !== "campaign-new" && active !== "profile" && active !== "donations" && active !== "ngo-requests" &&  (
              <div className="p-10 bg-white rounded-xl shadow-md text-center text-gray-500">
                {menuItems.find((item) => item.id === active)?.label} page coming soon...
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
