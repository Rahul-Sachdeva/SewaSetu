import { v2 as cloudinary } from "cloudinary";
import { fileTypeFromBuffer } from "file-type";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// /**
//  * Uploads a file buffer to Cloudinary.
//  * - Detects file type
//  * - Chooses resource type ("image", "video", or "raw")
//  * - Returns the upload result
//  *
//  * @param {Buffer} fileBuffer - File data as a buffer
//  * @returns {Promise<object>} - Cloudinary upload response
//  */
const uploadCloudinary = async (fileBuffer) => {
  try {
    // Detect file type from buffer
    const fileType = await fileTypeFromBuffer(fileBuffer);
    
    // Default to "auto", but force "raw" for PDFs
    let resourceType = "auto";
    if (fileType?.mime === "application/pdf") {
      resourceType = "raw";
    }

    // Return a promise wrapping Cloudinary's upload_stream
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "sewasetu",
          resource_type: resourceType,
          public_id: `file_${Date.now()}`,
        },
        (error, result) => {
          if (result){ 
            resolve(result); 
          } 
          else reject(error);
        }
      );

      // Pipe the buffer to Cloudinary
      uploadStream.end(fileBuffer);
    });
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  }
};

export default uploadCloudinary;
