import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
} from "react-leaflet";

import {
  FaMapMarkedAlt,
  FaSearch,
  FaPaw,
  FaTree,
  FaExclamationTriangle,
  FaEye,
  FaTimes,
} from "react-icons/fa";

import "leaflet/dist/leaflet.css";
import "./Map.css";

function Map() {
  const [animals, setAnimals] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  useEffect(() => {
    fetch("/data/wildlife_data.json")
      .then((res) => res.json())
      .then((data) => setAnimals(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.log("Unable to load wildlife map data:", err);
        setAnimals([]);
      });
  }, []);

  // =========================
  // SUMMARY
  // =========================

  const total = animals.length;

  const healthy = animals.filter(
    (item) => item.status === "Healthy"
  ).length;

  const monitoring = animals.filter(
    (item) => item.status === "Monitoring"
  ).length;

  const endangered = animals.filter(
    (item) => item.status === "Endangered"
  ).length;

  // =========================
  // SEARCH
  // =========================

  const filteredAnimals = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return animals;

    return animals.filter((item) => {
      return (
        item.species?.toLowerCase().includes(query) ||
        item.forest?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query) ||
        item.cameraId?.toLowerCase().includes(query)
      );
    });
  }, [animals, search]);

  // =========================
  // COLORS
  // =========================

  const getColor = (status) => {
    if (status === "Healthy") return "#16a34a";

    if (status === "Monitoring") return "#f59e0b";

    if (status === "Endangered") return "#dc2626";

    return "#64748b";
  };

  // =========================
  // STATUS ICON
  // =========================

  const getStatusIcon = (status) => {
    if (status === "Healthy") return "🟢";

    if (status === "Monitoring") return "🟠";

    if (status === "Endangered") return "🔴";

    return "⚪";
  };

  return (
    <div className="map-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="map-header">

        <div className="map-title">

          <div className="map-title-icon">
            <FaMapMarkedAlt />
          </div>

          <div>
            <h1>Wildlife GIS Monitoring</h1>

            <p>
              Location-based wildlife monitoring
              and habitat visualization
            </p>
          </div>

        </div>

        <div className="map-period">
          <FaEye />
          Wildlife Monitoring Map
        </div>

      </div>


      {/* =========================
          SEARCH
      ========================= */}

      <div className="map-toolbar">

        <div className="map-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search species, forest, status or camera..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >
              <FaTimes />
            </button>
          )}

        </div>

        <div className="map-result-count">
          Showing <strong>{filteredAnimals.length}</strong>{" "}
          locations
        </div>

      </div>


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="map-summary-grid">

        <div className="map-summary-card total">

          <div className="map-card-icon">
            <FaPaw />
          </div>

          <div>
            <span>Total Records</span>
            <h2>{total}</h2>
            <small>Wildlife locations</small>
          </div>

        </div>


        <div className="map-summary-card healthy">

          <div className="map-card-icon">
            <FaTree />
          </div>

          <div>
            <span>Healthy</span>
            <h2>{healthy}</h2>
            <small>Healthy locations</small>
          </div>

        </div>


        <div className="map-summary-card monitoring">

          <div className="map-card-icon">
            <FaEye />
          </div>

          <div>
            <span>Monitoring</span>
            <h2>{monitoring}</h2>
            <small>Needs observation</small>
          </div>

        </div>


        <div className="map-summary-card endangered">

          <div className="map-card-icon">
            <FaExclamationTriangle />
          </div>

          <div>
            <span>Endangered</span>
            <h2>{endangered}</h2>
            <small>Priority locations</small>
          </div>

        </div>

      </div>


      {/* =========================
          MAP SECTION
      ========================= */}

      <div className="gis-section">

        <div className="gis-header">

          <div>
            <h2>
              <FaMapMarkedAlt />
              Wildlife Location Map
            </h2>

            <p>
              Click a location to view wildlife
              monitoring information.
            </p>
          </div>

          <div className="gis-legend">

            <span>
              <i className="legend-dot healthy-dot"></i>
              Healthy
            </span>

            <span>
              <i className="legend-dot monitoring-dot"></i>
              Monitoring
            </span>

            <span>
              <i className="legend-dot endangered-dot"></i>
              Endangered
            </span>

          </div>

        </div>


        <div className="map-wrapper">

          <MapContainer
            center={[19.7515, 75.7139]}
            zoom={7}
            zoomControl={false}
            className="wildlife-map"
          >

            <ZoomControl position="topright" />

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredAnimals.map((item, index) => {

              const latitude = Number(
                item.latitude
              );

              const longitude = Number(
                item.longitude
              );

              if (
                Number.isNaN(latitude) ||
                Number.isNaN(longitude)
              ) {
                return null;
              }

              const color = getColor(
                item.status
              );

              return (
                <CircleMarker
                  key={
                    item.id ||
                    `${item.species}-${index}`
                  }
                  center={[
                    latitude,
                    longitude,
                  ]}
                  radius={10}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.85,
                    weight: 3,
                  }}
                  eventHandlers={{
                    click: () =>
                      setSelectedAnimal(item),
                  }}
                >

                  <Popup>

                    <div className="map-popup">

                      <h3>
                        {getStatusIcon(
                          item.status
                        )}{" "}
                        {item.species}
                      </h3>

                      <div className="popup-status">
                        {item.status}
                      </div>

                      <div className="popup-row">
                        <strong>Forest</strong>
                        <span>
                          {item.forest || "-"}
                        </span>
                      </div>

                      <div className="popup-row">
                        <strong>Camera ID</strong>
                        <span>
                          {item.cameraId || "-"}
                        </span>
                      </div>

                      <div className="popup-row">
                        <strong>Detection</strong>
                        <span>
                          {item.detectionType || "-"}
                        </span>
                      </div>

                      <div className="popup-row">
                        <strong>AI Confidence</strong>
                        <span>
                          {item.confidence ?? "-"}%
                        </span>
                      </div>

                      <div className="popup-row">
                        <strong>Population</strong>
                        <span>
                          {item.population ?? "-"}
                        </span>
                      </div>

                      <div className="popup-row">
                        <strong>Health</strong>
                        <span>
                          {item.health ?? "-"}%
                        </span>
                      </div>

                      <div className="popup-row">
                        <strong>Disease</strong>
                        <span>
                          {item.disease || "None"}
                        </span>
                      </div>

                    </div>

                  </Popup>

                </CircleMarker>
              );
            })}

          </MapContainer>

        </div>

      </div>


      {/* =========================
          SELECTED LOCATION
      ========================= */}

      {selectedAnimal && (

        <div className="selected-location">

          <div className="selected-location-header">

            <div>
              <span>
                Selected Monitoring Location
              </span>

              <h2>
                {selectedAnimal.species}
              </h2>
            </div>

            <button
              onClick={() =>
                setSelectedAnimal(null)
              }
            >
              <FaTimes />
            </button>

          </div>


          <div className="selected-grid">

            <div>
              <span>Forest</span>
              <strong>
                {selectedAnimal.forest || "-"}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                {getStatusIcon(
                  selectedAnimal.status
                )}{" "}
                {selectedAnimal.status || "-"}
              </strong>
            </div>

            <div>
              <span>AI Confidence</span>
              <strong>
                {selectedAnimal.confidence ?? "-"}%
              </strong>
            </div>

            <div>
              <span>Population</span>
              <strong>
                {selectedAnimal.population ?? "-"}
              </strong>
            </div>

            <div>
              <span>Health</span>
              <strong>
                {selectedAnimal.health ?? "-"}%
              </strong>
            </div>

            <div>
              <span>Camera</span>
              <strong>
                {selectedAnimal.cameraId || "-"}
              </strong>
            </div>

          </div>

        </div>

      )}


      {/* =========================
          EMPTY STATE
      ========================= */}

      {animals.length > 0 &&
        filteredAnimals.length === 0 && (

          <div className="map-empty">

            <FaSearch />

            <h3>No wildlife records found</h3>

            <p>
              Try searching with another species,
              forest or monitoring status.
            </p>

          </div>
        )}

    </div>
  );
}

export default Map;