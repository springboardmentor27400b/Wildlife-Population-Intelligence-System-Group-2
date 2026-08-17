const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema(
  {
    cameraName: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    zone: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Camera", cameraSchema);