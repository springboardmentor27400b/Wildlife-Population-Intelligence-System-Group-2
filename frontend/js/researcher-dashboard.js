// ============================================================
// WPIS - RESEARCHER DASHBOARD
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
    // Authentication failure
    // --------------------------------------------------------

    if (response.status === 401) {

        localStorage.removeItem("wpis_token");
        localStorage.removeItem("wpis_user");

        window.location.href = "login.html";

        return null;
    }

    // --------------------------------------------------------
    // Other API errors
    // --------------------------------------------------------

    if (!response.ok) {

        let message = "Could not load dashboard data.";

        try {

            const errorData =
                await response.json();

            message =
                errorData.detail ||
                message;

        } catch {

            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return response.json();
}


// ============================================================
// SAFE DOM HELPER
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent =
        value ?? "--";
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
// FORMAT SPECIES NAME
// ============================================================

function formatSpeciesName(name) {

    if (!name) return "Unknown";

    return String(name)
        .trim()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );
}


// ============================================================
// DISPLAY EMPTY STATE
// ============================================================

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


// ============================================================
// DISPLAY SPECIES STATISTICS
// ============================================================

function displaySpeciesStatistics(
    statistics
) {

    const element =
        document.getElementById(
            "speciesStatistics"
        );

    if (!element) return;


    if (
        !statistics ||
        Object.keys(statistics).length === 0
    ) {

        displayEmpty(
            "speciesStatistics",
            "fa-paw",
            "No Species Observations",
            "Species detected from monitoring data will appear here."
        );

        return;
    }


    const excludedClasses =
        new Set([
            "car",
            "truck",
            "bus",
            "motorcycle",
            "bicycle",
            "airplane",
            "boat",
            "traffic light",
            "stop sign",
            "parking meter",
            "bench"
        ]);


    const sorted =
        Object.entries(statistics)
            .filter(
                ([name]) =>
                    !excludedClasses.has(
                        String(name)
                            .toLowerCase()
                            .trim()
                    )
            )
            .sort(
                (a, b) =>
                    Number(b[1]) -
                    Number(a[1])
            );


    if (sorted.length === 0) {

        displayEmpty(
            "speciesStatistics",
            "fa-paw",
            "No Wildlife Species",
            "No wildlife species have been identified yet."
        );

        return;
    }


    element.innerHTML =
        sorted
            .slice(0, 8)
            .map(
                ([name, count], index) => `

                    <div class="species-row">

                        <div class="species-info">

                            <span class="species-rank">
                                ${index + 1}
                            </span>

                            <span class="species-name">
                                ${formatSpeciesName(name)}
                            </span>

                        </div>

                        <strong class="species-count">
                            ${count}
                        </strong>

                    </div>

                `
            )
            .join("");
}


// ============================================================
// DISPLAY BEHAVIOR STATISTICS
// ============================================================

function displayBehaviorStatistics(
    statistics
) {

    const element =
        document.getElementById(
            "behaviorStatistics"
        );

    if (!element) return;


    if (
        !statistics ||
        Object.keys(statistics).length === 0
    ) {

        displayEmpty(
            "behaviorStatistics",
            "fa-brain",
            "No Behavior Analysis",
            "Behavior observations will appear after AI analysis."
        );

        return;
    }


    const sorted =
        Object.entries(statistics)
            .sort(
                (a, b) =>
                    Number(b[1]) -
                    Number(a[1])
            );


    element.innerHTML =
        sorted
            .slice(0, 6)
            .map(
                ([behavior, count]) => `

                    <div class="ai-stat-row">

                        <div class="ai-stat-info">

                            <span class="ai-stat-icon">

                                <i class="fa-solid fa-brain"></i>

                            </span>

                            <div>

                                <span class="ai-stat-name">
                                    ${formatSpeciesName(behavior)}
                                </span>

                                <small>
                                    Behavior observation
                                </small>

                            </div>

                        </div>

                        <div class="ai-stat-value">
                            ${count}
                        </div>

                    </div>

                `
            )
            .join("");
}


// ============================================================
// DISPLAY YAMNET STATISTICS
// ============================================================

function displayAudioStatistics(
    statistics
) {

    const element =
        document.getElementById(
            "audioStatistics"
        );

    if (!element) return;


    if (
        !statistics ||
        Object.keys(statistics).length === 0
    ) {

        displayEmpty(
            "audioStatistics",
            "fa-microphone",
            "No Audio Detections",
            "YAMNet environmental sound detections will appear here."
        );

        return;
    }


    const sorted =
        Object.entries(statistics)
            .sort(
                (a, b) =>
                    Number(b[1]) -
                    Number(a[1])
            );


    element.innerHTML =
        sorted
            .slice(0, 6)
            .map(
                ([label, count]) => `

                    <div class="ai-stat-row">

                        <div class="ai-stat-info">

                            <span class="ai-stat-icon">

                                <i class="fa-solid fa-volume-high"></i>

                            </span>

                            <div>

                                <span class="ai-stat-name">
                                    ${formatSpeciesName(label)}
                                </span>

                                <small>
                                    YAMNet detection
                                </small>

                            </div>

                        </div>

                        <div class="ai-stat-value">
                            ${count}
                        </div>

                    </div>

                `
            )
            .join("");
}


// ============================================================
// DISPLAY BIRDNET STATISTICS
// ============================================================

function displayBirdnetStatistics(
    statistics
) {

    const element =
        document.getElementById(
            "birdnetStatistics"
        );

    if (!element) return;


    if (
        !statistics ||
        Object.keys(statistics).length === 0
    ) {

        displayEmpty(
            "birdnetStatistics",
            "fa-dove",
            "No Bird Detections",
            "BirdNET species identifications will appear here."
        );

        return;
    }


    const sorted =
        Object.entries(statistics)
            .sort(
                (a, b) =>
                    Number(b[1]) -
                    Number(a[1])
            );


    element.innerHTML =
        sorted
            .slice(0, 6)
            .map(
                ([species, count]) => `

                    <div class="ai-stat-row">

                        <div class="ai-stat-info">

                            <span class="ai-stat-icon">

                                <i class="fa-solid fa-dove"></i>

                            </span>

                            <div>

                                <span class="ai-stat-name">
                                    ${formatSpeciesName(species)}
                                </span>

                                <small>
                                    BirdNET detection
                                </small>

                            </div>

                        </div>

                        <div class="ai-stat-value">
                            ${count}
                        </div>

                    </div>

                `
            )
            .join("");
}


// ============================================================
// LOAD RESEARCH OVERVIEW
// ============================================================

async function loadResearchOverview(
    dashboardData,
    populationData,
    biodiversityData,
    habitatData
) {

    // --------------------------------------------------------
    // Wildlife records
    // --------------------------------------------------------

    setText(
        "totalWildlife",
        dashboardData?.total_wildlife_records ?? 0
    );


    // --------------------------------------------------------
    // Population
    // --------------------------------------------------------

    setText(
        "totalPopulation",
        populationData?.total_population ?? 0
    );


    // --------------------------------------------------------
    // Species richness
    // --------------------------------------------------------

    setText(
        "speciesRichness",
        populationData?.species_richness ?? 0
    );


    // --------------------------------------------------------
    // Biodiversity index
    // --------------------------------------------------------

    const biodiversity =
        Number(
            biodiversityData
                ?.shannon_diversity_index
        );


    setText(
        "biodiversityScore",
        Number.isFinite(biodiversity)
            ? biodiversity.toFixed(2)
            : "0.00"
    );


    // --------------------------------------------------------
    // Habitat health
    // --------------------------------------------------------

    const habitatScore =
        habitatData
            ?.overall_habitat_health_score;


    setText(
        "habitatScore",
        habitatScore ?? "--"
    );
}


// ============================================================
// AI INTELLIGENCE SUMMARY
// ============================================================

function updateAIInsights(
    populationData,
    biodiversityData,
    habitatData
) {

    // --------------------------------------------------------
    // Population insight
    // --------------------------------------------------------

    const populationInsight =
        document.getElementById(
            "populationInsight"
        );


    if (populationInsight) {

        const population =
            populationData
                ?.total_population ?? 0;

        populationInsight.textContent =
            `${population} animals`;

    }


    // --------------------------------------------------------
    // Biodiversity insight
    // --------------------------------------------------------

    const biodiversityInsight =
        document.getElementById(
            "biodiversityInsight"
        );


    if (biodiversityInsight) {

        const species =
            biodiversityData
                ?.species_richness ??
            populationData
                ?.species_richness ??
            0;

        const index =
            Number(
                biodiversityData
                    ?.shannon_diversity_index
            );


        if (Number.isFinite(index)) {

            biodiversityInsight.textContent =
                `${index.toFixed(2)} index`;

        } else {

            biodiversityInsight.textContent =
                `${species} species`;

        }

    }


    // --------------------------------------------------------
    // Habitat insight
    // --------------------------------------------------------

    const habitatInsight =
        document.getElementById(
            "habitatInsight"
        );


    if (habitatInsight) {

        const score =
            habitatData
                ?.overall_habitat_health_score;


        habitatInsight.textContent =
            score !== undefined &&
            score !== null
                ? `${score}`
                : "Active";

    }
}


// ============================================================
// RESEARCH ACTIVITY CHART
// ============================================================

function createResearchActivityChart(
    dashboardData
) {

    const canvas =
        document.getElementById(
            "summaryChart"
        );

    if (!canvas) return;


    // Prevent duplicate chart
    if (window.researchActivityChart) {

        window.researchActivityChart.destroy();

    }


    const values = [

        dashboardData?.total_wildlife_records || 0,

        dashboardData?.total_images || 0,

        dashboardData?.total_animals_detected || 0,

        dashboardData?.total_audio_files || 0

    ];


    window.researchActivityChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Wildlife",
                        "Images",
                        "Animals",
                        "Audio"
                    ],

                    datasets: [

                        {

                            label:
                                "Research Activity",

                            data:
                                values,

                            backgroundColor: [
                                "#43a06f",
                                "#6fae8a",
                                "#176344",
                                "#b9dc79"
                            ],

                            borderWidth: 0,

                            borderRadius: 8,

                            borderSkipped: false,

                            barPercentage: 0.65,

                            categoryPercentage: 0.72

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    animation: {

                        duration: 700,

                        easing:
                            "easeOutQuart"

                    },

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            backgroundColor:
                                "#143c2c",

                            titleColor:
                                "#ffffff",

                            bodyColor:
                                "#dce9e2",

                            padding: 12,

                            cornerRadius: 10,

                            displayColors: false,

                            callbacks: {

                                label:
                                    function(context) {

                                        return ` ${context.parsed.y} records`;

                                    }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            border: {

                                display: false

                            },

                            grid: {

                                color:
                                    "#edf1ee",

                                drawTicks:
                                    false

                            },

                            ticks: {

                                color:
                                    "#7a8d83",

                                padding: 8,

                                precision: 0,

                                font: {

                                    size: 11,

                                    weight: "600"

                                }

                            }

                        },

                        x: {

                            border: {

                                display: false

                            },

                            grid: {

                                display: false

                            },

                            ticks: {

                                color:
                                    "#526c5f",

                                padding: 8,

                                font: {

                                    size: 11,

                                    weight: "700"

                                }

                            }

                        }

                    }

                }

            }
        );
}


// ============================================================
// RECENT WILDLIFE
// ============================================================

async function loadRecentWildlife() {

    const container =
        document.getElementById(
            "recentWildlife"
        );

    if (!container) return;


    try {

        const records =
            await api("/wildlife");


        const list =
            Array.isArray(records)
                ? records
                : records?.items || [];


        if (!list.length) {

            displayEmpty(
                "recentWildlife",
                "fa-paw",
                "No Wildlife Records",
                "Detected wildlife will appear here."
            );

            return;
        }


        container.innerHTML =
            list
                .slice(0, 5)
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
                        statusLower.includes(
                            "endangered"
                        ) ||
                        statusLower.includes(
                            "critical"
                        )
                    ) {

                        statusClass =
                            "status-danger";

                    }

                    else if (
                        statusLower.includes(
                            "vulnerable"
                        ) ||
                        statusLower.includes(
                            "near"
                        )
                    ) {

                        statusClass =
                            "status-warning";

                    }

                    else if (
                        statusLower.includes(
                            "least concern"
                        )
                    ) {

                        statusClass =
                            "status-safe";

                    }


                    return `

                        <div class="wildlife-feed-item">

                            <div class="wildlife-avatar">

                                <i class="fa-solid fa-paw"></i>

                            </div>


                            <div class="wildlife-info">

                                <strong>
                                    ${formatSpeciesName(species)}
                                </strong>

                                <span>

                                    <i class="fa-solid fa-location-dot"></i>

                                    ${location}

                                </span>

                            </div>


                            <div class="wildlife-meta">

                                <strong>
                                    ${count}
                                </strong>

                                <small>
                                    detected
                                </small>

                                <span
                                    class="wildlife-status ${statusClass}"
                                >
                                    ${status}
                                </span>

                            </div>

                        </div>

                    `;

                })
                .join("");

    }

    catch (error) {

        console.error(
            "Recent wildlife error:",
            error
        );


        container.innerHTML = `

            <div class="ai-empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <strong>
                    Wildlife data unavailable
                </strong>

                <span>
                    Unable to load recent wildlife records.
                </span>

            </div>

        `;

    }
}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadResearcherDashboard() {

    console.log(
        "WPIS Researcher Dashboard starting..."
    );


    let dashboardData = {};
    let populationData = {};
    let biodiversityData = {};
    let habitatData = {};


    // ========================================================
    // DASHBOARD SUMMARY
    // ========================================================

    try {

        dashboardData =
            await api("/dashboard/summary");

        console.log(
            "Dashboard summary:",
            dashboardData
        );


        displaySpeciesStatistics(
            dashboardData
                ?.species_statistics
        );


        displayBehaviorStatistics(
            dashboardData
                ?.behavior_statistics
        );


        displayAudioStatistics(
            dashboardData
                ?.audio_statistics
        );


        displayBirdnetStatistics(
            dashboardData
                ?.birdnet_statistics
        );


        createResearchActivityChart(
            dashboardData
        );

    }

    catch (error) {

        console.error(
            "Dashboard summary failed:",
            error
        );


        displayEmpty(
            "speciesStatistics",
            "fa-paw",
            "Data unavailable",
            "Unable to load species observations."
        );


        displayEmpty(
            "behaviorStatistics",
            "fa-brain",
            "Data unavailable",
            "Unable to load behavior analysis."
        );


        displayEmpty(
            "audioStatistics",
            "fa-microphone",
            "Data unavailable",
            "Unable to load audio analysis."
        );


        displayEmpty(
            "birdnetStatistics",
            "fa-dove",
            "Data unavailable",
            "Unable to load BirdNET analysis."
        );

    }


    // ========================================================
    // POPULATION OVERVIEW
    // ========================================================

    try {

        populationData =
            await api(
                "/population/overview"
            );


        console.log(
            "Population overview:",
            populationData
        );

    }

    catch (error) {

        console.error(
            "Population overview failed:",
            error
        );

    }


    // ========================================================
    // BIODIVERSITY
    // ========================================================

    try {

        biodiversityData =
            await api(
                "/population/biodiversity/index"
            );


        console.log(
            "Biodiversity:",
            biodiversityData
        );

    }

    catch (error) {

        console.error(
            "Biodiversity failed:",
            error
        );

    }


    // ========================================================
    // HABITAT HEALTH
    // ========================================================

    try {

        habitatData =
            await api(
                "/population/biodiversity/habitat-health"
            );


        console.log(
            "Habitat health:",
            habitatData
        );

    }

    catch (error) {

        console.error(
            "Habitat health failed:",
            error
        );

    }


    // ========================================================
    // UPDATE OVERVIEW CARDS
    // ========================================================

    await loadResearchOverview(
        dashboardData,
        populationData,
        biodiversityData,
        habitatData
    );


    // ========================================================
    // UPDATE AI INSIGHTS
    // ========================================================

    updateAIInsights(
        populationData,
        biodiversityData,
        habitatData
    );


    // ========================================================
    // RECENT WILDLIFE
    // ========================================================

    await loadRecentWildlife();


    console.log(
        "WPIS Researcher Dashboard ready."
    );
}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadResearcherDashboard();

    }
);