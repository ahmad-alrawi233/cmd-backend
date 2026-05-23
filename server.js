require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "cmd-projects",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.log("Cloudinary error:", error.message);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
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