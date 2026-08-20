// ============================================================
// WPIS - CONSERVATION INTELLIGENCE
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


    // Authentication failure

    if (response.status === 401) {

        localStorage.removeItem("wpis_token");

        localStorage.removeItem("wpis_user");

        location.href = "login.html";

        return null;

    }


    // API failure

    if (!response.ok) {

        let message = "Unable to load conservation data.";

        try {

            const error =
                await response.json();

            message =
                error.detail ||
                message;

        }

        catch {

            // Ignore invalid JSON

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
// EMPTY STATE
// ============================================================

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


// ============================================================
// ERROR STATE
// ============================================================

function errorState(
    message
) {

    return `

        <div class="ai-empty-state">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <strong>
                Data unavailable
            </strong>

            <span>
                ${message}
            </span>

        </div>

    `;

}


// ============================================================
// FORMAT TEXT
// ============================================================

function formatText(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "Not available";

    }


    return String(value);

}


// ============================================================
// FORMAT PRIORITY CLASS
// ============================================================

function getPriorityClass(priority) {

    const value =
        String(priority || "")
            .toLowerCase();


    if (
        value.includes("critical") ||
        value.includes("high")
    ) {

        return "status-danger";

    }


    if (
        value.includes("medium") ||
        value.includes("moderate")
    ) {

        return "status-warning";

    }


    if (
        value.includes("low")
    ) {

        return "status-safe";

    }


    return "status-neutral";

}


// ============================================================
// LOAD TOP CARDS
// ============================================================

async function loadTopCards() {

    const overview =
        await api(
            "/population/overview"
        );


    const biodiversity =
        await api(
            "/population/biodiversity/index"
        );


    setText(
        "totalPopulation",
        overview?.total_population ?? 0
    );


    setText(
        "speciesRichness",
        overview?.species_richness ?? 0
    );


    const biodiversityValue =
        Number(
            biodiversity
                ?.shannon_diversity_index
        );


    setText(
        "biodiversityIndex",
        Number.isFinite(biodiversityValue)
            ? biodiversityValue.toFixed(2)
            : "0.00"
    );


    const locations =
        overview?.population_by_location
            ? Object.keys(
                overview.population_by_location
            ).length
            : 0;


    setText(
        "locations",
        locations
    );

}


// ============================================================
// LOAD CONSERVATION PRIORITY
// ============================================================

async function loadPriority() {

    const container =
        document.getElementById(
            "priorityData"
        );


    if (!container) return;


    try {

        const data =
            await api(
                "/conservation/priority"
            );


        const recommendations =
            Array.isArray(
                data?.recommendations
            )
                ? data.recommendations
                : [];


        setText(
            "priorityCount",
            recommendations.length
        );


        if (!recommendations.length) {

            container.innerHTML =
                emptyState(
                    "fa-shield-check",
                    "No Priority Species",
                    "No species currently require priority conservation attention."
                );

            return;

        }


        container.innerHTML =
            recommendations
                .map(item => {

                    const priority =
                        formatText(
                            item.priority
                        );


                    const priorityClass =
                        getPriorityClass(
                            priority
                        );


                    const reasons =
                        Array.isArray(
                            item.reason
                        )
                            ? item.reason
                            : [];


                    return `

                        <div class="mini-item">

                            <div class="panel-heading">

                                <div>

                                    <strong>
                                        ${formatText(
                                            item.species
                                        )}
                                    </strong>

                                    <small>
                                        Population:
                                        ${formatText(
                                            item.population
                                        )}
                                    </small>

                                </div>


                                <span
                                    class="wildlife-status ${priorityClass}"
                                >
                                    ${priority}
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Conservation Status:
                                </strong>

                                ${formatText(
                                    item.conservation_status
                                )}

                            </div>


                            <div>

                                <strong>
                                    Priority Score:
                                </strong>

                                ${formatText(
                                    item.priority_score
                                )}

                            </div>


                            ${
                                reasons.length
                                    ? `

                                        <ul>

                                            ${reasons
                                                .map(
                                                    reason =>
                                                        `<li>${reason}</li>`
                                                )
                                                .join("")}

                                        </ul>

                                    `
                                    : ""
                            }


                            ${
                                item.recommendation
                                    ? `

                                        <small>

                                            <strong>
                                                Recommended Action:
                                            </strong>

                                            ${item.recommendation}

                                        </small>

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
            "Conservation priority error:",
            error
        );


        setText(
            "priorityCount",
            0
        );


        container.innerHTML =
            errorState(
                "Unable to load conservation priorities."
            );

    }

}


// ============================================================
// LOAD HABITAT RESTORATION
// ============================================================

async function loadRestoration() {

    const container =
        document.getElementById(
            "restorationData"
        );


    if (!container) return;


    try {

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


        setText(
            "restorationCount",
            recommendations.length
        );


        if (!recommendations.length) {

            container.innerHTML =
                emptyState(
                    "fa-seedling",
                    "No Restoration Recommendations",
                    "Habitat restoration recommendations will appear after assessments."
                );

            return;

        }


        container.innerHTML =
            recommendations
                .map(item => {

                    const priority =
                        formatText(
                            item.priority
                        );


                    const priorityClass =
                        getPriorityClass(
                            priority
                        );


                    const actions =
                        Array.isArray(
                            item.recommended_actions
                        )
                            ? item.recommended_actions
                            : [];


                    return `

                        <div class="mini-item">

                            <div class="panel-heading">

                                <div>

                                    <strong>
                                        ${formatText(
                                            item.location
                                        )}
                                    </strong>

                                    <small>
                                        Habitat restoration area
                                    </small>

                                </div>


                                <span
                                    class="wildlife-status ${priorityClass}"
                                >
                                    ${priority}
                                </span>

                            </div>


                            ${
                                actions.length
                                    ? `

                                        <div>

                                            <strong>
                                                Recommended Actions
                                            </strong>

                                            <ul>

                                                ${actions
                                                    .map(
                                                        action =>
                                                            `<li>${action}</li>`
                                                    )
                                                    .join("")}

                                            </ul>

                                        </div>

                                    `
                                    : `

                                        <small>
                                            No specific restoration actions available.
                                        </small>

                                    `
                            }

                        </div>

                    `;

                })
                .join("");

    }


    catch (error) {

        console.error(
            "Restoration error:",
            error
        );


        setText(
            "restorationCount",
            0
        );


        container.innerHTML =
            errorState(
                "Unable to load restoration recommendations."
            );

    }

}


// ============================================================
// LOAD WILDLIFE PROTECTION
// ============================================================

async function loadProtection() {

    const container =
        document.getElementById(
            "protectionData"
        );


    if (!container) return;


    try {

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


        setText(
            "protectionCount",
            strategies.length
        );


        if (!strategies.length) {

            container.innerHTML =
                emptyState(
                    "fa-shield-heart",
                    "No Protection Strategies",
                    "Species-specific protection strategies will appear here."
                );

            return;

        }


        container.innerHTML =
            strategies
                .map(item => {

                    const status =
                        formatText(
                            item.conservation_status
                        );


                    const strategiesList =
                        Array.isArray(
                            item.recommended_strategies
                        )
                            ? item.recommended_strategies
                            : [];


                    return `

                        <div class="mini-item">

                            <div class="panel-heading">

                                <div>

                                    <strong>
                                        ${formatText(
                                            item.species
                                        )}
                                    </strong>

                                    <small>
                                        Population:
                                        ${formatText(
                                            item.population
                                        )}
                                    </small>

                                </div>


                                <span
                                    class="wildlife-status ${getPriorityClass(status)}"
                                >
                                    ${status}
                                </span>

                            </div>


                            ${
                                strategiesList.length
                                    ? `

                                        <div>

                                            <strong>
                                                Protection Strategies
                                            </strong>

                                            <ul>

                                                ${strategiesList
                                                    .map(
                                                        strategy =>
                                                            `<li>${strategy}</li>`
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
            "Protection error:",
            error
        );


        setText(
            "protectionCount",
            0
        );


        container.innerHTML =
            errorState(
                "Unable to load wildlife protection strategies."
            );

    }

}


// ============================================================
// LOAD MONITORING OPTIMIZATION
// ============================================================

async function loadMonitoring() {

    const container =
        document.getElementById(
            "monitoringData"
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


        setText(
            "monitoringCount",
            plans.length
        );


        if (!plans.length) {

            container.innerHTML =
                emptyState(
                    "fa-radar",
                    "No Monitoring Plans",
                    "Monitoring optimization recommendations will appear here."
                );

            return;

        }


        container.innerHTML =
            plans
                .map(item => {

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
                                        ${formatText(
                                            item.location
                                        )}
                                    </strong>

                                    <small>
                                        ${formatText(
                                            item.habitat_type
                                        )}
                                    </small>

                                </div>


                                <span
                                    class="wildlife-status ${getPriorityClass(
                                        item.priority_score
                                    )}"
                                >
                                    Score:
                                    ${formatText(
                                        item.priority_score
                                    )}
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Monitoring Frequency:
                                </strong>

                                ${formatText(
                                    item.monitoring_frequency
                                )}

                            </div>


                            ${
                                resources.length
                                    ? `

                                        <div>

                                            <strong>
                                                Recommended Resources
                                            </strong>

                                            <ul>

                                                ${resources
                                                    .map(
                                                        resource =>
                                                            `<li>${resource}</li>`
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
            "Monitoring optimization error:",
            error
        );


        setText(
            "monitoringCount",
            0
        );


        container.innerHTML =
            errorState(
                "Unable to load monitoring recommendations."
            );

    }

}


// ============================================================
// LOAD ALL CONSERVATION MODULES
// ============================================================

async function loadConservationDashboard() {

    console.log(
        "WPIS Conservation Intelligence starting..."
    );


    // --------------------------------------------------------
    // TOP CARDS
    // --------------------------------------------------------

    try {

        await loadTopCards();

        console.log(
            "✓ Conservation overview loaded"
        );

    }

    catch (error) {

        console.error(
            "✗ Conservation overview failed:",
            error
        );

    }


    // --------------------------------------------------------
    // PRIORITY
    // --------------------------------------------------------

    try {

        await loadPriority();

        console.log(
            "✓ Conservation priorities loaded"
        );

    }

    catch (error) {

        console.error(
            "✗ Conservation priorities failed:",
            error
        );

    }


    // --------------------------------------------------------
    // RESTORATION
    // --------------------------------------------------------

    try {

        await loadRestoration();

        console.log(
            "✓ Restoration recommendations loaded"
        );

    }

    catch (error) {

        console.error(
            "✗ Restoration recommendations failed:",
            error
        );

    }


    // --------------------------------------------------------
    // PROTECTION
    // --------------------------------------------------------

    try {

        await loadProtection();

        console.log(
            "✓ Protection strategies loaded"
        );

    }

    catch (error) {

        console.error(
            "✗ Protection strategies failed:",
            error
        );

    }


    // --------------------------------------------------------
    // MONITORING
    // --------------------------------------------------------

    try {

        await loadMonitoring();

        console.log(
            "✓ Monitoring optimization loaded"
        );

    }

    catch (error) {

        console.error(
            "✗ Monitoring optimization failed:",
            error
        );

    }


    console.log(
        "WPIS Conservation Intelligence ready."
    );

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadConservationDashboard();

    }
);