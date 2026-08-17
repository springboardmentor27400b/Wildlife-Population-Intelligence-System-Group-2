import "./Dashboard.css";

import {
  FaPaw,
  FaLeaf,
  FaVideo,
  FaExclamationTriangle,
  FaMapMarkedAlt,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [monitoring, setMonitoring] = useState({
    totalPopulation: 0,
    totalSpecies: 0,
    totalCameras: 0,
    activeMonitoring: 0,
  });

  const [detections, setDetections] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        const [monitoringRes, detectionRes] = await Promise.all([
          API.get("/monitoring"),
          API.get("/detection"),
        ]);

        if (cancelled) return;

        setMonitoring(
          monitoringRes.data?.data || {
            totalPopulation: 0,
            totalSpecies: 0,
            totalCameras: 0,
            activeMonitoring: 0,
          }
        );

        setDetections(detectionRes.data?.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const endangeredCount = detections.filter(
    (item) => item.endangeredStatus === "Endangered"
  ).length;

  const speciesMap = {};

  detections.forEach((item) => {
    const species = item.speciesName || "Unknown";

    if (!speciesMap[species]) {
      speciesMap[species] = 0;
    }

    speciesMap[species] += Number(item.animalCount || 0);
  });

  const speciesData = Object.entries(speciesMap)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .slice(0, 8);

  const trendMap = {};

  detections.forEach((item) => {
    if (!item.createdAt) return;

    const date = new Date(item.createdAt).toLocaleDateString();

    if (!trendMap[date]) {
      trendMap[date] = 0;
    }

    trendMap[date] += Number(item.animalCount || 0);
  });

  const trendData = Object.entries(trendMap)
    .map(([date, population]) => ({
      date,
      population,
    }))
    .slice(-7);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Executive Wildlife Dashboard</h1>

          <p>
            Wildlife intelligence, population analytics and GIS monitoring
            overview.
          </p>
        </div>

        <div className="dashboard-status">
          <FaShieldAlt />
          <span>System Active</span>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card population-card">
          <div className="dashboard-card-icon">
            <FaPaw />
          </div>

          <div>
            <h2>{monitoring.totalPopulation}</h2>
            <p>Total Population</p>
          </div>
        </div>

        <div className="dashboard-card species-card">
          <div className="dashboard-card-icon">
            <FaLeaf />
          </div>

          <div>
            <h2>{monitoring.totalSpecies}</h2>
            <p>Total Species</p>
          </div>
        </div>

        <div className="dashboard-card camera-card">
          <div className="dashboard-card-icon">
            <FaVideo />
          </div>

          <div>
            <h2>{monitoring.totalCameras}</h2>
            <p>Camera Devices</p>
          </div>
        </div>

        <div className="dashboard-card alert-card">
          <div className="dashboard-card-icon">
            <FaExclamationTriangle />
          </div>

          <div>
            <h2>{endangeredCount}</h2>
            <p>Endangered Alerts</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-box">
          <div className="box-header">
            <div>
              <h2>
                <FaChartLine /> Population Trend
              </h2>

              <p>Recent wildlife population observations</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="population"
                stroke="#2d6a4f"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-box">
          <div className="box-header">
            <div>
              <h2>
                <FaLeaf /> Species Distribution
              </h2>

              <p>Detected wildlife species</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={speciesData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#2d6a4f"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="gis-section">
        <div className="gis-header">
          <div>
            <h2>
              <FaMapMarkedAlt /> GIS Wildlife Distribution
            </h2>

            <p>
              Geographic wildlife monitoring and species distribution
              visualization.
            </p>
          </div>
        </div>

        <div className="gis-map">
          <div className="map-overlay">
            <div className="map-title">
              Wildlife Distribution Map
            </div>

            <div className="map-legend">
              <div>
                <span className="legend-dot high"></span>
                High Wildlife Activity
              </div>

              <div>
                <span className="legend-dot medium"></span>
                Medium Wildlife Activity
              </div>

              <div>
                <span className="legend-dot low"></span>
                Low Wildlife Activity
              </div>
            </div>
          </div>

          <div className="map-grid">
            <div className="map-zone zone-one">
              <FaPaw />
              <span>Forest Zone</span>
            </div>

            <div className="map-zone zone-two">
              <FaPaw />
              <span>Wildlife Zone</span>
            </div>

            <div className="map-zone zone-three">
              <FaPaw />
              <span>Protected Area</span>
            </div>

            <div className="map-zone zone-four">
              <FaVideo />
              <span>Camera Zone</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-summary">
        <div className="summary-box">
          <FaVideo />

          <div>
            <strong>{monitoring.activeMonitoring}</strong>
            <span>Active Monitoring</span>
          </div>
        </div>

        <div className="summary-box">
          <FaPaw />

          <div>
            <strong>{detections.length}</strong>
            <span>Total AI Detections</span>
          </div>
        </div>

        <div className="summary-box">
          <FaMapMarkedAlt />

          <div>
            <strong>{speciesData.length}</strong>
            <span>Mapped Species</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;