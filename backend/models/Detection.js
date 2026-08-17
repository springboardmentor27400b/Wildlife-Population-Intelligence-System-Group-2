const mongoose = require("mongoose");

const detectionSchema = new mongoose.Schema(
  {
    speciesName: {
      type: String,
      required: true,
      trim: true,
    },

    scientificName: {
      type: String,
      default: "",
      trim: true,
    },

    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    animalCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    image: {
      type: String,
      default: "",
    },

    boundingBoxes: [
      {
        x: Number,
        y: Number,
        width: Number,
        height: Number,
      },
    ],

    cameraId: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    habitat: {
      type: String,
      default: "",
      trim: true,
    },

    detectionTime: {
      type: Date,
      default: Date.now,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ===========================
    // Endangered Species Module
    // ===========================

    endangeredStatus: {
      type: String,
      enum: [
        "Endangered",
        "Vulnerable",
        "Least Concern",
      ],
      default: "Least Concern",
    },

    conservationLevel: {
      type: String,
      default: "",
    },

    alertMessage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Uploaded",
        "Processing",
        "Detected",
        "Verified",
        "Rejected",
      ],
      default: "Uploaded",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Detection",
  detectionSchema
);