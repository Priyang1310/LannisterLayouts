const { v2 } = require("cloudinary");

const cloudinary = v2;
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file if the upload fails
        return null;
    }
};

