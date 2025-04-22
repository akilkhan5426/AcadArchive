const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema({
  filename: String,
  year: String,              // e.g., "2022-23"
  school: String,            // optional: engineering, medical, etc.
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Paper", paperSchema);
