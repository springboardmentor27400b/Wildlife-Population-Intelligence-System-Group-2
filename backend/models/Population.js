const mongoose = require("mongoose");

const populationSchema = new mongoose.Schema(
  {
    // Wildlife species name
    species: {
      type: String,
      required: true,
      trim: true,
    },

    // Forest / monitoring location
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Current population count
    count: {
      type: Number,
      required: true,
      min: 0,
    },

    // Population condition
    status: {
      type: String,
      enum: [
        "Stable",
        "Increasing",
        "Decreasing",
        "Endangered",
      ],
      default: "Stable",
    },

    // =========================
    // ENVIRONMENTAL DATA
    // =========================

    // Temperature in Celsius
    temperature: {
      type: Number,
      default: 28,
    },

    // Monthly rainfall in mm
    rainfall: {
      type: Number,
      default: 180,
    },

    // Overall habitat condition
    // 0 = Very Poor
    // 100 = Excellent
    habitat_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
    },

    // Water quality
    // 0 = Very Poor
    // 100 = Excellent
    water_quality: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
    },

    // Vegetation condition
    // 0 = Very Poor
    // 100 = Excellent
    vegetation_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
    },

    // Biodiversity condition
    // 0 = Very Poor
    // 100 = Excellent
    biodiversity_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
    },

    // Wildlife image
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Population",
  populationSchema
);