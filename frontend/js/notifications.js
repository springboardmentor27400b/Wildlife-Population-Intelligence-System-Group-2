// ============================================================
// WPIS - ROLE-BASED NOTIFICATION CENTER
// ============================================================

const NOTIFICATION_API_BASE =
    localStorage.getItem("wpis_api_base") ||
    "http://127.0.0.1:8000";

const notificationToken = () =>
    localStorage.getItem("wpis_token");

let notificationAlerts = [];


// ============================================================
// CURRENT USER / ROLE
// ============================================================

function getCurrentUser() {

    try {

        const raw =
            localStorage.getItem("wpis_user");

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);

    }

    catch (error) {

        console.error(
            "Unable to read WPIS user:",
            error
        );

        return null;

    }

}


function getCurrentRole() {

    const user =
        getCurrentUser();

    return user?.role || "wildlife_researcher";

}


// ============================================================
// ROLE LABEL
// ============================================================

function getRoleLabel(role) {

    const labels = {

        wildlife_researcher:
            "Research Notifications",

        conservation_officer:
            "Conservation Notifications",

        forest_department_officer:
            "Forest Department Notifications",

        administrator:
            "Platform Notifications"

    };


    return (
        labels[role] ||
        "WPIS Notifications"
    );

}


// ============================================================
// ROLE-BASED ALERT FILTER
// ============================================================

function filterAlertsForRole(
    alerts
) {

    const role =
        getCurrentRole();


    // --------------------------------------------------------
    // Administrator
    // --------------------------------------------------------
    // Admin gets the complete platform alert feed.

    if (
        role === "administrator"
    ) {

        return alerts;

    }


    // --------------------------------------------------------
    // Wildlife Researcher
    // --------------------------------------------------------
    // Focus on research, species and ecological changes.

    if (
        role === "wildlife_researcher"
    ) {

        const allowedCategories = new Set([

            "endangered_species",

            "population_decline",

            "habitat_degradation"

        ]);


        return alerts.filter(
            alert =>
                allowedCategories.has(
                    alert.category
                )
        );

    }


    // --------------------------------------------------------
    // Conservation Officer
    // --------------------------------------------------------
    // Focus on conservation action and ecological threats.

    if (
        role === "conservation_officer"
    ) {

        const allowedCategories = new Set([

            "endangered_species",

            "population_decline",

            "habitat_degradation",

            "conservation_notification"

        ]);


        return alerts.filter(
            alert =>
                allowedCategories.has(
                    alert.category
                )
        );

    }


    // --------------------------------------------------------
    // Forest Department Officer
    // --------------------------------------------------------
    // Focus on field, habitat, movement and monitoring issues.

    if (
        role === "forest_department_officer"
    ) {

        const allowedCategories = new Set([

            "endangered_species",

            "population_decline",

            "habitat_degradation",

            "monitoring_device"

        ]);


        return alerts.filter(
            alert =>
                allowedCategories.has(
                    alert.category
                )
        );

    }


    // --------------------------------------------------------
    // Fallback
    // --------------------------------------------------------

    return alerts;

}


// ============================================================
// API
// ============================================================

async function loadNotificationAlerts() {

    const response =
        await fetch(
            `${NOTIFICATION_API_BASE}/alerts/`,
            {
                headers:
                    notificationToken()
                        ? {
                            Authorization:
                                `Bearer ${notificationToken()}`
                        }
                        : {}
            }
        );


    if (
        response.status === 401
    ) {

        return [];

    }


    if (!response.ok) {

        throw new Error(
            "Unable to load notifications."
        );

    }


    const data =
        await response.json();


    return Array.isArray(
        data?.alerts
    )
        ? data.alerts
        : [];

}


// ============================================================
// HELPERS
// ============================================================

function notificationEscapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function notificationSeverityClass(
    severity
) {

    const value =
        String(
            severity || ""
        ).toLowerCase();


    if (
        value === "critical" ||
        value === "high"
    ) {

        return "notification-danger";

    }


    if (
        value === "medium" ||
        value === "moderate"
    ) {

        return "notification-warning";

    }


    return "notification-safe";

}


function notificationIcon(
    category
) {

    const icons = {

        endangered_species:
            "fa-shield-heart",

        population_decline:
            "fa-chart-line",

        habitat_degradation:
            "fa-tree",

        monitoring_device:
            "fa-satellite-dish",

        conservation_notification:
            "fa-bell"

    };


    return (
        icons[category] ||
        "fa-bell"
    );

}


function notificationCategoryLabel(
    category
) {

    const labels = {

        endangered_species:
            "Endangered Species",

        population_decline:
            "Population Decline",

        habitat_degradation:
            "Habitat Degradation",

        monitoring_device:
            "Monitoring Device",

        conservation_notification:
            "Conservation Notification"

    };


    return (
        labels[category] ||
        "Notification"
    );

}


// ============================================================
// CREATE NOTIFICATION CENTER
// ============================================================

function createNotificationCenter() {

    if (
        document.getElementById(
            "wpisNotificationCenter"
        )
    ) {

        return;

    }


    const header =
        document.querySelector(
            ".app-header"
        );


    if (!header) {

        console.warn(
            "WPIS notification center: .app-header not found."
        );

        return;

    }


    const userChip =
        header.querySelector(
            ".user-chip"
        );


    const center =
        document.createElement(
            "div"
        );


    center.id =
        "wpisNotificationCenter";


    center.className =
        "wpis-notification-center";


    center.innerHTML = `

        <button
            type="button"
            class="wpis-notification-button"
            id="wpisNotificationButton"
            aria-label="Notifications"
            aria-expanded="false"
        >

            <i class="fa-solid fa-bell"></i>

            <span
                class="wpis-notification-badge is-hidden"
                id="wpisNotificationBadge"
            >
                0
            </span>

        </button>


        <div
            class="wpis-notification-dropdown"
            id="wpisNotificationDropdown"
            hidden
        >

            <div class="wpis-notification-header">

                <div>

                    <strong>
                        Notifications
                    </strong>

                    <small
                        id="wpisNotificationCountLabel"
                    >
                        Updating...
                    </small>

                </div>

                <i class="fa-solid fa-bell"></i>

            </div>


            <div
                class="wpis-notification-list"
                id="wpisNotificationList"
            >

                <div class="wpis-notification-loading">

                    <i class="fa-solid fa-circle-notch fa-spin"></i>

                    Updating notifications...

                </div>

            </div>


            <a
                href="alerts.html"
                class="wpis-notification-footer"
            >

                View all notifications

                <i class="fa-solid fa-arrow-right"></i>

            </a>

        </div>

    `;


    // Put the bell before the user chip.

    if (userChip) {

        header.insertBefore(
            center,
            userChip
        );

    }

    else {

        header.appendChild(
            center
        );

    }


    // ========================================================
    // TOGGLE DROPDOWN
    // ========================================================

    const button =
        document.getElementById(
            "wpisNotificationButton"
        );


    const dropdown =
        document.getElementById(
            "wpisNotificationDropdown"
        );


    if (
        button &&
        dropdown
    ) {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const isOpen =
                    !dropdown.hasAttribute(
                        "hidden"
                    );


                if (isOpen) {

                    dropdown.setAttribute(
                        "hidden",
                        ""
                    );

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

                else {

                    dropdown.removeAttribute(
                        "hidden"
                    );

                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }

            }
        );


        document.addEventListener(
            "click",
            event => {

                if (
                    !center.contains(
                        event.target
                    )
                ) {

                    dropdown.setAttribute(
                        "hidden",
                        ""
                    );

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    }

}


// ============================================================
// SORT ALERTS
// ============================================================

function sortNotificationAlerts(
    alerts
) {

    const severityOrder = {

        critical: 4,

        high: 3,

        medium: 2,

        moderate: 2,

        low: 1

    };


    return [...alerts]
        .sort(
            (a, b) => {

                const aSeverity =
                    severityOrder[
                        String(
                            a.severity || ""
                        ).toLowerCase()
                    ] || 0;


                const bSeverity =
                    severityOrder[
                        String(
                            b.severity || ""
                        ).toLowerCase()
                    ] || 0;


                return (
                    bSeverity -
                    aSeverity
                );

            }
        );

}


// ============================================================
// RENDER NOTIFICATIONS
// ============================================================

function renderNotificationCenter() {

    const list =
        document.getElementById(
            "wpisNotificationList"
        );


    const badge =
        document.getElementById(
            "wpisNotificationBadge"
        );


    const countLabel =
        document.getElementById(
            "wpisNotificationCountLabel"
        );


    if (
        !list ||
        !badge ||
        !countLabel
    ) {

        return;

    }


    const sortedAlerts =
        sortNotificationAlerts(
            notificationAlerts
        );


    const count =
        sortedAlerts.length;


    const role =
        getCurrentRole();


    const roleLabel =
        getRoleLabel(
            role
        );


    // --------------------------------------------------------
    // Badge
    // --------------------------------------------------------

    badge.textContent =
        count > 99
            ? "99+"
            : count;


    badge.classList.toggle(
        "is-hidden",
        count === 0
    );


    // --------------------------------------------------------
    // Count label
    // --------------------------------------------------------

    if (count === 0) {

        countLabel.textContent =
            `No active ${roleLabel.toLowerCase()}`;

    }

    else if (count === 1) {

        countLabel.textContent =
            `1 ${roleLabel.toLowerCase()}`;

    }

    else {

        countLabel.textContent =
            `${count} ${roleLabel.toLowerCase()}`;

    }


    // --------------------------------------------------------
    // No alerts
    // --------------------------------------------------------

    if (!count) {

        list.innerHTML = `

            <div class="wpis-notification-empty">

                <i class="fa-solid fa-shield-check"></i>

                <strong>
                    All clear
                </strong>

                <span>
                    No notifications currently require
                    attention for your role.
                </span>

            </div>

        `;

        return;

    }


    // --------------------------------------------------------
    // Latest 5
    // --------------------------------------------------------

    list.innerHTML =
        sortedAlerts
            .slice(0, 5)
            .map(
                alert => {

                    const severity =
                        String(
                            alert.severity ||
                            "Low"
                        );


                    const severityClass =
                        notificationSeverityClass(
                            severity
                        );


                    const category =
                        notificationCategoryLabel(
                            alert.category
                        );


                    return `

                        <div
                            class="wpis-notification-item ${severityClass}"
                        >

                            <div
                                class="wpis-notification-icon"
                            >

                                <i
                                    class="fa-solid ${notificationIcon(
                                        alert.category
                                    )}"
                                ></i>

                            </div>


                            <div
                                class="wpis-notification-content"
                            >

                                <strong>

                                    ${notificationEscapeHTML(
                                        alert.title
                                    )}

                                </strong>


                                <span>

                                    ${notificationEscapeHTML(
                                        category
                                    )}

                                    ${
                                        alert.species
                                            ? ` · ${notificationEscapeHTML(
                                                alert.species
                                            )}`
                                            : ""
                                    }

                                </span>


                                ${
                                    alert.location
                                        ? `

                                            <small>

                                                <i
                                                    class="fa-solid fa-location-dot"
                                                ></i>

                                                ${notificationEscapeHTML(
                                                    alert.location
                                                )}

                                            </small>

                                        `
                                        : ""
                                }

                            </div>


                            <span
                                class="wpis-notification-severity"
                            >

                                ${notificationEscapeHTML(
                                    severity
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


// ============================================================
// REFRESH NOTIFICATIONS
// ============================================================

async function refreshNotificationCenter() {

    try {

        const allAlerts =
            await loadNotificationAlerts();


        // Apply role-specific filtering.

        notificationAlerts =
            filterAlertsForRole(
                allAlerts
            );


        renderNotificationCenter();

    }

    catch (error) {

        console.error(
            "WPIS notification center error:",
            error
        );


        const list =
            document.getElementById(
                "wpisNotificationList"
            );


        if (list) {

            list.innerHTML = `

                <div class="wpis-notification-empty">

                    <i
                        class="fa-solid fa-triangle-exclamation"
                    ></i>

                    <strong>
                        Notifications unavailable
                    </strong>

                    <span>
                        Unable to retrieve current role-specific notifications.
                    </span>

                </div>

            `;

        }

    }

}


// ============================================================
// AUTO REFRESH
// ============================================================

function startNotificationRefresh() {

    setInterval(
        refreshNotificationCenter,
        60000
    );

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        createNotificationCenter();

        await refreshNotificationCenter();

        startNotificationRefresh();

    }
);