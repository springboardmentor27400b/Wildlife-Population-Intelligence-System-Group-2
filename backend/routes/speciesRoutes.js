const express = require("express");

const router = express.Router();

const {
  getSpecies,
  addSpecies,
  updateSpecies,
  deleteSpecies,
} = require("../controllers/speciesController");

router.get("/", getSpecies);

router.post("/", addSpecies);

router.put("/:id", updateSpecies);

router.delete("/:id", deleteSpecies);

module.exports = router;