import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import VerifyEmail from "./pages/VerifyEmail";
import RegisterNGO from "./pages/RegisterNGO";
import PrivateRoute from "./components/PrivateRoute";
import UserProfile from "./pages/UserProfile";
import NGOProfile from "./pages/NgoProfile";
import CampaignCreatePage from "./pages/CampaignCreatePage";
import Campaigns from "./pages/Campaigns";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/register-ngo" element={<RegisterNGO/>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/*  <PrivateRoute roles={["admin","ngo","user"]}> */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={
          <PrivateRoute roles={["admin","user"]}>
            <UserProfile />
          </PrivateRoute>
        } />
        <Route path="/ngo-profile" element={<NGOProfile />} />
        <Route path="/create-campaign" element={<CampaignCreatePage />} />
        <Route path="/campaigns" element={<Campaigns/>} />
        {/* </PrivateRoute> */}
        
        {/* Add routes for other pages here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
