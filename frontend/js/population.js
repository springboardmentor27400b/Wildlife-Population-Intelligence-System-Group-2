const API_BASE =
    localStorage.getItem("wpis_api_base") ||
    "http://127.0.0.1:8000";

const token = () =>
    localStorage.getItem("wpis_token");

async function api(path) {

    const response = await fetch(
        `${API_BASE}${path}`,
        {
            headers: token()
                ? {
                    Authorization: `Bearer ${token()}`
                }
                : {}
        }
    );

    if (response.status === 401) {

        localStorage.removeItem("wpis_token");

        location.href = "login.html";

        return;

    }

    if (!response.ok) {

        throw new Error("API Error");

    }

    return response.json();

}

function showModuleState(id, message, type = "loading") {

    const element = document.getElementById(id);

    if (!element) return;

    element.innerHTML = `
        <div class="intelligence-state ${type}">
            <i class="fa-solid ${
                type === "error"
                    ? "fa-triangle-exclamation"
                    : "fa-circle-notch fa-spin"
            }"></i>

            <span>${message}</span>
        </div>
    `;
}

async function loadOverview() {

    const data = await api("/population/overview");

    console.log("Population overview:", data);

    document.querySelector("#totalPopulation").textContent =
        data.total_population ?? 0;

    document.querySelector("#speciesRichness").textContent =
        data.species_richness ?? 0;

    document.querySelector("#locations").textContent =
        data.population_by_location
            ? Object.keys(data.population_by_location).length
            : 0;

    document.querySelector("#overviewData").innerHTML = `

        <div class="intelligence-summary">

            <div class="summary-highlight">

                <span>Observed Population</span>

                <strong>
                    ${data.total_population ?? 0}
                </strong>

            </div>

            <div class="summary-highlight">

                <span>Species Detected</span>

                <strong>
                    ${data.species_richness ?? 0}
                </strong>

            </div>

            <div class="summary-highlight">

                <span>Most Abundant</span>

                <strong>
                    ${data.most_abundant_species || "No data"}
                </strong>

            </div>

        </div>

    `;
}

async function loadBiodiversity() {

    const data =
        await api(
            "/population/biodiversity/index"
        );

    document.querySelector("#biodiversityIndex").textContent =
        data.shannon_diversity_index.toFixed(2);

}

async function loadRanking() {

    const data = await api("/population/ranking/species");

    const container =
        document.getElementById("rankingData");

    if (!data.ranking || data.ranking.length === 0) {

        container.innerHTML = `
            <div class="intelligence-state">
                <i class="fa-solid fa-paw"></i>
                <span>No species population data available</span>
            </div>
        `;

        return;
    }

    container.innerHTML = `

        <div class="species-ranking">

            ${data.ranking.slice(0, 6).map(item => `

                <div class="ranking-row">

                    <div class="ranking-left">

                        <span class="rank-number">
                            ${item.rank}
                        </span>

                        <div>

                            <strong>
                                ${item.species}
                            </strong>

                            <small>
                                Observed population
                            </small>

                        </div>

                    </div>

                    <span class="population-value">
                        ${item.population}
                    </span>

                </div>

            `).join("")}

        </div>

    `;
}

async function loadAlerts() {

    const data =
        await api("/population/alerts");

    const container =
        document.getElementById("alertsData");

    if (!data.alerts || data.alerts.length === 0) {

        container.innerHTML = `

            <div class="ai-empty-state">

                <i class="fa-solid fa-shield-check"></i>

                <strong>No Population Alerts</strong>

                <span>
                    Current population indicators are stable.
                </span>

            </div>

        `;

        return;
    }

    container.innerHTML = data.alerts
        .map(item => {

            const severity =
                String(item.severity || "")
                    .toLowerCase();

            let severityClass = "status-neutral";

            if (
                severity.includes("critical") ||
                severity.includes("high")
            ) {

                severityClass = "status-danger";

            } else if (
                severity.includes("medium") ||
                severity.includes("moderate")
            ) {

                severityClass = "status-warning";

            } else if (
                severity.includes("low")
            ) {

                severityClass = "status-safe";

            }

            return `

                <div class="alert-row">

                    <div class="alert-icon">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                    </div>

                    <div class="alert-info">

                        <strong>
                            ${item.species}
                        </strong>

                        <span>
                            ${item.alert_type}
                        </span>

                        <small>
                            <i class="fa-solid fa-location-dot"></i>
                            ${item.location}
                        </small>

                    </div>

                    <span class="wildlife-status ${severityClass}">
                        ${item.severity}
                    </span>

                </div>

            `;

        })
        .join("");
}

async function loadMigration() {

    const data =
        await api("/population/migration");

    const container =
        document.getElementById("migrationData");

    if (
        !data.species_movement ||
        data.species_movement.length === 0
    ) {

        container.innerHTML = `

            <div class="ai-empty-state">

                <i class="fa-solid fa-route"></i>

                <strong>No Movement Data</strong>

                <span>
                    Species movement data is not currently available.
                </span>

            </div>

        `;

        return;
    }

    container.innerHTML =
        data.species_movement.map(item => `

            <div class="movement-row">

                <div class="movement-icon">

                    <i class="fa-solid fa-route"></i>

                </div>

                <div class="movement-info">

                    <strong>
                        ${item.species}
                    </strong>

                    <span>
                        ${item.locations_visited}
                        locations visited
                    </span>

                </div>

                <div class="movement-value">

                    <strong>
                        ${item.total_population_observed}
                    </strong>

                    <small>
                        observed
                    </small>

                    <span class="${
                        item.migration_detected
                            ? "movement-detected"
                            : "movement-stable"
                    }">

                        ${
                            item.migration_detected
                                ? "Migration Detected"
                                : "No Migration"
                        }

                    </span>

                </div>

            </div>

        `).join("");
}

async function loadDistribution() {

    const data =
        await api("/population/distribution");

    const container =
        document.getElementById("distributionData");

    if (
        !data.distribution ||
        data.distribution.length === 0
    ) {

        container.innerHTML = `

            <div class="ai-empty-state">

                <i class="fa-solid fa-map-location-dot"></i>

                <strong>No Distribution Data</strong>

                <span>
                    Species distribution will appear here.
                </span>

            </div>

        `;

        return;
    }

    container.innerHTML =
        data.distribution.map(item => `

            <div class="distribution-row">

                <div class="distribution-info">

                    <div class="distribution-icon">

                        <i class="fa-solid fa-paw"></i>

                    </div>

                    <div>

                        <strong>
                            ${item.species}
                        </strong>

                        <span>
                            ${item.locations.length}
                            monitoring locations
                        </span>

                    </div>

                </div>

                <div class="distribution-value">

                    <strong>
                        ${item.total_population}
                    </strong>

                    <small>
                        animals
                    </small>

                </div>

            </div>

        `).join("");
}

async function loadPriority() {

    const data =
        await api(
            "/population/biodiversity/conservation-priority"
        );

    const container =
        document.getElementById("priorityData");

    if (
        !data.priority_species ||
        data.priority_species.length === 0
    ) {

        container.innerHTML = `

            <div class="ai-empty-state">

                <i class="fa-solid fa-shield-heart"></i>

                <strong>
                    No Conservation Priorities
                </strong>

                <span>
                    No species currently require priority classification.
                </span>

            </div>

        `;

        return;
    }

    container.innerHTML =
        data.priority_species.map(item => {

            const priority =
                String(item.priority_level || "")
                    .toLowerCase();

            let priorityClass = "priority-low";

            if (
                priority.includes("critical") ||
                priority.includes("high")
            ) {

                priorityClass = "priority-high";

            } else if (
                priority.includes("medium") ||
                priority.includes("moderate")
            ) {

                priorityClass = "priority-medium";

            }

            return `

                <div class="priority-card">

                    <div class="priority-species">

                        <div class="priority-icon">

                            <i class="fa-solid fa-shield-heart"></i>

                        </div>

                        <div>

                            <strong>
                                ${item.species}
                            </strong>

                            <small>
                                Conservation priority
                            </small>

                        </div>

                    </div>

                    <span class="priority-badge ${priorityClass}">
                        ${item.priority_level}
                    </span>

                    <div class="priority-score">

                        <strong>
                            ${item.priority_score}
                        </strong>

                        <small>
                            Score
                        </small>

                    </div>

                </div>

            `;

        }).join("");
}

async function loadPopulationChart() {

    const data =
        await api("/population/ranking/species");

    const labels =
        data.ranking.map(s => s.species);

    const values =
        data.ranking.map(s => s.population);

    const canvas =
        document.getElementById("populationChart");

    new Chart(canvas, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{

                label: "Observed Population",

                data: values,

                borderWidth: 0,

                borderRadius: 8,

                maxBarThickness: 42

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return ` Population: ${context.raw}`;

                        }

                    }

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    grid: {
                        color: "#edf1ee"
                    },

                    ticks: {
                        color: "#7a8d83"
                    }

                },

                x: {

                    grid: {
                        display: false
                    },

                    ticks: {
                        color: "#315746"
                    }

                }

            }

        }

    });
}

(async () => {

    console.log("WPIS Population Intelligence starting...");

    const modules = [
        ["Overview", loadOverview],
        ["Biodiversity", loadBiodiversity],
        ["Species Ranking", loadRanking],
        ["Population Alerts", loadAlerts],
        ["Migration Analysis", loadMigration],
        ["Species Distribution", loadDistribution],
        ["Conservation Priority", loadPriority],
        ["Population Chart", loadPopulationChart]
    ];

    for (const [name, loader] of modules) {

        try {

            await loader();

            console.log(`✓ ${name} loaded`);

        } catch (error) {

            console.error(`✗ ${name} failed:`, error);

        }

    }

    console.log("WPIS Population Intelligence ready.");

})();