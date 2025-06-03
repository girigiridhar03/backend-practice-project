import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "ecommerce/products",
    });

    console.log("file uploaded successfully", response);

    fs.promises.unlink(localFilePath).catch(console.error);

    return response;
  } catch (error) {
    fs.promises.unlink(localFilePath).catch(console.error);
    console.log("file upload failed ", error);
    return null;
  }
};

const deleteFileInCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete result:", result.result);
    return result;
  } catch (error) {
    console.log("file delete failed", error);
    return null;
  }
};

export { uploadToCloudinary, deleteFileInCloudinary };
