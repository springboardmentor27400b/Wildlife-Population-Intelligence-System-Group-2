const mongoose = require("mongoose");

const speciesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    habitat: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "Protected",
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Species", speciesSchema);