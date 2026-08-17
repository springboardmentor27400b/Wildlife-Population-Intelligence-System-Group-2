const express = require("express");

const router = express.Router();

const {
  getPopulation,
  getPopulationById,
  addPopulation,
  updatePopulation,
  deletePopulation,
} = require("../controllers/populationController");

router.get("/", getPopulation);

router.get("/:id", getPopulationById);

router.post("/", addPopulation);

router.put("/:id", updatePopulation);

router.delete("/:id", deletePopulation);

module.exports = router;