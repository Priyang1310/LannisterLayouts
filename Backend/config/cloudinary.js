const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

// Setup Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let format;

    // Determine file format (pdf, doc, docx, or image)
    if (file.mimetype === "application/pdf") {
      format = "pdf";
    } else if (file.mimetype === "application/msword") {
      format = "doc";
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      format = "docx";
    } else {
      format = "jpg"; // Default to 'jpg' for images
    }

    return {
      folder: "uploads", // Folder where files will be stored in Cloudinary
      format: format, // Set the correct format based on the mimetype
      public_id: file.originalname, // Use file's original name as public_id
    };
  },
});

// Configure multer with Cloudinary storage
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false); // Reject files that are not supported
    }
  },
});

module.exports = upload;
