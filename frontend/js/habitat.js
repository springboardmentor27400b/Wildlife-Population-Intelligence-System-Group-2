// ============================================================
// WPIS - HABITAT INTELLIGENCE
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


    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    if (response.status === 401) {

        localStorage.removeItem("wpis_token");
        localStorage.removeItem("wpis_user");

        window.location.href = "login.html";

        return null;
    }


    // --------------------------------------------------------
    // API error
    // --------------------------------------------------------

    if (!response.ok) {

        let message =
            "Unable to load habitat intelligence.";

        try {

            const error =
                await response.json();

            message =
                error.detail ||
                message;

        }

        catch {

            // Ignore JSON parsing errors

        }

        throw new Error(message);
    }


    return response.json();
}


// ============================================================
// HELPERS
// ============================================================

function formatValue(value, fallback = "Not available") {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return fallback;
    }

    return value;
}


function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent =
        value ?? "--";
}


function displayEmpty(
    elementId,
    icon,
    title,
    message
) {

    const element =
        document.getElementById(elementId);

    if (!element) return;

    element.innerHTML = `

        <article class="panel">

            <div class="ai-empty-state">

                <i class="fa-solid ${icon}"></i>

                <strong>
                    ${title}
                </strong>

                <span>
                    ${message}
                </span>

            </div>

        </article>

    `;
}


function displayError(
    elementId,
    message
) {

    const element =
        document.getElementById(elementId);

    if (!element) return;

    element.innerHTML = `

        <article class="panel">

            <div class="ai-empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <strong>
                    Data unavailable
                </strong>

                <span>
                    ${escapeHTML(message)}
                </span>

            </div>

        </article>

    `;
}


// ============================================================
// MOBILE SIDEBAR
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
// TOP SUMMARY CARDS
// ============================================================

async function loadTopCards() {

    const [
        overview,
        biodiversity,
        habitats
    ] = await Promise.all([

        api("/population/overview"),

        api("/population/biodiversity/index"),

        api("/habitat/classifications")

    ]);


    // --------------------------------------------------------
    // Population
    // --------------------------------------------------------

    setText(
        "totalPopulation",
        overview?.total_population ?? 0
    );


    // --------------------------------------------------------
    // Species richness
    // --------------------------------------------------------

    setText(
        "speciesRichness",
        overview?.species_richness ?? 0
    );


    // --------------------------------------------------------
    // Biodiversity
    // --------------------------------------------------------

    const biodiversityIndex =
        Number(
            biodiversity?.shannon_diversity_index
        );


    setText(
        "biodiversityIndex",
        Number.isFinite(biodiversityIndex)
            ? biodiversityIndex.toFixed(2)
            : "0.00"
    );


    // --------------------------------------------------------
    // Monitoring locations
    // --------------------------------------------------------

    let locationCount =
        habitats?.total_locations;


    if (
        locationCount === undefined ||
        locationCount === null
    ) {

        locationCount =
            Array.isArray(habitats?.habitats)
                ? habitats.habitats.length
                : 0;

    }


    setText(
        "locations",
        locationCount
    );

}


// ============================================================
// HABITAT CLASSIFICATION
// ============================================================

async function loadClassification() {

    const data =
        await api(
            "/habitat/classifications"
        );


    const habitats =
        Array.isArray(data?.habitats)
            ? data.habitats
            : [];


    if (!habitats.length) {

        displayEmpty(
            "classificationData",
            "fa-tree",
            "No Habitat Classifications",
            "Habitat classification data will appear after monitoring assessments."
        );

        return;
    }


    document.getElementById(
        "classificationData"
    ).innerHTML = habitats
        .map(habitat => {

            const confidence =
                Number(
                    habitat.confidence
                );


            const confidenceText =
                Number.isFinite(confidence)
                    ? `${(
                        confidence * 100
                    ).toFixed(0)}%`
                    : "Not available";


            return `

                <article class="panel">

                    <div class="panel-heading">

                        <div>

                            <h2>

                                <i class="fa-solid fa-tree"></i>

                                ${escapeHTML(
                                    habitat.habitat_type ||
                                    "Unknown Habitat"
                                )}

                            </h2>

                            <p class="panel-subtitle">

                                <i class="fa-solid fa-location-dot"></i>

                                ${escapeHTML(
                                    habitat.location ||
                                    "Unknown location"
                                )}

                            </p>

                        </div>

                    </div>


                    <div class="mini-list">

                        <div class="ai-stat-row">

                            <div class="ai-stat-info">

                                <span class="ai-stat-icon">

                                    <i class="fa-solid fa-ruler-combined"></i>

                                </span>

                                <div>

                                    <span class="ai-stat-name">
                                        Habitat Area
                                    </span>

                                    <small>
                                        Estimated coverage
                                    </small>

                                </div>

                            </div>

                            <div class="ai-stat-value">

                                ${escapeHTML(
                                    formatValue(
                                        habitat.area_km2,
                                        "0"
                                    )
                                )} km²

                            </div>

                        </div>


                        <div class="ai-stat-row">

                            <div class="ai-stat-info">

                                <span class="ai-stat-icon">

                                    <i class="fa-solid fa-shield-halved"></i>

                                </span>

                                <div>

                                    <span class="ai-stat-name">
                                        Protected Area
                                    </span>

                                    <small>
                                        Protection status
                                    </small>

                                </div>

                            </div>

                            <div class="ai-stat-value">

                                ${
                                    habitat.protected_area
                                        ? "Yes"
                                        : "No"
                                }

                            </div>

                        </div>


                        <div class="ai-stat-row">

                            <div class="ai-stat-info">

                                <span class="ai-stat-icon">

                                    <i class="fa-solid fa-brain"></i>

                                </span>

                                <div>

                                    <span class="ai-stat-name">
                                        AI Confidence
                                    </span>

                                    <small>
                                        Classification confidence
                                    </small>

                                </div>

                            </div>

                            <div class="ai-stat-value">

                                ${confidenceText}

                            </div>

                        </div>

                    </div>

                </article>

            `;

        })
        .join("");

}


// ============================================================
// HABITAT SUITABILITY
// ============================================================

async function loadSuitability() {

    const data =
        await api(
            "/habitat/suitability"
        );


    const analysis =
        Array.isArray(
            data?.suitability_analysis
        )
            ? data.suitability_analysis
            : [];


    if (!analysis.length) {

        displayEmpty(
            "suitabilityData",
            "fa-leaf",
            "No Suitability Data",
            "Habitat suitability information will appear after environmental assessment."
        );

        return;
    }


    document.getElementById(
        "suitabilityData"
    ).innerHTML = analysis
        .map(item => {

            const score =
                Number(
                    item.suitability_score
                );


            let statusClass =
                "status-neutral";


            const suitability =
                String(
                    item.suitability ||
                    ""
                ).toLowerCase();


            if (
                suitability.includes("high") ||
                suitability.includes("good")
            ) {

                statusClass =
                    "status-safe";

            }

            else if (
                suitability.includes("moderate") ||
                suitability.includes("medium")
            ) {

                statusClass =
                    "status-warning";

            }

            else if (
                suitability.includes("low") ||
                suitability.includes("poor")
            ) {

                statusClass =
                    "status-danger";

            }


            return `

                <article class="panel">

                    <div class="panel-heading">

                        <div>

                            <h2>

                                <i class="fa-solid fa-leaf"></i>

                                ${escapeHTML(
                                    item.location ||
                                    "Unknown location"
                                )}

                            </h2>

                            <p class="panel-subtitle">
                                Environmental suitability assessment
                            </p>

                        </div>


                        <span
                            class="wildlife-status ${statusClass}"
                        >

                            ${escapeHTML(
                                item.suitability ||
                                "Not evaluated"
                            )}

                        </span>

                    </div>


                    <div class="mini-list">


                        <div class="ai-stat-row">

                            <div class="ai-stat-info">

                                <span class="ai-stat-icon">

                                    <i class="fa-solid fa-chart-line"></i>

                                </span>

                                <div>

                                    <span class="ai-stat-name">
                                        Suitability Score
                                    </span>

                                    <small>
                                        Overall habitat suitability
                                    </small>

                                </div>

                            </div>

                            <div class="ai-stat-value">

                                ${
                                    Number.isFinite(score)
                                        ? score
                                        : "N/A"
                                }

                            </div>

                        </div>


                        <div class="ai-stat-row">

                            <div class="ai-stat-info">

                                <span class="ai-stat-icon">

                                    <i class="fa-solid fa-seedling"></i>

                                </span>

                                <div>

                                    <span class="ai-stat-name">
                                        Vegetation Health
                                    </span>

                                    <small>
                                        Vegetation condition
                                    </small>

                                </div>

                            </div>

                            <div class="ai-stat-value">

                                ${escapeHTML(
                                    item.factors?.vegetation_health ||
                                    "N/A"
                                )}

                            </div>

                        </div>


                        <div class="ai-stat-row">

                            <div class="ai-stat-info">

                                <span class="ai-stat-icon">

                                    <i class="fa-solid fa-droplet"></i>

                                </span>

                                <div>

                                    <span class="ai-stat-name">
                                        Water Quality
                                    </span>

                                    <small>
                                        Available water condition
                                    </small>

                                </div>

                            </div>

                            <div class="ai-stat-value">

                                ${escapeHTML(
                                    item.factors?.water_quality ||
                                    "N/A"
                                )}

                            </div>

                        </div>


                        <div class="ai-stat-row">

                            <div class="ai-stat-info">

                                <span class="ai-stat-icon">

                                    <i class="fa-solid fa-cloud-rain"></i>

                                </span>

                                <div>

                                    <span class="ai-stat-name">
                                        Rainfall
                                    </span>

                                    <small>
                                        Recorded rainfall
                                    </small>

                                </div>

                            </div>

                            <div class="ai-stat-value">

                                ${escapeHTML(
                                    item.factors?.rainfall ??
                                    "N/A"
                                )} mm

                            </div>

                        </div>


                    </div>


                    ${
                        item.recommendation
                            ? `

                                <div class="chart-footer">

                                    <span>

                                        <i class="fa-solid fa-lightbulb"></i>

                                        ${escapeHTML(
                                            item.recommendation
                                        )}

                                    </span>

                                </div>

                            `
                            : ""
                    }

                </article>

            `;

        })
        .join("");

}


// ============================================================
// HABITAT CHANGE DETECTION
// ============================================================

async function loadChangeDetection() {

    const container =
        document.getElementById(
            "changeData"
        );


    if (!container) return;


    container.innerHTML = `

        <div class="ai-empty-state">

            <i class="fa-solid fa-satellite-dish"></i>

            <strong>
                Habitat Change Monitoring
            </strong>

            <span>
                Habitat degradation reports are generated
                during new habitat assessments.
            </span>

        </div>

    `;

}


// ============================================================
// RESTORATION RECOMMENDATIONS
// ============================================================

async function loadRestoration() {

    const data =
        await api(
            "/conservation/restoration"
        );


    const recommendations =
        Array.isArray(
            data?.restoration_recommendations
        )
            ? data.restoration_recommendations
            : [];


    if (!recommendations.length) {

        displayEmpty(
            "restorationData",
            "fa-seedling",
            "No Restoration Recommendations",
            "Restoration recommendations will appear when conservation assessments identify intervention requirements."
        );

        return;
    }


    document.getElementById(
        "restorationData"
    ).innerHTML =
        recommendations
            .map(item => {

                const priority =
                    String(
                        item.priority ||
                        "Normal"
                    );


                let priorityClass =
                    "status-neutral";


                const priorityLower =
                    priority.toLowerCase();


                if (
                    priorityLower.includes("high") ||
                    priorityLower.includes("critical")
                ) {

                    priorityClass =
                        "status-danger";

                }

                else if (
                    priorityLower.includes("medium") ||
                    priorityLower.includes("moderate")
                ) {

                    priorityClass =
                        "status-warning";

                }

                else if (
                    priorityLower.includes("low")
                ) {

                    priorityClass =
                        "status-safe";

                }


                const actions =
                    Array.isArray(
                        item.recommended_actions
                    )
                        ? item.recommended_actions
                        : [];


                return `

                    <article class="panel">

                        <div class="panel-heading">

                            <div>

                                <h2>

                                    <i class="fa-solid fa-seedling"></i>

                                    ${escapeHTML(
                                        item.location ||
                                        "Unknown location"
                                    )}

                                </h2>

                                <p class="panel-subtitle">
                                    Habitat restoration planning
                                </p>

                            </div>


                            <span
                                class="wildlife-status ${priorityClass}"
                            >

                                ${escapeHTML(priority)}

                            </span>

                        </div>


                        <div class="mini-list">

                            <strong>
                                Recommended Actions
                            </strong>


                            ${
                                actions.length
                                    ? `

                                        <ul>

                                            ${actions
                                                .map(
                                                    action =>
                                                        `<li>${escapeHTML(action)}</li>`
                                                )
                                                .join("")}

                                        </ul>

                                    `
                                    : `

                                        <p>
                                            No specific actions available.
                                        </p>

                                    `
                            }

                        </div>

                    </article>

                `;

            })
            .join("");

}


// ============================================================
// WILDLIFE CORRIDOR / PROTECTION
// ============================================================

async function loadCorridors() {

    const data =
        await api(
            "/conservation/protection"
        );


    const strategies =
        Array.isArray(
            data?.protection_strategies
        )
            ? data.protection_strategies
            : [];


    if (!strategies.length) {

        displayEmpty(
            "corridorData",
            "fa-route",
            "No Corridor Analysis",
            "Wildlife corridor and species protection information is not currently available."
        );

        return;
    }


    document.getElementById(
        "corridorData"
    ).innerHTML =
        strategies
            .map(item => {

                const strategiesList =
                    Array.isArray(
                        item.recommended_strategies
                    )
                        ? item.recommended_strategies
                        : [];


                return `

                    <article class="panel">

                        <div class="panel-heading">

                            <div>

                                <h2>

                                    <i class="fa-solid fa-route"></i>

                                    ${escapeHTML(
                                        item.species ||
                                        "Unknown species"
                                    )}

                                </h2>

                                <p class="panel-subtitle">
                                    Wildlife protection strategy
                                </p>

                            </div>

                        </div>


                        <div class="mini-list">


                            <div class="ai-stat-row">

                                <div class="ai-stat-info">

                                    <span class="ai-stat-icon">

                                        <i class="fa-solid fa-shield-heart"></i>

                                    </span>

                                    <div>

                                        <span class="ai-stat-name">
                                            Conservation Status
                                        </span>

                                        <small>
                                            Current species status
                                        </small>

                                    </div>

                                </div>

                                <div class="ai-stat-value">

                                    ${escapeHTML(
                                        item.conservation_status ||
                                        "Not evaluated"
                                    )}

                                </div>

                            </div>


                            <div class="ai-stat-row">

                                <div class="ai-stat-info">

                                    <span class="ai-stat-icon">

                                        <i class="fa-solid fa-paw"></i>

                                    </span>

                                    <div>

                                        <span class="ai-stat-name">
                                            Population
                                        </span>

                                        <small>
                                            Observed population
                                        </small>

                                    </div>

                                </div>

                                <div class="ai-stat-value">

                                    ${escapeHTML(
                                        item.population ??
                                        0
                                    )}

                                </div>

                            </div>


                            <strong>
                                Recommended Protection Strategies
                            </strong>


                            ${
                                strategiesList.length
                                    ? `

                                        <ul>

                                            ${strategiesList
                                                .map(
                                                    strategy =>
                                                        `<li>${escapeHTML(strategy)}</li>`
                                                )
                                                .join("")}

                                        </ul>

                                    `
                                    : `

                                        <p>
                                            No specific strategies available.
                                        </p>

                                    `
                            }

                        </div>

                    </article>

                `;

            })
            .join("");

}


// ============================================================
// PROTECTED AREA MONITORING
// ============================================================

async function loadProtectedAreas() {

    const data =
        await api(
            "/conservation/monitoring"
        );


    const monitoringPlan =
        Array.isArray(
            data?.monitoring_plan
        )
            ? data.monitoring_plan
            : [];


    if (!monitoringPlan.length) {

        displayEmpty(
            "protectedAreaData",
            "fa-shield-halved",
            "No Protected Area Data",
            "Protected area monitoring plans will appear when monitoring assessments are available."
        );

        return;
    }


    document.getElementById(
        "protectedAreaData"
    ).innerHTML =
        monitoringPlan
            .map(item => {

                const score =
                    Number(
                        item.priority_score
                    );


                let scoreClass =
                    "status-neutral";


                if (
                    Number.isFinite(score)
                ) {

                    if (score >= 75) {

                        scoreClass =
                            "status-danger";

                    }

                    else if (score >= 40) {

                        scoreClass =
                            "status-warning";

                    }

                    else {

                        scoreClass =
                            "status-safe";

                    }

                }


                const resources =
                    Array.isArray(
                        item.recommended_resources
                    )
                        ? item.recommended_resources
                        : [];


                return `

                    <article class="panel">

                        <div class="panel-heading">

                            <div>

                                <h2>

                                    <i class="fa-solid fa-shield-halved"></i>

                                    ${escapeHTML(
                                        item.location ||
                                        "Unknown location"
                                    )}

                                </h2>

                                <p class="panel-subtitle">

                                    ${escapeHTML(
                                        item.habitat_type ||
                                        "Protected habitat"
                                    )}

                                </p>

                            </div>


                            <span
                                class="wildlife-status ${scoreClass}"
                            >

                                Priority
                                ${Number.isFinite(score)
                                    ? score
                                    : "N/A"}

                            </span>

                        </div>


                        <div class="mini-list">


                            <div class="ai-stat-row">

                                <div class="ai-stat-info">

                                    <span class="ai-stat-icon">

                                        <i class="fa-solid fa-clock"></i>

                                    </span>

                                    <div>

                                        <span class="ai-stat-name">
                                            Monitoring Frequency
                                        </span>

                                        <small>
                                            Recommended schedule
                                        </small>

                                    </div>

                                </div>

                                <div class="ai-stat-value">

                                    ${escapeHTML(
                                        item.monitoring_frequency ||
                                        "Not specified"
                                    )}

                                </div>

                            </div>


                            <strong>
                                Recommended Resources
                            </strong>


                            ${
                                resources.length
                                    ? `

                                        <ul>

                                            ${resources
                                                .map(
                                                    resource =>
                                                        `<li>${escapeHTML(resource)}</li>`
                                                )
                                                .join("")}

                                        </ul>

                                    `
                                    : `

                                        <p>
                                            No resource recommendations available.
                                        </p>

                                    `
                            }

                        </div>

                    </article>

                `;

            })
            .join("");

}


// ============================================================
// LOAD EVERYTHING
// ============================================================

async function loadHabitatDashboard() {

    console.log(
        "WPIS Habitat Intelligence starting..."
    );


    const modules = [

        [
            "Top Cards",
            loadTopCards
        ],

        [
            "Habitat Classification",
            loadClassification
        ],

        [
            "Habitat Suitability",
            loadSuitability
        ],

        [
            "Habitat Change Detection",
            loadChangeDetection
        ],

        [
            "Restoration Recommendations",
            loadRestoration
        ],

        [
            "Wildlife Corridor Analysis",
            loadCorridors
        ],

        [
            "Protected Area Monitoring",
            loadProtectedAreas
        ]

    ];


    for (
        const [name, loader]
        of modules
    ) {

        try {

            await loader();

            console.log(
                `✓ ${name} loaded`
            );

        }

        catch (error) {

            console.error(
                `✗ ${name} failed:`,
                error
            );


            const targetMap = {

                "Habitat Classification":
                    "classificationData",

                "Habitat Suitability":
                    "suitabilityData",

                "Habitat Change Detection":
                    "changeData",

                "Restoration Recommendations":
                    "restorationData",

                "Wildlife Corridor Analysis":
                    "corridorData",

                "Protected Area Monitoring":
                    "protectedAreaData"

            };


            const target =
                targetMap[name];


            if (target) {

                displayError(
                    target,
                    error.message
                );

            }

        }

    }


    console.log(
        "WPIS Habitat Intelligence ready."
    );

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    loadHabitatDashboard
);