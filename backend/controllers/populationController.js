const Population = require("../models/Population");

// Get All Population
exports.getPopulation = async (req, res) => {
  try {
    const populations = await Population.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: populations.length,
      data: populations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Population
exports.addPopulation = async (req, res) => {
  try {
    const population = await Population.create(req.body);

    res.status(201).json({
      success: true,
      message: "Population Added Successfully",
      data: population,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Population
exports.getPopulationById = async (req, res) => {
  try {
    const population = await Population.findById(req.params.id);

    if (!population) {
      return res.status(404).json({
        success: false,
        message: "Population Not Found",
      });
    }

    res.status(200).json({
      success: true,
      data: population,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Population
exports.updatePopulation = async (req, res) => {
  try {
    const population = await Population.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Population Updated Successfully",
      data: population,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Population
exports.deletePopulation = async (req, res) => {
  try {
    await Population.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Population Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};