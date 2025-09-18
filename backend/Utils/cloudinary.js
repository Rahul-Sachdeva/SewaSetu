import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const uploadCloudinary = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "sewasetu" }, (error, result) => {
            if (result) resolve(result);
            else reject(error);
        });

        stream.end(fileBuffer);
    });
};

export default uploadCloudinary;