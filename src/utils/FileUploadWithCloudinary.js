// packages
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

// to set cloudinary configurations
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileOnCloudinary = async (localPathUrl) => {
  if (!localPathUrl) return null;

  try {
    const responseResult = await cloudinary.uploader.upload(localPathUrl, {
      resource_type: "auto"
    });

    fs.unlinkSync(localPathUrl);
    return responseResult;
  } catch (error) {
    fs.unlinkSync(localPathUrl);
    throw new ApiError(500, "Failed to upload file");
  }
};

export { uploadFileOnCloudinary };
