const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


dotenv.config();

const connectDB = require("./config/db");

const audioRoutes = require("./routes/audio");
const authRoutes = require("./routes/authRoutes");
const populationRoutes = require("./routes/populationRoutes");
const speciesRoutes = require("./routes/speciesRoutes");
const cameraRoutes = require("./routes/cameraRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const detectionRoutes = require("./routes/detectionRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/audio", audioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/population", populationRoutes);
app.use("/api/species", speciesRoutes);
app.use("/api/camera", cameraRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/detection", detectionRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    project: "Wildlife Population Intelligence System",
    version: "1.0.0",
    status: "Backend Running Successfully 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    server: "Running",
    database: "MongoDB Connected",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});