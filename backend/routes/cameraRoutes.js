const express = require("express");

const router = express.Router();

const {
  getCameras,
  addCamera,
  updateCamera,
  deleteCamera,
} = require("../controllers/cameraController");

router.get("/", getCameras);

router.post("/", addCamera);

router.put("/:id", updateCamera);

router.delete("/:id", deleteCamera);

module.exports = router;