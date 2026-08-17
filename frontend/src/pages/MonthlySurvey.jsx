import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaPaw,
  FaExclamationTriangle,
  FaRobot,
  FaHeartbeat,
} from "react-icons/fa";

import API from "../services/api";
import "./MonthlySurvey.css";

function MonthlySurvey() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMonthlyData = async () => {
      try {
        const res = await API.get("/detection");

        const data = res.data?.data || [];

        if (!cancelled) {
          setRecords(data);
        }
      } catch (error) {
        console.error("Failed to load monthly survey data", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMonthlyData();

    return () => {
      cancelled = true;
    };
  }, []);

  const monthlyData = useMemo(() => {
    const today = new Date();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const filtered = records.filter((item) => {
      const dateValue =
        item.createdAt ||
        item.date ||
        item.created_at;

      if (!dateValue) return false;

      const recordDate = new Date(dateValue);

      return (
        recordDate >= thirtyDaysAgo &&
        recordDate <= today
      );
    });

    const totalRecords = filtered.length;

    const totalAnimals = filtered.reduce(
      (sum, item) =>
        sum + Number(item.animalCount || 0),
      0
    );

    const endangeredCount = filtered.filter(
      (item) =>
        item.endangeredStatus === "Endangered"
    ).length;

    const averageConfidence =
      totalRecords > 0
        ? (
            filtered.reduce(
              (sum, item) =>
                sum + Number(item.confidence || 0),
              0
            ) / totalRecords
          ).toFixed(1)
        : "0.0";

    const averageHealth =
      totalRecords > 0
        ? (
            filtered.reduce(
              (sum, item) =>
                sum + Number(item.health || 0),
              0
            ) / totalRecords
          ).toFixed(1)
        : "0.0";

    const species = {};

    filtered.forEach((item) => {
      const name =
        item.speciesName || "Unknown";

      species[name] =
        (species[name] || 0) + 1;
    });

    return {
      filtered,
      totalRecords,
      totalAnimals,
      endangeredCount,
      averageConfidence,
      averageHealth,
      species,
    };
  }, [records]);

  if (loading) {
    return (
      <div className="monthly-loading">
        Loading monthly wildlife survey...
      </div>
    );
  }

  return (
    <div className="monthly-page">

      {/* HEADER */}

      <div className="monthly-header">

        <div>
          <h1>
            <FaCalendarAlt />
            Monthly Wildlife Survey
          </h1>

          <p>
            AI-based wildlife analysis for the
            previous 30 days
          </p>
        </div>

        <div className="month-badge">
          Previous 30 Days
        </div>

      </div>

      {/* SUMMARY */}

      <div className="monthly-cards">

        <SummaryCard
          icon={<FaPaw />}
          title="Total Detections"
          value={monthlyData.totalRecords}
          color="#2d6a4f"
        />

        <SummaryCard
          icon={<FaPaw />}
          title="Animals Detected"
          value={monthlyData.totalAnimals}
          color="#40916c"
        />

        <SummaryCard
          icon={<FaExclamationTriangle />}
          title="Endangered"
          value={monthlyData.endangeredCount}
          color="#e63946"
        />

        <SummaryCard
          icon={<FaRobot />}
          title="AI Confidence"
          value={`${monthlyData.averageConfidence}%`}
          color="#6a4c93"
        />

        <SummaryCard
          icon={<FaHeartbeat />}
          title="Average Health"
          value={`${monthlyData.averageHealth}%`}
          color="#f4a261"
        />

      </div>

      {/* SURVEY INFORMATION */}

      <div className="survey-grid">

        {/* SPECIES */}

        <div className="survey-card">

          <h2>Species Classification</h2>

          {Object.keys(monthlyData.species).length === 0 ? (
            <p className="empty">
              No wildlife records found
              for the previous 30 days.
            </p>
          ) : (
            Object.entries(monthlyData.species)
              .sort((a, b) => b[1] - a[1])
              .map(([species, count]) => {

                const max =
                  Math.max(
                    ...Object.values(
                      monthlyData.species
                    )
                  );

                const percentage =
                  (count / max) * 100;

                return (
                  <div
                    className="species-row"
                    key={species}
                  >

                    <div className="species-header">

                      <span>
                        {species}
                      </span>

                      <strong>
                        {count}
                      </strong>

                    </div>

                    <div className="bar-background">

                      <div
                        className="bar"
                        style={{
                          width:
                            `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              })
          )}

        </div>

        {/* AI SUMMARY */}

        <div className="survey-card">

          <h2>AI Survey Summary</h2>

          <div className="survey-info">

            <div>
              <span>
                Survey Period
              </span>

              <strong>
                Previous 30 Days
              </strong>
            </div>

            <div>
              <span>
                Records Analyzed
              </span>

              <strong>
                {monthlyData.totalRecords}
              </strong>
            </div>

            <div>
              <span>
                AI Confidence
              </span>

              <strong>
                {monthlyData.averageConfidence}%
              </strong>
            </div>

            <div>
              <span>
                Endangered Records
              </span>

              <strong className="danger">
                {monthlyData.endangeredCount}
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* STATUS MESSAGE */}

      <div className="survey-status">

        <FaRobot />

        <div>

          <strong>
            AI Classification Survey
          </strong>

          <p>
            The dashboard analyzes wildlife
            detection records from the previous
            30 days and summarizes species,
            population, health, endangered status,
            and AI confidence.
          </p>

        </div>

      </div>

    </div>
  );
}


/* SUMMARY CARD */

function SummaryCard({
  icon,
  title,
  value,
  color,
}) {
  return (
    <div className="summary-card">

      <div
        className="summary-icon"
        style={{
          background: color,
        }}
      >
        {icon}
      </div>

      <div>

        <p>
          {title}
        </p>

        <h2>
          {value}
        </h2>

      </div>

    </div>
  );
}

export default MonthlySurvey;