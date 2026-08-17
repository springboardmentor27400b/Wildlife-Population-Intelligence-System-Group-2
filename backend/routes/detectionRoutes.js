const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  getDetections,
  addDetection,
  updateDetection,
  deleteDetection,
  uploadImage,
} = require("../controllers/detectionController");

router.get("/", getDetections);

router.post("/", addDetection);

router.post(
  "/upload",
  upload.single("image"),
  uploadImage
);

router.put("/:id", updateDetection);

router.delete("/:id", deleteDetection);

module.exports = router;