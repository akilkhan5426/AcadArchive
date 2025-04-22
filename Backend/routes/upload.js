const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth"); // JWT middleware
const Paper = require("../models/Paper");   // Mongoose model

const router = express.Router();

// 🔧 Multer storage config
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, "file-" + Date.now() + path.extname(file.originalname));
  },
});

// ✅ Only allow PDFs
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed!"), false);
  },
});

// 🔐 Upload route - Admins only
router.post("/upload", auth, upload.single("pdf"), async (req, res) => {
  const { year, school } = req.body;

  // Auth check
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied. Only admins can upload files." });
  }

  // Validation
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
  if (!year || !school) return res.status(400).json({ msg: "Year and school are required." });

  try {
    const newPaper = new Paper({
      filename: req.file.filename,
      year,
      school,
    });

    await newPaper.save();

    res.json({ msg: "File uploaded successfully", file: req.file.filename });
  } catch (err) {
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
});

// 📂 Get all uploaded files
router.get("/files", (req, res) => {
  const directoryPath = path.join(__dirname, "../uploads/");

  fs.readdir(directoryPath, (err, files) => {
    if (err) return res.status(500).json({ msg: "Unable to scan files!" });

    const fileList = files.map((file) => ({
      name: file,
      filePath: `/uploads/${file}`,
    }));
    res.json(fileList);
  });
});

// 📅 Get files by year
router.get("/files/:year", async (req, res) => {
  const year = req.params.year;

  try {
    const papers = await Paper.find({ year });

    const result = papers.map((p) => ({
      name: p.filename,
      url: `${req.protocol}://${req.get("host")}/uploads/${p.filename}`,
      uploadedAt: p.uploadedAt,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching papers", error: err.message });
  }
});

module.exports = router;
