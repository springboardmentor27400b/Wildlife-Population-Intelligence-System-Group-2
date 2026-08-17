const express = require("express");

const router = express.Router();

const { getMonitoring } = require("../controllers/monitoringController");

router.get("/", getMonitoring);

module.exports = router;