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
import ChatLayout from "./pages/ChatLayout";
import NGOListPage from "./pages/NGOListPage";
import Request from "./pages/Request";      //this
import PendingNGOsPage from "./pages/PendingNGOsPage";
import MyCampaignsPage from "./pages/MyCampaignsPage";
import CampaignRegistrationsPage from "./pages/CampaignRegistrationsPage";
import SelectNGO from "./pages/SelectNGO";              //this
import SelectNGODon from "./pages/Selectngodon";    //ye
import DonationForm from "./pages/DonationForm";    //ye
import NGOdashboardPage from "./pages/NGOdashboardPage";
import NgoDashboard from "./pages/NgoDashboard";     //this
import UserDashboard from "./pages/UserDashboard";    //this
import NotAuthorised from "./pages/NotAuthorised";
import Notification from "./pages/Notification";   //this 
import Don_Notification from "./pages/don_notifiaction";  //ye
import DonationsManagement from "./pages/DonationsManagement";   //ye
import UserDonation from "./pages/UserDonation";   //ye
import UserLeaderboard from "./pages/UserLeaderboard";


import ReelsPage from "./pages/ReelsPage";
import FeedPage from "./pages/FeedPage";
import CreatePost from "./pages/CreatePost";
import ChatbotWidget from "./components/Chatbot/ChatbotWidget";

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/register-ngo" element={<RegisterNGO />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/*  <PrivateRoute roles={["admin","ngo","user"]}> */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={
          <PrivateRoute roles={["admin", "user"]}>
            <UserProfile />
          </PrivateRoute>
        } />
        {/* // Profile mode (own NGO) */}
        <Route path="/ngo-profile" element={<NGOProfile mode="profile" />} />

        {/* Visit mode (view another NGO) */}
        <Route path="/ngo/:ngoId" element={<NGOProfile mode="visit" />} />
        <Route path="/ngo-list" element={<NGOListPage />} />
        <Route path="/create-campaign" element={<CampaignCreatePage mode="create" />} />
        <Route path="/campaign/:id/edit" element={<CampaignCreatePage mode="edit" />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/chat">
          <Route index element={<ChatLayout />} />              {/* shows list + "empty" */}
          <Route path=":id" element={<ChatLayout />} />
          {/* shows list + chat */}
        </Route>
        <Route path="/request" element={<Request />} />
        <Route path="/select-ngo" element={<SelectNGO />} />
        <Route path="/pending-ngo" element={<PendingNGOsPage />} />
        <Route path="/ngo/my-campaigns" element={<MyCampaignsPage />} />
        <Route path="/campaign/:id/registrations" element={<CampaignRegistrationsPage />} />
        <Route path="/ngo-requests" element={<NgoDashboard />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/don-notifications" element={<Don_Notification />} />
        <Route path="/user-requests" element={<UserDashboard />} />
        <Route path="/not-authorized" element={<NotAuthorised />} />
        {/* Add routes for other pages here */}
        <Route path="/donate" element={<DonationForm />} />
        <Route path="/dashboard" element={<NGOdashboardPage />} />
        <Route path="/donations-management" element={<DonationsManagement />} />
        <Route path="/user-donation" element={<UserDonation />} />
        <Route path="/select-ngo-don" element={<SelectNGODon />} />
        <Route path="/leaderboard" element={
          <PrivateRoute roles={["user", "admin"]}>
            <UserLeaderboard />
          </PrivateRoute>
        } />

        
        
        <Route path="/reels" element={<ReelsPage />} />
        <Route path="/feed-page" element={<FeedPage />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
      <ChatbotWidget/>
    </BrowserRouter>
  );
}

export default App;
