// npm Packages
import express from "express";              // To create express server
import cookieParser from "cookie-parser";   // For Parsing User Cookies
import cors from "cors";                    // To allow requests from only allowed URLs to backend
// import routers
import requestRoutes from "./Routes/requestRoutes.js";
import userRouter from "./Routes/user.routes.js";
import ngoRouter from "./Routes/ngo.routes.js";
import campaignRouter from "./Routes/campaign.routes.js";
import conversationRouter from "./Routes/conversation.routes.js";
import messageRouter from "./Routes/message.routes.js";
import fundRouter from "./Routes/fund.routes.js";

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
app.use("/api/v1/fund", fundRouter);

export {app} 