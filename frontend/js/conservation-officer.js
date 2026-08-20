// ============================================================
// WPIS - CONSERVATION OFFICER DASHBOARD
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
    // API Error
    // --------------------------------------------------------

    if (!response.ok) {

        let message =
            "Unable to load conservation officer data.";

        try {

            const errorData =
                await response.json();

            message =
                errorData.detail ||
                message;

        } catch {

            // Ignore invalid JSON
        }

        throw new Error(message);
    }


    return response.json();
}


// ============================================================
// DOM HELPERS
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


// ============================================================
// PRIORITY CLASS
// ============================================================

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
// MOBILE MENU
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
// LOAD CONSERVATION PRIORITIES
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
                .slice(0, 8)
                .map(item => {

                    const priority =
                        formatValue(
                            item.priority
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
                                        ${escapeHTML(
                                            item.species
                                        )}
                                    </strong>

                                    <small>
                                        Population:
                                        ${escapeHTML(
                                            formatValue(
                                                item.population,
                                                "0"
                                            )
                                        )}
                                    </small>

                                </div>

                                <span
                                    class="wildlife-status ${getPriorityClass(priority)}"
                                >
                                    ${escapeHTML(priority)}
                                </span>

                            </div>


                            <p>

                                <strong>
                                    Conservation Status:
                                </strong>

                                ${escapeHTML(
                                    formatValue(
                                        item.conservation_status
                                    )
                                )}

                            </p>


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


                            ${
                                reasons.length
                                    ? `

                                        <div>

                                            <strong>
                                                Reasons
                                            </strong>

                                            <ul>

                                                ${reasons
                                                    .map(
                                                        reason =>
                                                            `<li>${escapeHTML(reason)}</li>`
                                                    )
                                                    .join("")}

                                            </ul>

                                        </div>

                                    `
                                    : ""
                            }


                            ${
                                item.recommendation
                                    ? `

                                        <div>

                                            <strong>
                                                Recommended Action
                                            </strong>

                                            <p>
                                                ${escapeHTML(
                                                    item.recommendation
                                                )}
                                            </p>

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
            "Priority loading error:",
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
                    "No Restoration Areas",
                    "No habitat restoration recommendations are currently available."
                );

            return;
        }


        container.innerHTML =
            recommendations
                .slice(0, 8)
                .map(item => {

                    const priority =
                        formatValue(
                            item.priority
                        );


                    const actions =
                        Array.isArray(
                            item.recommended_actions
                        )
                            ? item.recommended_actions
                            : [];


                    const issues =
                        Array.isArray(
                            item.issues
                        )
                            ? item.issues
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
                                    ${escapeHTML(priority)}
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


                            ${
                                issues.length
                                    ? `

                                        <div>

                                            <strong>
                                                Identified Issues
                                            </strong>

                                            <ul>

                                                ${issues
                                                    .map(
                                                        issue =>
                                                            `<li>${escapeHTML(issue)}</li>`
                                                    )
                                                    .join("")}

                                            </ul>

                                        </div>

                                    `
                                    : ""
                            }


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
                                                            `<li>${escapeHTML(action)}</li>`
                                                    )
                                                    .join("")}

                                            </ul>

                                        </div>

                                    `
                                    : ""
                            }


                            ${
                                item.estimated_impact
                                    ? `

                                        <small>

                                            <strong>
                                                Expected Impact:
                                            </strong>

                                            ${escapeHTML(
                                                item.estimated_impact
                                            )}

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
            "Restoration loading error:",
            error
        );


        setText(
            "restorationCount",
            0
        );


        container.innerHTML =
            errorState(
                "Unable to load habitat restoration information."
            );

    }

}


// ============================================================
// LOAD WILDLIFE PROTECTION STRATEGIES
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
                    "No wildlife protection strategies are currently available."
                );

            return;
        }


        container.innerHTML =
            strategies
                .slice(0, 8)
                .map(item => {

                    const status =
                        formatValue(
                            item.conservation_status
                        );


                    const actions =
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
                                        ${escapeHTML(
                                            formatValue(
                                                item.species
                                            )
                                        )}
                                    </strong>

                                    <small>
                                        Population:
                                        ${escapeHTML(
                                            formatValue(
                                                item.population,
                                                "0"
                                            )
                                        )}

                                        ·

                                        Locations:
                                        ${escapeHTML(
                                            formatValue(
                                                item.locations,
                                                "0"
                                            )
                                        )}
                                    </small>

                                </div>

                                <span
                                    class="wildlife-status ${getPriorityClass(status)}"
                                >
                                    ${escapeHTML(status)}
                                </span>

                            </div>


                            ${
                                actions.length
                                    ? `

                                        <div>

                                            <strong>
                                                Recommended Protection
                                            </strong>

                                            <ul>

                                                ${actions
                                                    .map(
                                                        action =>
                                                            `<li>${escapeHTML(action)}</li>`
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
            "Protection loading error:",
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
// LOAD MONITORING PLANS
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
                    "No monitoring optimization plans are currently available."
                );

            return;
        }


        container.innerHTML =
            plans
                .slice(0, 8)
                .map(item => {

                    const resources =
                        Array.isArray(
                            item.recommended_resources
                        )
                            ? item.recommended_resources
                            : [];


                    const score =
                        Number(
                            item.priority_score
                        );


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
                                    class="wildlife-status ${getPriorityClass(
                                        Number.isFinite(score)
                                            ? score >= 60
                                                ? "High"
                                                : score >= 30
                                                    ? "Medium"
                                                    : "Low"
                                            : ""
                                    )}"
                                >
                                    Score:
                                    ${escapeHTML(
                                        formatValue(
                                            item.priority_score,
                                            "0"
                                        )
                                    )}
                                </span>

                            </div>


                            <p>

                                <strong>
                                    Monitoring Frequency:
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
                                                Recommended Resources
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
            "Monitoring loading error:",
            error
        );


        setText(
            "monitoringCount",
            0
        );


        container.innerHTML =
            errorState(
                "Unable to load monitoring optimization plans."
            );

    }

}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadConservationOfficerDashboard() {

    console.log(
        "WPIS Conservation Officer Dashboard starting..."
    );


    // --------------------------------------------------------
    // Load all modules independently.
    // One failure should not break the entire dashboard.
    // --------------------------------------------------------

    try {

        await loadPriority();

        console.log(
            "✓ Priority data loaded"
        );

    }

    catch (error) {

        console.error(
            "Priority module failed:",
            error
        );

    }


    try {

        await loadRestoration();

        console.log(
            "✓ Restoration data loaded"
        );

    }

    catch (error) {

        console.error(
            "Restoration module failed:",
            error
        );

    }


    try {

        await loadProtection();

        console.log(
            "✓ Protection data loaded"
        );

    }

    catch (error) {

        console.error(
            "Protection module failed:",
            error
        );

    }


    try {

        await loadMonitoring();

        console.log(
            "✓ Monitoring data loaded"
        );

    }

    catch (error) {

        console.error(
            "Monitoring module failed:",
            error
        );

    }


    console.log(
        "WPIS Conservation Officer Dashboard ready."
    );

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadConservationOfficerDashboard();

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