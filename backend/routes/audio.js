const express = require("express");

const router = express.Router();

const multer = require("multer");
const path = require("path");

const {
  getAudioDetections,
  uploadAudio,
  deleteAudioDetection,
} = require("../controllers/audioController");

// Multer Storage

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
});

// Routes

router.get("/", getAudioDetections);

router.post(
  "/upload",
  upload.single("audio"),
  uploadAudio
);

router.delete(
  "/:id",
  deleteAudioDetection
);

module.exports = router;