const Population = require("../models/Population");
const Species = require("../models/Species");
const Camera = require("../models/Camera");

exports.getReports = async (req, res) => {
  try {
    const population = await Population.countDocuments();
    const species = await Species.countDocuments();
    const cameras = await Camera.countDocuments();

    res.status(200).json({
      success: true,
      report: {
        totalPopulation: population,
        totalSpecies: species,
        totalCameras: cameras,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};