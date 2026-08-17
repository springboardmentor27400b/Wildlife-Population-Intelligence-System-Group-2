const AudioDetection = require("../models/AudioDetection");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// Get All Audio Detections

exports.getAudioDetections = async (req, res) => {
  try {
    const detections = await AudioDetection.find().sort({
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

// Upload Audio

exports.uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please Upload Audio File",
      });
    }

    // Demo AI Prediction
 const formData = new FormData();

formData.append(
  "file",
  fs.createReadStream(req.file.path)
);

const aiResponse = await axios.post(
  "http://127.0.0.1:8000/audio-detect",
  formData,
  {
    headers: formData.getHeaders(),
  }
);

const prediction =
  aiResponse.data.predictions[0];

const animalName = prediction.label;

const confidence =
  prediction.confidence;

    const detection =
      await AudioDetection.create({
        animalName,
        confidence,
        audioFile: req.file.filename,
        location: req.body.location || "Forest Zone",
        habitat: req.body.habitat || "Dense Forest",
        detectionTime: new Date(),
        status: "Detected",
      });

    res.status(201).json({
      success: true,
      message: "Audio Detected Successfully",
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

// Delete Audio Detection

exports.deleteAudioDetection = async (
  req,
  res
) => {
  try {
    const detection =
      await AudioDetection.findById(req.params.id);

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: "Record Not Found",
      });
    }

    await detection.deleteOne();

    res.status(200).json({
      success: true,
      message: "Record Deleted Successfully",
    });
  } catch (error) {556

    
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};