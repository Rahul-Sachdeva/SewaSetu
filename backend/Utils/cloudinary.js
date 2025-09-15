import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const uploadCloudinary = async(localPathName) => {
    try {
        if(!localPathName) return null;
        const uploadResult = await cloudinary.uploader.upload(localPathName, {
            resource_type: "auto",
        });
        console.log("File uploaded successfully");
        return uploadResult;
    } catch (err) {
        fs.unlinkSync(localPathName);
        console.log(error);
        throw new Error(error);
        return null;
    }
}

export default uploadCloudinary;