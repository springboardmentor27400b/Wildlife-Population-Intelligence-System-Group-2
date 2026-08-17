const Detection = require("../models/Detection");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Get All Detections

exports.getDetections = async (req, res) => {
  try {
    const detections = await Detection.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: detections.length,
      data: detections,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Detection

exports.addDetection = async (req, res) => {
  try {
    const detection = await Detection.create(req.body);

    res.status(201).json({
      success: true,
      message: "Detection Added Successfully",
      data: detection,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload Wildlife Image

exports.uploadImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please Upload an Image",
      });
    }

    const imagePath = path.join(
      __dirname,
      "../uploads",
      req.file.filename
    );

    const formData = new FormData();

    formData.append(
      "file",
      fs.createReadStream(imagePath)
    );

    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/detect",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const detections = aiResponse.data.detections;

    let speciesName = "Unknown";
    let confidence = 0;
    let animalCount = 0;

    let endangeredStatus = "Least Concern";
    let conservationLevel = "Low";
    let alertMessage = "";

    if (detections.length > 0) {

      speciesName = detections[0].speciesName;
      confidence = detections[0].confidence;
      animalCount = detections.length;

      const endangeredAnimals = [
  "tiger",
  "leopard",
  "elephant",
  "rhino",
  "rhinoceros",
  "lion",
  "cheetah",
  "gorilla",
  "chimpanzee",
  "panda",
];

      if (
        endangeredAnimals.includes(
          speciesName.toLowerCase()
        )
      ) {

        endangeredStatus = "Endangered";
        conservationLevel = "High";
        alertMessage =
          `${speciesName} is an endangered species. Immediate conservation attention required.`;

      }

    }
        const detection = await Detection.create({

      speciesName,
      scientificName: "",

      confidence,

      animalCount,

      image: req.file.filename,

      boundingBoxes: [],

      cameraId: req.body.cameraId || "",

      location: req.body.location || "Unknown",

      latitude: req.body.latitude || null,

      longitude: req.body.longitude || null,

      habitat: req.body.habitat || "",

      endangeredStatus,

      conservationLevel,

      alertMessage,

      detectionTime: new Date(),

      status:
        animalCount > 0
          ? "Detected"
          : "No Animal",

    });

    res.status(201).json({

      success: true,

      message: "Image Uploaded & AI Detection Completed",

      data: detection,

      detections,

    });

  } catch (error) {

    console.log("========== AI DETECTION ERROR ==========");

    console.log(error.message);

    console.log("========================================");

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
// Update Detection

exports.updateDetection = async (req, res) => {
  try {

    const detection = await Detection.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: "Detection Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Detection Updated Successfully",
      data: detection,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Delete Detection

exports.deleteDetection = async (req, res) => {
  try {

    const detection = await Detection.findById(
      req.params.id
    );

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: "Detection Not Found",
      });
    }

    await detection.deleteOne();

    res.status(200).json({
      success: true,
      message: "Detection Deleted Successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};