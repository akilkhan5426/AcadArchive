const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Log connection status
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully");
});
mongoose.connection.on("error", (err) => {
  console.log("❌ MongoDB connection error:", err);
});

// Default route
app.get("/", (req, res) => {
  res.send("✅ Backend is running...");
});

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const uploadRoutes = require("./routes/upload");
app.use("/api", uploadRoutes); // This will cover /upload and /files routes

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// List all endpoints (dev tool)
console.log(listEndpoints(app));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
