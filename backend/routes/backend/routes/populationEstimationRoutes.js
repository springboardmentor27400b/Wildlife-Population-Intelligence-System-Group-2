const express = require("express");
const router = express.Router();

const {
  getPopulationEstimation,
} = require("../controllers/populationEstimationController");

router.get("/", getPopulationEstimation);

module.exports = router;