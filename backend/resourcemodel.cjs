const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  filePath: {
    type: String,
    default: "",
  },

  rating: {
    type: Number,
    default: 0,
  },

  ratingCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Resource", resourceSchema);