import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FaChartLine } from "react-icons/fa";
import api from "../api/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function SpeciesTrends() {
  const [populationData, setPopulationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const response = await api.get("/dashboard/population");

      setPopulationData(response.data || []);
    } catch (error) {
      console.error("Error fetching species trends:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: populationData.map(
      (item) => item.species
    ),

    datasets: [
      {
        label: "Population",

        data: populationData.map(
          (item) => item.population
        ),

        borderColor: "#0d6efd",

        backgroundColor:
          "rgba(13,110,253,0.15)",

        fill: true,

        tension: 0.4,

        pointRadius: 5,
      },
    ],
  };

  return (
    <div className="container-fluid py-4">

      <div className="mb-4">
        <h2 className="fw-bold text-primary">
          <FaChartLine className="me-2" />
          Species Trend Analysis
        </h2>

        <p className="text-muted">
          Analyze population distribution across recorded wildlife
          species to identify species requiring conservation attention.
        </p>
      </div>

      <div className="card border-0 shadow-lg">

        <div className="card-body p-4">

          <h4 className="fw-bold text-primary">
            Wildlife Population Trends
          </h4>

          <p className="text-muted">
            Population distribution of recorded species.
          </p>

          {loading ? (
            <div className="text-center py-5">

              <div className="spinner-border text-primary" />

              <p className="mt-3 text-muted">
                Loading species trends...
              </p>

            </div>
          ) : populationData.length === 0 ? (
            <p className="text-center text-muted py-5">
              No species trend data available.
            </p>
          ) : (
            <div style={{ height: "450px" }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,

                  plugins: {
                    legend: {
                      display: true,
                    },
                  },

                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default SpeciesTrends;