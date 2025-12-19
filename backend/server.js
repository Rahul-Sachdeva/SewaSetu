
import dotenv from "dotenv";                // To parse .env file data in this folder
dotenv.config();                            // config is needed to make it work

import {connectDB} from "./DB/index.js";    // Function to connect to DB
import {app} from "./app.js";               // Includes server and configurations

import { Server } from "socket.io";
import http from "http";

import { Message } from "./Models/message.model.js";
import { Conversation } from "./Models/conversation.model.js";
import "./cron/monthlyReportJob.js";



const port = process.env.PORT || 3000;          // Localhost PORT where backend Runs

const server = http.createServer(app); // Wrap Express app inside HTTP server

// Attach socket.io to server
const io = new Server(server, {
    cors: {
        // origin: "http://localhost:5173",
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Make io accessible inside routes/controllers via req.io
app.use((req, res, next)=> {
    req.io = io;
    next();
});

io.on("connection", (socket) => {
  socket.on("sendMessage", async (data) => {
    try {
      const message = await Message.create({
        conversation: data.conversationId,
        sender: data.sender,
        senderType: data.senderType,
        text: data.text,
        attachments: data.attachments || [],
        seenBy: [data.sender],
      });

      // Update conversation last message
      await Conversation.findByIdAndUpdate(data.conversationId, { lastMessage: message._id });

      // Emit to all clients in the room
      io.to(data.conversationId).emit("newMessage", message);

    } catch (err) {
      console.error("Error saving message:", err);
    }
  });
});

// First connect with DB, if connection is successful, app server starts listening on specified port,
// If any error occurs, handle it through catch block.
connectDB()
    .then(()=>{
        server.listen(port, () => {
            console.log("Server Listening on PORT: ", port)
        });
    })
    .catch((err) => console.log(err));