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
import ConversationList from "./components/ConversationList";
import ConversationPage from "./components/ConversationPage";
import ChatLayout from "./pages/ChatLayout";
import NGOListPage from "./pages/NGOListPage";
import Request from "./pages/Request";
import PendingNGOsPage from "./pages/PendingNGOsPage";
import SelectNGO from "./pages/SelectNGO";

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
        {/* // Profile mode (own NGO) */}
        <Route path="/ngo-profile" element={<NGOProfile mode="profile" />} />

        {/* Visit mode (view another NGO) */}
        <Route path="/ngo/:ngoId" element={<NGOProfile mode="visit" />} />
        <Route path="/ngo-list" element={<NGOListPage />} />
        <Route path="/create-campaign" element={<CampaignCreatePage />} />
        <Route path="/campaigns" element={<Campaigns/>} />
        <Route path="/chat">
          <Route index element={<ChatLayout />} />              {/* shows list + "empty" */}
          <Route path=":id" element={<ChatLayout />} />         {/* shows list + chat */}
        </Route>
        <Route path="/request" element={<Request />} />
        <Route path="/select-ngo" element={<SelectNGO />} />
        <Route path="/pending-ngo" element={<PendingNGOsPage/>}/>
        {/* Add routes for other pages here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
