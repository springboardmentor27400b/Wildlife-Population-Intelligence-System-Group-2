const Population = require("../models/Population");
const Species = require("../models/Species");
const Camera = require("../models/Camera");

exports.getMonitoring = async (req, res) => {
  try {
    const population = await Population.countDocuments();
    const species = await Species.countDocuments();
    const cameras = await Camera.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalPopulation: population,
        totalSpecies: species,
        totalCameras: cameras,
        activeMonitoring: cameras,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};