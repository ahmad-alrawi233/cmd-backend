require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());

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
      return res.status(400).json({ error: "No image uploaded" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = "cmd_upload";

    if (!cloudName) {
      return res.status(500).json({
        error: "Cloudinary cloud name missing",
      });
    }

    const formData = new FormData();

    const blob = new Blob([req.file.buffer], {
      type: req.file.mimetype,
    });

    formData.append("file", blob, req.file.originalname);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "cmd-projects");

    const cloudinaryResponse = await fetch(
      'https://api.cloudinary.com/v1_1/${cloudName}/image/upload',
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
      console.log("Cloudinary error:", data);
      return res.status(500).json({
        error: "Upload failed",
        details: data.error?.message || "Cloudinary upload failed",
      });
    }

    return res.status(200).json({
      imageUrl: data.secure_url,
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