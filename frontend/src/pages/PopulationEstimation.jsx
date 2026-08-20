import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);


function PopulationEstimation() {

  // =====================================================
  // STATE
  // =====================================================

  const [dashboard, setDashboard] = useState({
    population_size: 0,
    population_density: 0,
    growth_rate: 0,
    species_richness: 0
  });

  const [speciesData, setSpeciesData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [migrationData, setMigrationData] = useState([]);

  const [loading, setLoading] = useState(true);


  // =====================================================
  // LOAD ALL POPULATION DATA
  // =====================================================

  useEffect(() => {

    const loadPopulationData = async () => {

      try {

        setLoading(true);

        const [
          dashboardRes,
          speciesRes,
          trendRes,
          migrationRes
        ] = await Promise.all([

          axios.get(
            `${import.meta.env.VITE_API_URL}/population/dashboard`
          ),

          axios.get(
            `${import.meta.env.VITE_API_URL}/population/species-distribution`
          ),

          axios.get(
            `${import.meta.env.VITE_API_URL}/population/population-trend`
          ),

          axios.get(
            `${import.meta.env.VITE_API_URL}/population/migration-analysis`
          )

        ]);


        setDashboard(dashboardRes.data);

        setSpeciesData(speciesRes.data);

        setTrendData(trendRes.data);

        setMigrationData(migrationRes.data);


      } catch (error) {

        console.error(
          "Error loading population data:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    loadPopulationData();

  }, []);


  // =====================================================
  // SPECIES POPULATION BAR CHART
  // =====================================================

  const speciesChart = {

    labels: speciesData.map(
      item => item.species
    ),

    datasets: [

      {

        label: "Population",

        data: speciesData.map(
          item => item.population
        ),

        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FF9800",
          "#9C27B0",
          "#F44336",
          "#00BCD4",
          "#8BC34A",
          "#FFC107"
        ]

      }

    ]

  };


  // =====================================================
  // POPULATION TREND LINE CHART
  // =====================================================

  const trendChart = {

    labels: trendData.map(
      item => item.date
    ),

    datasets: [

      {

        label: "Population Trend",

        data: trendData.map(
          item => item.population
        ),

        borderColor: "#4CAF50",

        backgroundColor: "#A5D6A7",

        fill: false,

        tension: 0.4

      }

    ]

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="container mt-5 text-center">

        <div
          className="spinner-border text-success"
          role="status"
        >
        </div>

        <p className="mt-3">
          Loading Population Intelligence...
        </p>

      </div>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="container mt-4">

      <h2 className="mb-4">
        Population Estimation Dashboard
      </h2>


      {/* =================================================
          DASHBOARD CARDS
      ================================================= */}

      <div className="row">


        {/* Population Size */}

        <div className="col-md-3 mb-3">

          <div className="card shadow text-center">

            <div className="card-body">

              <h5>
                Population Size
              </h5>

              <h2>
                {dashboard.population_size}
              </h2>

            </div>

          </div>

        </div>


        {/* Population Density */}

        <div className="col-md-3 mb-3">

          <div className="card shadow text-center">

            <div className="card-body">

              <h5>
                Population Density
              </h5>

              <h2>
                {dashboard.population_density}
              </h2>

            </div>

          </div>

        </div>


        {/* Growth Rate */}

        <div className="col-md-3 mb-3">

          <div className="card shadow text-center">

            <div className="card-body">

              <h5>
                Growth Rate
              </h5>

              <h2>
                {dashboard.growth_rate}%
              </h2>

            </div>

          </div>

        </div>


        {/* Species Richness */}

        <div className="col-md-3 mb-3">

          <div className="card shadow text-center">

            <div className="card-body">

              <h5>
                Species Richness
              </h5>

              <h2>
                {dashboard.species_richness}
              </h2>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          CHARTS
      ================================================= */}

      <hr className="my-5" />


      <div className="row">


        {/* Population by Species */}

        <div className="col-md-6 mb-4">

          <div className="card shadow">

            <div className="card-body">

              <h5>
                Population by Species
              </h5>

              {speciesData.length > 0 ? (

                <Bar
                  data={speciesChart}
                />

              ) : (

                <p className="text-muted">
                  No species population data available.
                </p>

              )}

            </div>

          </div>

        </div>


        {/* Population Trend */}

        <div className="col-md-6 mb-4">

          <div className="card shadow">

            <div className="card-body">

              <h5>
                Population Trend
              </h5>

              {trendData.length > 0 ? (

                <Line
                  data={trendChart}
                />

              ) : (

                <p className="text-muted">
                  No population trend data available.
                </p>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          MIGRATION ANALYSIS
      ================================================= */}

      <hr className="my-5" />


      <h3>
        Migration Analysis
      </h3>


      <table className="table table-bordered table-striped mt-3">


        <thead className="table-success">

          <tr>

            <th>
              Species
            </th>

            <th>
              Previous Location
            </th>

            <th>
              Current Location
            </th>

            <th>
              Date
            </th>

            <th>
              Migration
            </th>

          </tr>

        </thead>


        <tbody>


          {migrationData.length > 0 ? (

            migrationData.map(
              (item, index) => (

                <tr key={index}>

                  <td>
                    {item.species}
                  </td>

                  <td>
                    {item.previous_location}
                  </td>

                  <td>
                    {item.current_location}
                  </td>

                  <td>
                    {item.date}
                  </td>

                  <td>

                    {item.migration === "Yes" ? (

                      <span className="badge bg-danger">
                        Migrated
                      </span>

                    ) : (

                      <span className="badge bg-success">
                        Stable
                      </span>

                    )}

                  </td>

                </tr>

              )
            )

          ) : (

            <tr>

              <td
                colSpan="5"
                className="text-center"
              >
                No Migration Data
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  );

}


export default PopulationEstimation;
