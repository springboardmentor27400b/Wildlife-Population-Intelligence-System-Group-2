const Species = require("../models/Species");

// Get All Species
exports.getSpecies = async (req, res) => {
  try {
    const data = await Species.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Species
exports.addSpecies = async (req, res) => {
  try {
    const species = await Species.create(req.body);

    res.status(201).json({
      success: true,
      message: "Species Added Successfully",
      data: species,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Species
exports.updateSpecies = async (req, res) => {
  try {
    const species = await Species.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Species Updated Successfully",
      data: species,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Species
exports.deleteSpecies = async (req, res) => {
  try {
    await Species.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Species Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};