// ============================================================
// WPIS - NOTIFICATIONS & ALERTS
// ============================================================

const API_BASE =
    localStorage.getItem("wpis_api_base") ||
    "http://127.0.0.1:8000";


const token = () =>
    localStorage.getItem("wpis_token");


let alerts = [];


// ============================================================
// API
// ============================================================

async function api(path) {

    const response = await fetch(
        `${API_BASE}${path}`,
        {
            headers: token()
                ? {
                    Authorization:
                        `Bearer ${token()}`
                }
                : {}
        }
    );


    if (response.status === 401) {

        localStorage.removeItem(
            "wpis_token"
        );

        localStorage.removeItem(
            "wpis_user"
        );

        window.location.href =
            "login.html";

        return null;
    }


    if (!response.ok) {

        throw new Error(
            "Unable to load notification data."
        );
    }


    return response.json();
}


// ============================================================
// HELPERS
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function severityClass(
    severity
) {

    const value =
        String(
            severity || ""
        ).toLowerCase();


    if (value === "critical") {
        return "status-danger";
    }


    if (value === "high") {
        return "status-danger";
    }


    if (
        value === "medium" ||
        value === "moderate"
    ) {
        return "status-warning";
    }


    return "status-safe";
}


function categoryLabel(
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
            "Conservation Notification",

    };


    return (
        labels[category] ||
        "Notification"
    );
}


function categoryIcon(
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
            "fa-bell",

    };


    return (
        icons[category] ||
        "fa-bell"
    );
}


// ============================================================
// SUMMARY
// ============================================================

function updateSummary() {

    const total =
        alerts.length;


    const critical =
        alerts.filter(
            alert =>
                String(
                    alert.severity
                ).toLowerCase()
                === "critical"
        ).length;


    const high =
        alerts.filter(
            alert =>
                String(
                    alert.severity
                ).toLowerCase()
                === "high"
        ).length;


    const habitat =
        alerts.filter(
            alert =>
                alert.category ===
                "habitat_degradation"
        ).length;


    document.getElementById(
        "totalAlerts"
    ).textContent =
        total;


    document.getElementById(
        "criticalAlerts"
    ).textContent =
        critical;


    document.getElementById(
        "highAlerts"
    ).textContent =
        high;


    document.getElementById(
        "habitatAlerts"
    ).textContent =
        habitat;
}


// ============================================================
// RENDER ALERTS
// ============================================================

function renderAlerts() {

    const container =
        document.getElementById(
            "alertsList"
        );


    const category =
        document.getElementById(
            "categoryFilter"
        ).value;


    const severity =
        document.getElementById(
            "severityFilter"
        ).value;


    const filtered =
        alerts.filter(alert => {

            const categoryMatches =
                category === "all" ||
                alert.category === category;


            const severityMatches =
                severity === "all" ||
                String(
                    alert.severity
                ).toLowerCase()
                === severity;


            return (
                categoryMatches &&
                severityMatches
            );
        });


    if (!filtered.length) {

        container.innerHTML = `

            <article class="panel">

                <div class="ai-empty-state">

                    <i class="fa-solid fa-shield-check"></i>

                    <strong>
                        No matching alerts
                    </strong>

                    <span>
                        Current WPIS data does not contain
                        alerts matching this filter.
                    </span>

                </div>

            </article>

        `;

        return;
    }


    container.innerHTML =
        filtered
            .map(alert => `

                <article class="panel">

                    <div class="panel-heading">

                        <div>

                            <h2>

                                <i
                                    class="fa-solid ${categoryIcon(
                                        alert.category
                                    )}"
                                ></i>

                                ${escapeHTML(
                                    alert.title
                                )}

                            </h2>

                            <p
                                class="panel-subtitle"
                            >

                                ${escapeHTML(
                                    categoryLabel(
                                        alert.category
                                    )
                                )}

                                ·

                                ${escapeHTML(
                                    alert.source
                                )}

                            </p>

                        </div>


                        <span
                            class="wildlife-status ${severityClass(
                                alert.severity
                            )}"
                        >

                            ${escapeHTML(
                                alert.severity
                            )}

                        </span>

                    </div>


                    <p>

                        ${escapeHTML(
                            alert.message
                        )}

                    </p>


                    ${
                        alert.species
                            ? `

                                <p>

                                    <strong>
                                        Species:
                                    </strong>

                                    ${escapeHTML(
                                        alert.species
                                    )}

                                </p>

                            `
                            : ""
                    }


                    ${
                        alert.location
                            ? `

                                <p>

                                    <strong>
                                        Location:
                                    </strong>

                                    ${escapeHTML(
                                        alert.location
                                    )}

                                </p>

                            `
                            : ""
                    }


                    <small>

                        <i class="fa-regular fa-clock"></i>

                        ${escapeHTML(
                            alert.created_at
                        )}

                    </small>

                </article>

            `)
            .join("");
}


// ============================================================
// LOAD ALERTS
// ============================================================

async function loadAlerts() {

    const container =
        document.getElementById(
            "alertsList"
        );


    container.innerHTML = `

        <article class="panel">

            <div class="loading-text">
                Updating WPIS alerts...
            </div>

        </article>

    `;


    try {

        const data =
            await api(
                "/alerts/"
            );


        alerts =
            Array.isArray(
                data?.alerts
            )
                ? data.alerts
                : [];


        updateSummary();

        renderAlerts();


    }

    catch (error) {

        console.error(
            "Alert loading error:",
            error
        );


        container.innerHTML = `

            <article class="panel">

                <div class="ai-empty-state">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <strong>
                        Alert system unavailable
                    </strong>

                    <span>
                        ${escapeHTML(
                            error.message
                        )}
                    </span>

                </div>

            </article>

        `;

    }

}


// ============================================================
// FILTERS
// ============================================================

document
    .getElementById(
        "categoryFilter"
    )
    .addEventListener(
        "change",
        renderAlerts
    );


document
    .getElementById(
        "severityFilter"
    )
    .addEventListener(
        "change",
        renderAlerts
    );


// ============================================================
// REFRESH
// ============================================================

document
    .getElementById(
        "refreshAlerts"
    )
    .addEventListener(
        "click",
        loadAlerts
    );


// ============================================================
// MOBILE MENU
// ============================================================

const menuButton =
    document.getElementById(
        "menuButton"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );


if (
    menuButton &&
    sidebar
) {

    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


// ============================================================
// LOGOUT
// ============================================================

document
    .querySelectorAll(
        "[data-logout]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                localStorage.removeItem(
                    "wpis_token"
                );

                localStorage.removeItem(
                    "wpis_user"
                );

                window.location.href =
                    "login.html";

            }
        );

    });


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateAlertsDashboardLink();

        loadAlerts();

    }
);

// ============================================================
// ROLE-BASED DASHBOARD LINK
// ============================================================

function updateAlertsDashboardLink() {

    const link =
        document.getElementById(
            "alertsDashboardLink"
        );

    if (!link) return;


    let user = null;

    try {

        user =
            JSON.parse(
                localStorage.getItem(
                    "wpis_user"
                )
            );

    } catch {

        user = null;

    }


    const dashboards = {

        wildlife_researcher:
            "researcher-dashboard.html",

        conservation_officer:
            "conservation-officer-dashboard.html",

        forest_department_officer:
            "forest-dashboard.html",

        administrator:
            "admin-dashboard.html"

    };


    link.href =
        dashboards[user?.role] ||
        "researcher-dashboard.html";

}