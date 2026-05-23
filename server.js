require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

app.get("/", (req, res) => {
  res.send("CMD Backend is running");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("Upload request received");

    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded",
      });
    }

    console.log("File received:", req.file.originalname);

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "projects",
      upload_preset: "cmd_upload",
      resource_type: "image",
    });

    return res.status(200).json({
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.log("Upload failed:", error.message);

    return res.status(500).json({
      error: "Upload failed",
      details: error.message || "Unknown error",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});