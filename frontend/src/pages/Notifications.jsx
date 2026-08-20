import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaExclamationTriangle,
  FaSkullCrossbones,
  FaTree,
  FaChartLine,
  FaSatelliteDish,
  FaLeaf,
  FaSyncAlt,
} from "react-icons/fa";

import api from "../api/api";


const Notifications = () => {

  // =====================================================
  // STATE
  // =====================================================

  const [
    notifications,
    setNotifications
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    refreshing,
    setRefreshing
  ] = useState(false);

  const [
    generating,
    setGenerating
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    activeFilter,
    setActiveFilter
  ] = useState("ALL");


  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async (
    showLoader = true
  ) => {

    try {

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get(
        "/notifications"
      );

      setNotifications(
        response.data.notifications || []
      );

    } catch (err) {

      console.error(
        "Error loading notifications:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load notifications."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };


  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {

    fetchNotifications();

  }, []);


  // =====================================================
  // MARK SINGLE AS READ
  // =====================================================

  const markAsRead = async (
    notificationId
  ) => {

    try {

      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification
          )
      );

    } catch (err) {

      console.error(
        "Error marking notification as read:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to mark notification as read."
      );
    }
  };


  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {

    try {

      await api.patch(
        "/notifications/read-all"
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );

    } catch (err) {

      console.error(
        "Error marking all notifications as read:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to mark all notifications as read."
      );
    }
  };


  // =====================================================
  // GENERATE ALL ALERTS
  // =====================================================

  const generateAllAlerts = async () => {

    try {

      setGenerating(true);
      setError("");

      await api.post(
        "/notifications/generate-all"
      );

      await fetchNotifications(false);

    } catch (err) {

      console.error(
        "Error generating alerts:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to generate alerts."
      );

    } finally {

      setGenerating(false);
    }
  };


  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {

    await fetchNotifications(false);
  };


  // =====================================================
  // FILTER
  // =====================================================

  const filteredNotifications =
    useMemo(() => {

      if (activeFilter === "ALL") {
        return notifications;
      }

      if (activeFilter === "UNREAD") {

        return notifications.filter(
          (notification) =>
            !notification.is_read
        );
      }

      if (
        activeFilter === "CRITICAL"
        ||
        activeFilter === "HIGH"
        ||
        activeFilter === "MEDIUM"
        ||
        activeFilter === "INFO"
      ) {

        return notifications.filter(
          (notification) =>
            notification.severity
            === activeFilter
        );
      }

      return notifications;

    }, [
      notifications,
      activeFilter,
    ]);


  // =====================================================
  // COUNTS
  // =====================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  const criticalCount =
    notifications.filter(
      (notification) =>
        notification.severity
        === "CRITICAL"
    ).length;

  const highCount =
    notifications.filter(
      (notification) =>
        notification.severity
        === "HIGH"
    ).length;

  const mediumCount =
    notifications.filter(
      (notification) =>
        notification.severity
        === "MEDIUM"
    ).length;


  // =====================================================
  // ICON
  // =====================================================

  const getNotificationIcon = (
    type
  ) => {

    switch (type) {

      case "ENDANGERED_SPECIES":
        return (
          <FaSkullCrossbones />
        );

      case "POPULATION_DECLINE":
        return (
          <FaChartLine />
        );

      case "HABITAT_DEGRADATION":
        return (
          <FaTree />
        );

      case "MONITORING_DEVICE":
        return (
          <FaSatelliteDish />
        );

      case "CONSERVATION":
        return (
          <FaLeaf />
        );

      default:
        return (
          <FaBell />
        );
    }
  };


  // =====================================================
  // TYPE LABEL
  // =====================================================

  const getNotificationTypeLabel = (
    type
  ) => {

    switch (type) {

      case "ENDANGERED_SPECIES":
        return "Endangered Species";

      case "POPULATION_DECLINE":
        return "Population Decline";

      case "HABITAT_DEGRADATION":
        return "Habitat Degradation";

      case "MONITORING_DEVICE":
        return "Monitoring Device";

      case "CONSERVATION":
        return "Conservation";

      default:
        return "Notification";
    }
  };


  // =====================================================
  // SEVERITY CLASS
  // =====================================================

  const getSeverityClass = (
    severity
  ) => {

    switch (severity) {

      case "CRITICAL":
        return "danger";

      case "HIGH":
        return "warning";

      case "MEDIUM":
        return "info";

      case "INFO":
      default:
        return "secondary";
    }
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    value
  ) => {

    if (!value) {
      return "Unknown time";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="container py-5">

        <div className="text-center py-5">

          <div
            className="spinner-border text-success"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading notifications...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div
      className="container-fluid py-4"
      style={{
        background: "#f7faf8",
        minHeight: "100vh",
      }}
    >

      <div className="container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="card border-0 shadow-lg mb-4"
          style={{
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >

          <div
            className="p-4"
            style={{
              background:
                "linear-gradient(135deg, #198754, #087f5b)",
              color: "white",
            }}
          >

            <div
              className="
                d-flex
                justify-content-between
                align-items-center
                flex-wrap
                gap-3
              "
            >

              <div>

                <h2 className="fw-bold mb-1">

                  <FaBell className="me-2" />

                  Notification & Alert System

                </h2>

                <p className="mb-0 opacity-75">

                  Wildlife conservation alerts,
                  population monitoring and
                  habitat notifications

                </p>

              </div>


              <div
                className="
                  d-flex
                  flex-wrap
                  gap-2
                "
              >

                <button
                  className="btn btn-light"
                  onClick={
                    handleRefresh
                  }
                  disabled={
                    refreshing
                  }
                >

                  <FaSyncAlt
                    className={
                      refreshing
                        ? "me-2 fa-spin"
                        : "me-2"
                    }
                  />

                  Refresh

                </button>


                <button
                  className="btn btn-warning"
                  onClick={
                    generateAllAlerts
                  }
                  disabled={
                    generating
                  }
                >

                  <FaBell className="me-2" />

                  {generating
                    ? "Checking..."
                    : "Check Alerts"}

                </button>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            className="
              alert
              alert-danger
              d-flex
              justify-content-between
              align-items-center
            "
          >

            <span>
              {error}
            </span>

            <button
              className="btn-close"
              onClick={() =>
                setError("")
              }
            />

          </div>

        )}


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="row g-3 mb-4">

          {/* UNREAD */}

          <div className="col-md-3">

            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "18px",
              }}
            >

              <div className="card-body">

                <div
                  className="
                    d-flex
                    justify-content-between
                    align-items-center
                  "
                >

                  <div>

                    <p className="text-muted mb-1">
                      Unread
                    </p>

                    <h3 className="fw-bold mb-0">
                      {unreadCount}
                    </h3>

                  </div>

                  <div
                    className="
                      rounded-circle
                      bg-primary
                      bg-opacity-10
                      text-primary
                      p-3
                    "
                  >

                    <FaBell />

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* CRITICAL */}

          <div className="col-md-3">

            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "18px",
              }}
            >

              <div className="card-body">

                <div
                  className="
                    d-flex
                    justify-content-between
                    align-items-center
                  "
                >

                  <div>

                    <p className="text-muted mb-1">
                      Critical
                    </p>

                    <h3 className="fw-bold mb-0 text-danger">
                      {criticalCount}
                    </h3>

                  </div>

                  <div
                    className="
                      rounded-circle
                      bg-danger
                      bg-opacity-10
                      text-danger
                      p-3
                    "
                  >

                    <FaExclamationTriangle />

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* HIGH */}

          <div className="col-md-3">

            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "18px",
              }}
            >

              <div className="card-body">

                <div
                  className="
                    d-flex
                    justify-content-between
                    align-items-center
                  "
                >

                  <div>

                    <p className="text-muted mb-1">
                      High Priority
                    </p>

                    <h3 className="fw-bold mb-0 text-warning">
                      {highCount}
                    </h3>

                  </div>

                  <div
                    className="
                      rounded-circle
                      bg-warning
                      bg-opacity-10
                      text-warning
                      p-3
                    "
                  >

                    <FaExclamationTriangle />

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* MEDIUM */}

          <div className="col-md-3">

            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "18px",
              }}
            >

              <div className="card-body">

                <div
                  className="
                    d-flex
                    justify-content-between
                    align-items-center
                  "
                >

                  <div>

                    <p className="text-muted mb-1">
                      Medium
                    </p>

                    <h3 className="fw-bold mb-0 text-info">
                      {mediumCount}
                    </h3>

                  </div>

                  <div
                    className="
                      rounded-circle
                      bg-info
                      bg-opacity-10
                      text-info
                      p-3
                    "
                  >

                    <FaBell />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div
          className="card border-0 shadow-sm mb-4"
          style={{
            borderRadius: "18px",
          }}
        >

          <div className="card-body">

            <div
              className="
                d-flex
                justify-content-between
                align-items-center
                flex-wrap
                gap-3
              "
            >

              <div
                className="
                  d-flex
                  flex-wrap
                  gap-2
                "
              >

                <button
                  className={
                    `btn ${
                      activeFilter === "ALL"
                        ? "btn-success"
                        : "btn-outline-success"
                    }`
                  }
                  onClick={() =>
                    setActiveFilter("ALL")
                  }
                >
                  All
                </button>


                <button
                  className={
                    `btn ${
                      activeFilter === "UNREAD"
                        ? "btn-success"
                        : "btn-outline-success"
                    }`
                  }
                  onClick={() =>
                    setActiveFilter("UNREAD")
                  }
                >
                  Unread
                </button>


                <button
                  className={
                    `btn ${
                      activeFilter === "CRITICAL"
                        ? "btn-danger"
                        : "btn-outline-danger"
                    }`
                  }
                  onClick={() =>
                    setActiveFilter("CRITICAL")
                  }
                >
                  Critical
                </button>


                <button
                  className={
                    `btn ${
                      activeFilter === "HIGH"
                        ? "btn-warning"
                        : "btn-outline-warning"
                    }`
                  }
                  onClick={() =>
                    setActiveFilter("HIGH")
                  }
                >
                  High
                </button>


                <button
                  className={
                    `btn ${
                      activeFilter === "MEDIUM"
                        ? "btn-info"
                        : "btn-outline-info"
                    }`
                  }
                  onClick={() =>
                    setActiveFilter("MEDIUM")
                  }
                >
                  Medium
                </button>

              </div>


              {unreadCount > 0 && (

                <button
                  className="btn btn-outline-dark"
                  onClick={
                    markAllAsRead
                  }
                >

                  <FaCheckDouble className="me-2" />

                  Mark All as Read

                </button>

              )}

            </div>

          </div>

        </div>


        {/* =================================================
            NOTIFICATION LIST
        ================================================= */}

        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: "22px",
          }}
        >

          <div className="card-body p-4">

            <div
              className="
                d-flex
                justify-content-between
                align-items-center
                mb-4
              "
            >

              <h5 className="fw-bold mb-0">

                <FaBell className="me-2 text-success" />

                Alerts & Notifications

              </h5>

              <span className="text-muted">

                {filteredNotifications.length}
                {" "}
                notification
                {filteredNotifications.length !== 1
                  ? "s"
                  : ""}

              </span>

            </div>


            {filteredNotifications.length === 0 ? (

              <div
                className="
                  text-center
                  py-5
                  text-muted
                "
              >

                <FaBell
                  size={45}
                  className="mb-3 opacity-25"
                />

                <h5>
                  No notifications
                </h5>

                <p className="mb-0">
                  There are no alerts matching
                  the selected filter.
                </p>

              </div>

            ) : (

              <div
                className="
                  d-flex
                  flex-column
                  gap-3
                "
              >

                {filteredNotifications.map(
                  (notification) => {

                    const severityClass =
                      getSeverityClass(
                        notification.severity
                      );

                    return (

                      <div
                        key={
                          notification.id
                        }
                        className={
                          `p-3 rounded-4 border ${
                            !notification.is_read
                              ? "bg-light"
                              : ""
                          }`
                        }
                        style={{
                          borderLeft:
                            `5px solid var(--bs-${severityClass})`,
                        }}
                      >

                        <div
                          className="
                            d-flex
                            gap-3
                          "
                        >

                          {/* ICON */}

                          <div
                            className={
                              `rounded-circle
                               bg-${severityClass}
                               bg-opacity-10
                               text-${severityClass}
                               p-3
                               flex-shrink-0`
                            }
                            style={{
                              width: "52px",
                              height: "52px",
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >

                            {getNotificationIcon(
                              notification
                                .notification_type
                            )}

                          </div>


                          {/* CONTENT */}

                          <div
                            className="flex-grow-1"
                          >

                            <div
                              className="
                                d-flex
                                justify-content-between
                                align-items-start
                                gap-2
                              "
                            >

                              <div>

                                <h6
                                  className="fw-bold mb-1"
                                >
                                  {notification.title}
                                </h6>

                                <span
                                  className={
                                    `badge bg-${severityClass} me-2`
                                  }
                                >
                                  {notification.severity}
                                </span>

                                <span
                                  className="badge bg-light text-dark"
                                >
                                  {
                                    getNotificationTypeLabel(
                                      notification
                                        .notification_type
                                    )
                                  }
                                </span>

                              </div>


                              {!notification.is_read && (

                                <span
                                  className="
                                    badge
                                    bg-success
                                  "
                                >
                                  New
                                </span>

                              )}

                            </div>


                            <p
                              className="
                                text-muted
                                mb-2
                                mt-2
                              "
                            >
                              {
                                notification.message
                              }
                            </p>


                            {/* EXTRA DETAILS */}

                            <div
                              className="
                                small
                                text-muted
                                mb-2
                              "
                            >

                              {notification.habitat && (

                                <span className="me-3">

                                  <FaTree className="me-1" />

                                  Habitat:
                                  {" "}
                                  {
                                    notification.habitat
                                  }

                                </span>

                              )}


                              {notification.species_id && (

                                <span className="me-3">

                                  Species ID:
                                  {" "}
                                  {
                                    notification.species_id
                                  }

                                </span>

                              )}


                              {notification.survey_id && (

                                <span>

                                  Survey ID:
                                  {" "}
                                  {
                                    notification.survey_id
                                  }

                                </span>

                              )}

                            </div>


                            {/* FOOTER */}

                            <div
                              className="
                                d-flex
                                justify-content-between
                                align-items-center
                                flex-wrap
                                gap-2
                              "
                            >

                              <small
                                className="text-muted"
                              >
                                {
                                  formatDate(
                                    notification
                                      .created_at
                                  )
                                }
                              </small>


                              {!notification.is_read && (

                                <button
                                  className="
                                    btn
                                    btn-sm
                                    btn-outline-success
                                  "
                                  onClick={() =>
                                    markAsRead(
                                      notification.id
                                    )
                                  }
                                >

                                  <FaCheck className="me-1" />

                                  Mark as Read

                                </button>

                              )}

                            </div>

                          </div>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};


export default Notifications;