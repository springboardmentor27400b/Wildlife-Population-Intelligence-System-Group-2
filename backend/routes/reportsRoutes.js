const express = require("express");

const router = express.Router();

const { getReports } = require("../controllers/reportsController");

router.get("/", getReports);

module.exports = router;