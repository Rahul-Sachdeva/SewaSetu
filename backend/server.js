
import dotenv from "dotenv";                // To parse .env file data in this folder
dotenv.config();                            // config is needed to make it work

import {connectDB} from "./DB/index.js";    // Function to connect to DB
import {app} from "./app.js";               // Includes server and configurations

const port = process.env.PORT               // Localhost PORT where backend Runs

// First connect with DB, if connection is successful, app server starts listening on specified port,
// If any error occurs, handle it through catch block.
connectDB()
    .then(()=>{
        app.listen(port, () => {
            console.log("Server Listening on PORT: ", port)
        });
    })
    .catch((err) => console.log(err));