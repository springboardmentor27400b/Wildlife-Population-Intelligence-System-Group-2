// ============================================================
// WPIS - FOREST DEPARTMENT DASHBOARD
// ============================================================

const API_BASE =
    localStorage.getItem("wpis_api_base") ||
    "http://127.0.0.1:8000";

const token = () =>
    localStorage.getItem("wpis_token");


// ============================================================
// API HELPER
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

        localStorage.removeItem("wpis_token");
        localStorage.removeItem("wpis_user");

        window.location.href = "login.html";

        return null;
    }


    if (!response.ok) {

        let message =
            "Unable to load forest department data.";

        try {

            const data =
                await response.json();

            message =
                data.detail ||
                message;

        } catch {

            // Ignore parsing failure
        }

        throw new Error(message);
    }


    return response.json();
}


// ============================================================
// HELPERS
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent =
        value ?? "--";
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatValue(
    value,
    fallback = "Not available"
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return fallback;
    }

    return value;
}


function getPriorityClass(value) {

    const text =
        String(value ?? "")
            .toLowerCase();


    if (
        text.includes("critical") ||
        text.includes("high")
    ) {

        return "status-danger";

    }


    if (
        text.includes("medium") ||
        text.includes("moderate")
    ) {

        return "status-warning";

    }


    if (
        text.includes("low")
    ) {

        return "status-safe";

    }


    return "status-neutral";
}


function emptyState(
    icon,
    title,
    message
) {

    return `

        <div class="ai-empty-state">

            <i class="fa-solid ${icon}"></i>

            <strong>
                ${title}
            </strong>

            <span>
                ${message}
            </span>

        </div>

    `;
}


function errorState(message) {

    return `

        <div class="ai-empty-state">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <strong>
                Data unavailable
            </strong>

            <span>
                ${escapeHTML(message)}
            </span>

        </div>

    `;
}


// ============================================================
// SIDEBAR
// ============================================================

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");


if (menuButton && sidebar) {

    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("open");

        }
    );
}


// ============================================================
// LOGOUT
// ============================================================

document
    .querySelectorAll("[data-logout]")
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
// PROTECTED AREA MONITORING
// ============================================================

async function loadProtectedAreas() {

    const container =
        document.getElementById(
            "protectedAreaData"
        );

    if (!container) return;

    try {

        const data =
            await api("/monitoring/");

        const sites =
            Array.isArray(data)
                ? data
                : data?.items || [];


        // ----------------------------------------------------
        // COUNTS
        // ----------------------------------------------------

        setText(
            "monitoringSiteCount",
            sites.length
        );

        setText(
            "protectedAreaCount",
            sites.length
        );


        // ----------------------------------------------------
        // EMPTY STATE
        // ----------------------------------------------------

        if (!sites.length) {

            container.innerHTML =
                emptyState(
                    "fa-shield-halved",
                    "No Monitoring Sites",
                    "No protected-area monitoring records are currently available."
                );

            return;
        }


        // ----------------------------------------------------
        // RENDER MONITORING SITES
        // ----------------------------------------------------

        container.innerHTML =
            sites
                .slice(0, 10)
                .map(site => {

                    // ----------------------------------------
                    // LOCATION / AREA NAME
                    // ----------------------------------------

                   const areaName =
                        site.site_name ||
                        site.location ||
                        "Protected Area";

                    const monitoringLocation =
                        site.location ||
                        "Monitoring site";



                    // ----------------------------------------
                    // HABITAT
                    // ----------------------------------------

                    const habitat =
                        site.habitat_type ||
                        site.habitatType ||
                        site.habitat ||
                        "Not available";

                    // ----------------------------------------
                    // GPS
                    // ----------------------------------------

                    const latitude =
                        site.gps_coordinates?.latitude ??
                        site.gpsCoordinates?.latitude ??
                        site.latitude;

                    const longitude =
                        site.gps_coordinates?.longitude ??
                        site.gpsCoordinates?.longitude ??
                        site.longitude;


                    const gps =
                        latitude !== undefined &&
                        latitude !== null &&
                        longitude !== undefined &&
                        longitude !== null
                            ? `${latitude}, ${longitude}`
                            : "Not available";


                    // ----------------------------------------
                    // CARD
                    // ----------------------------------------

                    return `

                        <div class="mini-item">

                            <div class="panel-heading">

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            formatValue(
                                                areaName,
                                                "Protected Area"
                                            )
                                        )}
                                    </strong>

                                    <small>
                                        ${escapeHTML(
                                            formatValue(
                                                monitoringLocation,
                                                "Monitoring site"
                                            )
                                        )}
                                    </small>

                                </div>

                                <span
                                    class="wildlife-status status-safe"
                                >
                                    Active Site
                                </span>

                            </div>


                            <p>

                                <strong>
                                    Habitat:
                                </strong>

                                ${escapeHTML(
                                    formatValue(
                                        habitat
                                    )
                                )}

                            </p>


                            <p>
                            <strong>
                            Area:
                            </strong>
                            ${escapeHTML(
                            formatValue(
                            site.area_km2,
                            "Not available"
                            )
                            )} km²
                            </p>


                            <p>
                            <strong>
                            Status:
                            </strong>
                           Protected Area
                            </p>


                            <p>

                                <strong>
                                    GPS:
                                </strong>

                                ${escapeHTML(
                                    gps
                                )}

                            </p>

                        </div>

                    `;

                })
                .join("");

    }


    catch (error) {

        console.error(
            "Protected area monitoring error:",
            error
        );


        setText(
            "monitoringSiteCount",
            0
        );


        setText(
            "protectedAreaCount",
            0
        );


        container.innerHTML =
            errorState(
                "Unable to load monitoring sites."
            );

    }

}


// ============================================================
// WILDLIFE MOVEMENT ANALYSIS
// ============================================================

async function loadWildlifeMovement() {

    const container =
        document.getElementById(
            "movementData"
        );


    if (!container) return;


    try {

        const data =
            await api(
                "/population/migration"
            );


        const movement =
            Array.isArray(
                data?.species_movement
            )
                ? data.species_movement
                : [];


        setText(
            "movementSpeciesCount",
            movement.length
        );


        if (!movement.length) {

            container.innerHTML =
                emptyState(
                    "fa-route",
                    "No Movement Data",
                    "Species movement information is not currently available."
                );

            return;
        }


        container.innerHTML =
            movement
                .slice(0, 10)
                .map(item => {

                    const migrationDetected =
                        Boolean(
                            item.migration_detected
                        );


                    return `

                        <div class="mini-item">

                            <div class="panel-heading">

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            formatValue(
                                                item.species
                                            )
                                        )}
                                    </strong>

                                    <small>
                                    ${
                                        formatValue(
                                        item.locations_visited,
                                        "0"
                                    )
                                }
                                ${
                                Number(item.locations_visited) === 1
                                ? "location"
                                : "locations"
                                }
                                    visited
                                </small>

                                </div>


                                <span
                                    class="wildlife-status ${
                                        migrationDetected
                                            ? "status-warning"
                                            : "status-safe"
                                    }"
                                >

                                    ${
                                        migrationDetected
                                            ? "Migration Detected"
                                            : "No Migration"
                                    }

                                </span>

                            </div>


                            <p>

                                <strong>
                                    Population Observed:
                                </strong>

                                ${escapeHTML(
                                    formatValue(
                                        item.total_population_observed,
                                        "0"
                                    )
                                )}

                            </p>


                            <p>

                                <strong>
                                    Locations Visited:
                                </strong>

                                ${escapeHTML(
                                    formatValue(
                                        item.locations_visited,
                                        "0"
                                    )
                                )}

                            </p>

                        </div>

                    `;

                })
                .join("");

    }


    catch (error) {

        console.error(
            "Wildlife movement error:",
            error
        );


        setText(
            "movementSpeciesCount",
            0
        );


        container.innerHTML =
            errorState(
                "Unable to load wildlife movement analysis."
            );

    }

}


// ============================================================
// PATROL PLANNING
// ============================================================

async function loadPatrolPlanning() {

    const container =
        document.getElementById(
            "patrolData"
        );


    if (!container) return;


    try {

        const data =
            await api(
                "/conservation/monitoring"
            );


        const plans =
            Array.isArray(
                data?.monitoring_plan
            )
                ? data.monitoring_plan
                : [];


        if (!plans.length) {

            container.innerHTML =
                emptyState(
                    "fa-person-walking",
                    "No Patrol Plans",
                    "No field monitoring recommendations are currently available."
                );

            return;
        }


        const sortedPlans =
            [...plans]
                .sort(
                    (a, b) =>
                        Number(
                            b.priority_score || 0
                        ) -
                        Number(
                            a.priority_score || 0
                        )
                );


        container.innerHTML =
            sortedPlans
                .slice(0, 10)
                .map(item => {

                    const score =
                        Number(
                            item.priority_score
                        );


                    let priority =
                        "Low";


                    if (
                        Number.isFinite(score)
                    ) {

                        if (score >= 60) {

                            priority =
                                "High";

                        }

                        else if (score >= 30) {

                            priority =
                                "Medium";

                        }

                    }


                    const resources =
                        Array.isArray(
                            item.recommended_resources
                        )
                            ? item.recommended_resources
                            : [];


                    return `

                        <div class="mini-item">

                            <div class="panel-heading">

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            formatValue(
                                                item.location
                                            )
                                        )}
                                    </strong>

                                    <small>
                                        ${escapeHTML(
                                            formatValue(
                                                item.habitat_type
                                            )
                                        )}
                                    </small>

                                </div>


                                <span
                                    class="wildlife-status ${getPriorityClass(priority)}"
                                >

                                    ${priority}

                                </span>

                            </div>


                            <p>

                                <strong>
                                    Priority Score:
                                </strong>

                                ${escapeHTML(
                                    formatValue(
                                        item.priority_score,
                                        "0"
                                    )
                                )}

                            </p>


                            <p>

                                <strong>
                                    Patrol / Monitoring Frequency:
                                </strong>

                                ${escapeHTML(
                                    formatValue(
                                        item.monitoring_frequency
                                    )
                                )}

                            </p>


                            ${
                                resources.length
                                    ? `

                                        <div>

                                            <strong>
                                                Recommended Field Resources
                                            </strong>

                                            <ul>

                                                ${resources
                                                    .map(
                                                        resource =>
                                                            `<li>${escapeHTML(resource)}</li>`
                                                    )
                                                    .join("")}

                                            </ul>

                                        </div>

                                    `
                                    : ""
                            }

                        </div>

                    `;

                })
                .join("");

    }


    catch (error) {

        console.error(
            "Patrol planning error:",
            error
        );


        container.innerHTML =
            errorState(
                "Unable to load patrol planning recommendations."
            );

    }

}


// ============================================================
// INCIDENT / OBSERVATION LOG
// ============================================================

async function loadIncidentLog() {

    const container =
        document.getElementById(
            "incidentData"
        );


    if (!container) return;


    try {

        const records =
            await api("/wildlife");


        const list =
            Array.isArray(records)
                ? records
                : records?.items || [];


        setText(
            "incidentCount",
            Math.min(
                list.length,
                10
            )
        );


        if (!list.length) {

            container.innerHTML =
                emptyState(
                    "fa-paw",
                    "No Recent Wildlife Observations",
                    "New wildlife observations will appear here."
                );

            return;
        }


        container.innerHTML =
            list
                .slice(0, 10)
                .map(item => {

                    const species =
                        item.species_name ||
                        item.species ||
                        item.name ||
                        "Unknown species";


                    const location =
                        item.location ||
                        "Location unavailable";


                    const status =
                        item.conservation_status ||
                        "Not Evaluated";


                    const count =
                        item.count ??
                        item.population ??
                        1;


                    let statusClass =
                        "status-neutral";


                    const statusLower =
                        String(status)
                            .toLowerCase();


                    if (
                        statusLower.includes("endangered") ||
                        statusLower.includes("critical")
                    ) {

                        statusClass =
                            "status-danger";

                    }

                    else if (
                        statusLower.includes("vulnerable") ||
                        statusLower.includes("near")
                    ) {

                        statusClass =
                            "status-warning";

                    }

                    else if (
                        statusLower.includes("least concern")
                    ) {

                        statusClass =
                            "status-safe";

                    }


                    return `

                        <div class="mini-item">

                            <div class="panel-heading">

                                <div>

                                    <strong>
                                        ${escapeHTML(species)}
                                    </strong>

                                    <small>

                                        <i class="fa-solid fa-location-dot"></i>

                                        ${escapeHTML(location)}

                                    </small>

                                </div>


                                <span
                                    class="wildlife-status ${statusClass}"
                                >

                                    ${escapeHTML(status)}

                                </span>

                            </div>


                            <p>

                                <strong>
                                    Animals Observed:
                                </strong>

                                ${escapeHTML(
                                    count
                                )}

                            </p>


                            ${
                                item.behavior
                                    ? `

                                        <p>

                                            <strong>
                                                Behavior:
                                            </strong>

                                            ${escapeHTML(
                                                item.behavior
                                            )}

                                        </p>

                                    `
                                    : ""
                            }

                        </div>

                    `;

                })
                .join("");

    }


    catch (error) {

        console.error(
            "Incident log error:",
            error
        );


        setText(
            "incidentCount",
            0
        );


        container.innerHTML =
            errorState(
                "Unable to load recent wildlife observations."
            );

    }

}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadForestDashboard() {

    console.log(
        "WPIS Forest Department Dashboard starting..."
    );


    try {

        await loadProtectedAreas();

        console.log(
            "✓ Protected-area monitoring loaded"
        );

    }

    catch (error) {

        console.error(
            "Protected-area module failed:",
            error
        );

    }


    try {

        await loadWildlifeMovement();

        console.log(
            "✓ Wildlife movement loaded"
        );

    }

    catch (error) {

        console.error(
            "Movement module failed:",
            error
        );

    }


    try {

        await loadPatrolPlanning();

        console.log(
            "✓ Patrol planning loaded"
        );

    }

    catch (error) {

        console.error(
            "Patrol module failed:",
            error
        );

    }


    try {

        await loadIncidentLog();

        console.log(
            "✓ Observation incident log loaded"
        );

    }

    catch (error) {

        console.error(
            "Incident module failed:",
            error
        );

    }


    console.log(
        "WPIS Forest Department Dashboard ready."
    );

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadForestDashboard();

    }
);

// ============================================================
// LOGOUT
// ============================================================

document
    .querySelectorAll("[data-logout]")
    .forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                localStorage.removeItem("wpis_token");
                localStorage.removeItem("wpis_user");

                window.location.href = "login.html";

            }
        );

    });