import "./Monitoring.css";

import {
  FaPaw,
  FaLeaf,
  FaVideo,
  FaSatelliteDish,
  FaChartLine,
  FaShieldAlt,
  FaClock,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import API from "../services/api";

function Monitoring() {
  const [data, setData] = useState({
    totalPopulation: 0,
    totalSpecies: 0,
    totalCameras: 0,
    activeMonitoring: 0,
    lastUpdated: "",
  });

  const [loading, setLoading] = useState(true);

useEffect(() => {
  let cancelled = false;

  const loadMonitoring = async () => {
    try {
      const res = await API.get("/monitoring");

      if (!cancelled) {
        setData(
          res.data?.data || {
            totalPopulation: 0,
            totalSpecies: 0,
            totalCameras: 0,
            activeMonitoring: 0,
            lastUpdated: "",
          }
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadMonitoring();

  return () => {
    cancelled = true;
  };
}, []);


  return (
    <div className="monitoring">

      {/* HEADER */}

      <div className="monitoring-header">

        <div>
          <h1>Executive Wildlife Dashboard</h1>

          <p>
            Real-Time Wildlife Monitoring Overview
          </p>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          System Active
        </div>

      </div>


      {/* MAIN KPI CARDS */}

      <div className="monitoring-cards">

        <div className="monitor-card population-card">

          <div className="card-icon">
            <FaPaw />
          </div>

          <div className="card-content">

            <span>Total Population</span>

            <h2>
              {loading ? "..." : data.totalPopulation}
            </h2>

            <small>
              Wildlife Population
            </small>

          </div>

        </div>


        <div className="monitor-card species-card">

          <div className="card-icon">
            <FaLeaf />
          </div>

          <div className="card-content">

            <span>Total Species</span>

            <h2>
              {loading ? "..." : data.totalSpecies}
            </h2>

            <small>
              Species Identified
            </small>

          </div>

        </div>


        <div className="monitor-card camera-card">

          <div className="card-icon">
            <FaVideo />
          </div>

          <div className="card-content">

            <span>Camera Devices</span>

            <h2>
              {loading ? "..." : data.totalCameras}
            </h2>

            <small>
              Monitoring Devices
            </small>

          </div>

        </div>


        <div className="monitor-card active-card">

          <div className="card-icon">
            <FaSatelliteDish />
          </div>

          <div className="card-content">

            <span>Active Monitoring</span>

            <h2>
              {loading ? "..." : data.activeMonitoring}
            </h2>

            <small>
              Active Monitoring Zones
            </small>

          </div>

        </div>

      </div>


      {/* DASHBOARD INFORMATION */}

      <div className="monitoring-grid">


        {/* MONITORING STATUS */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>
                <FaChartLine /> Monitoring Status
              </h2>

              <p>
                Current wildlife monitoring system status
              </p>
            </div>

            <span className="active-badge">
              Active
            </span>

          </div>


          <div className="status-content">

            <div className="status-item">

              <div className="status-icon">
                <FaPaw />
              </div>

              <div>
                <strong>Wildlife Population</strong>

                <span>
                  {data.totalPopulation} animals monitored
                </span>
              </div>

            </div>


            <div className="status-item">

              <div className="status-icon">
                <FaLeaf />
              </div>

              <div>
                <strong>Species Monitoring</strong>

                <span>
                  {data.totalSpecies} species tracked
                </span>
              </div>

            </div>


            <div className="status-item">

              <div className="status-icon">
                <FaVideo />
              </div>

              <div>
                <strong>Camera Network</strong>

                <span>
                  {data.totalCameras} camera devices
                </span>
              </div>

            </div>


            <div className="status-item">

              <div className="status-icon">
                <FaSatelliteDish />
              </div>

              <div>
                <strong>Active Monitoring</strong>

                <span>
                  {data.activeMonitoring} active monitoring units
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* SYSTEM OVERVIEW */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>
                <FaShieldAlt /> System Overview
              </h2>

              <p>
                Wildlife Protection Information
              </p>
            </div>

          </div>


          <div className="overview-list">

            <div className="overview-row">

              <span>System Status</span>

              <strong className="stable">
                Operational
              </strong>

            </div>


            <div className="overview-row">

              <span>Monitoring Status</span>

              <strong className="stable">
                Active
              </strong>

            </div>


            <div className="overview-row">

              <span>Camera Network</span>

              <strong>
                {data.totalCameras} Devices
              </strong>

            </div>


            <div className="overview-row">

              <span>Species Tracked</span>

              <strong>
                {data.totalSpecies}
              </strong>

            </div>


            <div className="overview-row">

              <span>Population Records</span>

              <strong>
                {data.totalPopulation}
              </strong>

            </div>


            <div className="overview-row">

              <span>
                <FaClock /> Last Updated
              </span>

              <strong>

                {data.lastUpdated
                  ? new Date(
                      data.lastUpdated
                    ).toLocaleString()
                  : "-"}

              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* EXECUTIVE SUMMARY */}

      <div className="executive-summary">

        <div className="summary-icon">
          <FaShieldAlt />
        </div>

        <div>

          <h2>Executive Monitoring Summary</h2>

          <p>
            The wildlife monitoring system is currently
            operational with active monitoring across the
            available wildlife observation network.
            Population, species and camera information
            are being tracked through the monitoring system.
          </p>

        </div>

      </div>


      {/* DATA TABLE */}

      <div className="monitoring-summary">

        <div className="table-header">

          <div>

            <h2>Monitoring Summary</h2>

            <p>
              Current system monitoring parameters
            </p>

          </div>

          <span className="table-status">
            Live Data
          </span>

        </div>


        <div className="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>Parameter</th>
                <th>Current Value</th>
                <th>Status</th>
              </tr>

            </thead>


            <tbody>

              <tr>

                <td>Total Population</td>

                <td>
                  {data.totalPopulation}
                </td>

                <td>
                  <span className="stable">
                    Active
                  </span>
                </td>

              </tr>


              <tr>

                <td>Total Species</td>

                <td>
                  {data.totalSpecies}
                </td>

                <td>
                  <span className="stable">
                    Tracked
                  </span>
                </td>

              </tr>


              <tr>

                <td>Total Camera Devices</td>

                <td>
                  {data.totalCameras}
                </td>

                <td>
                  <span className="stable">
                    Connected
                  </span>
                </td>

              </tr>


              <tr>

                <td>Active Monitoring</td>

                <td>
                  {data.activeMonitoring}
                </td>

                <td>
                  <span className="stable">
                    Running
                  </span>
                </td>

              </tr>


              <tr>

                <td>System Status</td>

                <td>
                  Operational
                </td>

                <td>
                  <span className="stable">
                    Active
                  </span>
                </td>

              </tr>


              <tr>

                <td>Last Updated</td>

                <td>

                  {data.lastUpdated
                    ? new Date(
                        data.lastUpdated
                      ).toLocaleString()
                    : "-"}

                </td>

                <td>
                  <span className="stable">
                    Updated
                  </span>
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Monitoring;