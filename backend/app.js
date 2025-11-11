// npm Packages
import express from "express";              // To create express server
import cookieParser from "cookie-parser";   // For Parsing User Cookies
import cors from "cors";                    // To allow requests from only allowed URLs to backend
// import routers
import requestRoutes from "./Routes/request.routes.js";  //this
import userRouter from "./Routes/user.routes.js";
import ngoRouter from "./Routes/ngo.routes.js";
import getNGOLeaderboard from "./Routes/ngo.routes.js";
import campaignRouter from "./Routes/campaign.routes.js";
import conversationRouter from "./Routes/conversation.routes.js";
import messageRouter from "./Routes/message.routes.js";
import notificationRouter from "./Routes/notification.routes.js";  //this
import donationRouter from "./Routes/donation.routes.js";   
import donation_notificationRouter from "./Routes/don_notification.routes.js"; 
import postRouter from "./Routes/post.routes.js";
import likeRouter from "./Routes/like.routes.js";
import commentRouter from "./Routes/comment.routes.js";
import dashboardRouter from "./Routes/dashboard.routes.js";
import fundRouter from "./Routes/fund.routes.js";
import chatbotRouter from "./Routes/chatbot.routes.js";
import analyticsRouter from "./Routes/analytics.routes.js";
import reportRouter from "./Routes/report.routes.js";

// initialize server
const app = express();

// configure CORS
app.use(cors({
    origin: "http://localhost:5173", // replace with deployed domain or * for allowing all
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}))

app.use(express.json());                        // Allows to parse content in json
app.use(express.urlencoded({extended: true}))   // Allows to parse only urlencoded requests
app.use(cookieParser());                        // To parse current user cookies

// move requests to router as per url
app.use("/api/requests", requestRoutes);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/ngo", ngoRouter);
app.use("/api/v1/campaign", campaignRouter);
app.use("/api/v1/conversation", conversationRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/v1/donations", donationRouter);
app.use("/api/v1/donation_notification", donation_notificationRouter);
app.use("/api/v1/fund", fundRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/chatbot", chatbotRouter);
app.use("/dashboard", dashboardRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/reports", reportRouter);

export {app} 