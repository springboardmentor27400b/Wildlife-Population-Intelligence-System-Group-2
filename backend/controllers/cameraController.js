const Camera = require("../models/Camera");

// Get All Cameras
exports.getCameras = async (req, res) => {
  try {
    const cameras = await Camera.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cameras.length,
      data: cameras,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Camera
exports.addCamera = async (req, res) => {
  try {
    const { cameraName, location, zone, status } = req.body;

    const camera = await Camera.create({
      cameraName,
      location,
      zone,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Camera Added Successfully",
      data: camera,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Camera
exports.updateCamera = async (req, res) => {
  try {
    const camera = await Camera.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Camera Updated Successfully",
      data: camera,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Camera
exports.deleteCamera = async (req, res) => {
  try {
    await Camera.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Camera Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};