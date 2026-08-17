const Population = require("../models/Population");
const Species = require("../models/Species");
const Camera = require("../models/Camera");

exports.getAnalytics = async (req, res) => {
  try {
    const population = await Population.countDocuments();
    const species = await Species.countDocuments();
    const cameras = await Camera.countDocuments();

    res.status(200).json({
      success: true,
      analytics: {
        population,
        species,
        cameras,
        systemHealth: "Excellent",
        database: "Connected",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};