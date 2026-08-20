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

        throw new Error(`API Error (${response.status})`);

    }

    return response.json();

}


// ===========================================
// BIODIVERSITY
// ===========================================

async function loadBiodiversity() {

    const data = await api("/health/biodiversity-score");

    document.getElementById("biodiversityData").innerHTML = `
        <div class="mini-item">

            <strong>Overall Score</strong><br>

            ${data.biodiversity_score}<br><br>

            <strong>Status:</strong> ${data.health}<br>

            <strong>Species Richness:</strong> ${data.species_richness}<br>

            <strong>Shannon Index:</strong> ${data.shannon_index}<br>

            <strong>Evenness:</strong> ${data.evenness}

        </div>
    `;

}


// ===========================================
// HABITAT
// ===========================================

async function loadHabitatScore() {

    const data = await api("/health/habitat-score");

    document.getElementById("habitatData").innerHTML =
        data.habitats.map(item => `
            <div class="mini-item">

                <strong>${item.location}</strong><br>

                ${item.habitat_type}<br>

                Score: ${item.score}<br>

                ${item.health}

            </div>

            <hr>
        `).join("");

}


// ===========================================
// CONSERVATION
// ===========================================

async function loadConservationScore() {

    const data = await api("/health/conservation-score");

    document.getElementById("conservationData").innerHTML =
        data.species.map(item => `
            <div class="mini-item">

                <strong>${item.species}</strong><br>

                Population: ${item.population}<br>

                Conservation Status: ${item.conservation_status}<br>

                Score: ${item.score}<br>

                Health: ${item.health}

            </div>

            <hr>
        `).join("");

}


// ===========================================
// POPULATION STABILITY
// ===========================================

async function loadPopulationStability() {

    const data = await api("/health/population-stability");

    document.getElementById("populationData").innerHTML =
        data.species.map(item => `
            <div class="mini-item">

                <strong>${item.species}</strong><br>

                Stability Score: ${item.stability_score}<br>

                Average Population: ${item.average_population}<br>

                Observations: ${item.observations}<br>

                ${item.health}

            </div>

            <hr>
        `).join("");

}


// ===========================================
// ECOSYSTEM HEALTH
// ===========================================

async function loadEcosystemHealth() {

    const data = await api("/health/ecosystem");

    document.getElementById("ecosystemData").innerHTML = `

        <div class="mini-item">

            <strong>Ecosystem Score</strong><br>

            ${data.ecosystem_health_score}<br><br>

            <strong>Status:</strong> ${data.ecosystem_status}

            <hr>

            <strong>Biodiversity:</strong>
            ${data.component_scores.biodiversity_score}<br>

            <strong>Habitat:</strong>
            ${data.component_scores.habitat_quality_score}<br>

            <strong>Conservation:</strong>
            ${data.component_scores.species_conservation_score}<br>

            <strong>Population Stability:</strong>
            ${data.component_scores.population_stability_score}<br>

            <strong>Environment:</strong>
            ${data.component_scores.environmental_condition_score}

        </div>

    `;

}


// ===========================================
// PAGE LOAD
// ===========================================

window.addEventListener("DOMContentLoaded", async () => {

    try {

        await Promise.all([

            loadBiodiversity(),
            loadHabitatScore(),
            loadConservationScore(),
            loadPopulationStability(),
            loadEcosystemHealth()

        ]);

    }

    catch (error) {

        console.error("Health page error:", error);

    }

});

// ===========================================
// SUMMARY CARDS
// ===========================================

async function loadSummaryCards() {

    const biodiversity = await api("/health/biodiversity-score");
    const conservation = await api("/health/conservation-score");

    // Total population
    const totalPopulation = conservation.species.reduce(
        (sum, item) => sum + item.population,
        0
    );

    // Number of locations
    const locations = new Set(
        conservation.species.map(item => item.locations)
    ).size;

    document.getElementById("totalPopulation").textContent =
        totalPopulation;

    document.getElementById("speciesRichness").textContent =
        biodiversity.species_richness;

    document.getElementById("biodiversityIndex").textContent =
        biodiversity.biodiversity_score;

    document.getElementById("locations").textContent =
        locations;

}

window.addEventListener("DOMContentLoaded", async () => {

    try {

        await loadSummaryCards();

        await Promise.all([

            loadBiodiversity(),
            loadHabitatScore(),
            loadConservationScore(),
            loadPopulationStability(),
            loadEcosystemHealth()

        ]);

    }

    catch (error) {

        console.error("Health page error:", error);

    }

});