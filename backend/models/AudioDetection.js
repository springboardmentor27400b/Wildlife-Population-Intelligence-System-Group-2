const mongoose = require("mongoose");

const audioDetectionSchema = new mongoose.Schema(
  {
    animalName: {
      type: String,
      required: true,
    },

    confidence: {
      type: Number,
      default: 0,
    },

    audioFile: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "Unknown",
    },

    habitat: {
      type: String,
      default: "",
    },

    detectionTime: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      default: "Detected",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AudioDetection",
  audioDetectionSchema
);