import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    total_alerts: 0,
    critical: 0,
    high: 0,
    moderate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/alerts/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAlerts(response.data.alerts || []);

      setSummary({
        total_alerts: response.data.total_alerts || 0,
        critical: response.data.critical || 0,
        high: response.data.high || 0,
        moderate: response.data.moderate || 0,
      });
    } catch (err) {
      console.error("Alert loading error:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-700 border-red-200";

      case "High":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "Moderate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getIcon = (severity) => {
    switch (severity) {
      case "Critical":
        return "🔴";

      case "High":
        return "🟠";

      case "Moderate":
        return "🟡";

      default:
        return "🟢";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Notifications & Alerts
          </h1>

          <p className="text-gray-500 mt-1">
            Wildlife conservation alerts and monitoring notifications
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="mt-4 md:mt-0 px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
        >
          🔄 Refresh
        </button>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-gray-500 text-sm">
            Total Alerts
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {summary.total_alerts}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-5">
          <p className="text-gray-500 text-sm">
            Critical
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {summary.critical}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-l-4 border-orange-500 p-5">
          <p className="text-gray-500 text-sm">
            High
          </p>

          <h2 className="text-3xl font-bold text-orange-600 mt-2">
            {summary.high}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-l-4 border-yellow-500 p-5">
          <p className="text-gray-500 text-sm">
            Moderate
          </p>

          <h2 className="text-3xl font-bold text-yellow-600 mt-2">
            {summary.moderate}
          </h2>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-500">
            Loading alerts...
          </p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <div className="text-5xl mb-3">✅</div>

          <h2 className="text-xl font-semibold text-gray-700">
            No active alerts
          </h2>

          <p className="text-gray-500 mt-1">
            Wildlife monitoring systems are currently stable.
          </p>
        </div>
      ) : (

        <div className="space-y-4">

          {alerts.map((alert, index) => (

            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition"
            >

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                {/* Alert information */}
                <div className="flex gap-4">

                  <div className="text-2xl">
                    {getIcon(alert.severity)}
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-semibold text-gray-800">
                        {alert.alert_type}
                      </h3>

                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityClass(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>

                    </div>

                    {/* Species */}
                    {alert.species && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Species:</strong>{" "}
                        {alert.species}
                      </p>
                    )}

                    {/* Location */}
                    {alert.location && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Location:</strong>{" "}
                        {alert.location}
                      </p>
                    )}

                    {/* Habitat */}
                    {alert.habitat && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Habitat:</strong>{" "}
                        {alert.habitat}
                      </p>
                    )}

                    {/* Device */}
                    {alert.device_id && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Device:</strong>{" "}
                        {alert.device_id}
                      </p>
                    )}

                    {/* Population */}
                    {alert.population !== undefined && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Population:</strong>{" "}
                        {alert.population}
                      </p>
                    )}

                    {/* Decline */}
                    {alert.decline_percentage !== undefined && (
                      <p className="text-sm text-red-600 mt-1">
                        <strong>Population decline:</strong>{" "}
                        {alert.decline_percentage}%
                      </p>
                    )}

                  </div>

                </div>

              </div>

              {/* Message */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4">

                <p className="text-sm text-gray-700">
                  <strong>Alert:</strong>{" "}
                  {alert.message}
                </p>

                {alert.action && (
                  <p className="text-sm text-green-700 mt-2">
                    <strong>Recommended Action:</strong>{" "}
                    {alert.action}
                  </p>
                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Notifications;