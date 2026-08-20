// ============================================================
// WPIS - ROLE-BASED REPORTS & EXPORT SYSTEM
// ============================================================

const API_BASE =
    localStorage.getItem("wpis_api_base") ||
    "http://127.0.0.1:8000";

const token = () =>
    localStorage.getItem("wpis_token");

let currentReport = null;


// ============================================================
// REPORT DEFINITIONS
// ============================================================

const REPORT_DEFINITIONS = {

    wildlife: {
        label: "Wildlife Survey Report"
    },

    population: {
        label: "Species Population Report"
    },

    biodiversity: {
        label: "Biodiversity Report"
    },

    habitat: {
        label: "Habitat Assessment Report"
    },

    conservation: {
        label: "Conservation Report"
    },

    field_wildlife: {
        label: "Wildlife Field Survey Report"
    },

    protected_area: {
        label: "Protected Area & Habitat Report"
    },

    field_conservation: {
        label: "Field Conservation Report"
    }

};


// ============================================================
// ROLE REPORT ACCESS
// ============================================================

const ROLE_REPORTS = {

    wildlife_researcher: [
        "wildlife",
        "population",
        "biodiversity",
        "habitat"
    ],

    conservation_officer: [
        "population",
        "biodiversity",
        "habitat",
        "conservation"
    ],

    forest_department_officer: [
        "field_wildlife",
        "population",
        "protected_area",
        "field_conservation"
    ],

    administrator: [
        "wildlife",
        "population",
        "biodiversity",
        "habitat",
        "conservation"
    ]

};


// ============================================================
// API HELPER
// ============================================================

async function api(path) {

    const response =
        await fetch(
            `${API_BASE}${path}`,
            {
                headers:
                    token()
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
            "Unable to load report data.";

        try {

            const error =
                await response.json();

            message =
                error.detail ||
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
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return fallback;
    }

    return value;
}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent =
        value ?? "--";
}


function formatDate(value) {

    if (!value) {
        return "Not available";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString();
}


// ============================================================
// USER / ROLE
// ============================================================

function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem("wpis_user")
        );

    } catch {

        return null;

    }
}


function getCurrentRole() {

    return (
        getCurrentUser()?.role ||
        "wildlife_researcher"
    );

}


function getRoleLabel(role) {

    const labels = {

        wildlife_researcher:
            "Wildlife Researcher",

        conservation_officer:
            "Conservation Officer",

        forest_department_officer:
            "Forest Department Officer",

        administrator:
            "Administrator"

    };

    return labels[role] || "WPIS User";
}


function getDashboardForRole(role) {

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

    return (
        dashboards[role] ||
        "researcher-dashboard.html"
    );
}


// ============================================================
// ROLE UI
// ============================================================

function configureRoleReports() {

    const role =
        getCurrentRole();

    const roleLabel =
        getRoleLabel(role);

    const allowedReports =
        ROLE_REPORTS[role] ||
        ROLE_REPORTS.wildlife_researcher;

    const select =
        document.getElementById("reportType");

    if (!select) return;

    select.innerHTML =
        allowedReports
            .map(reportKey => {

                return `
                    <option value="${reportKey}">
                        ${escapeHTML(
                            REPORT_DEFINITIONS[reportKey].label
                        )}
                    </option>
                `;

            })
            .join("");


    const dashboard =
        getDashboardForRole(role);

    const dashboardNav =
        document.getElementById("dashboardNav");

    const reportsBrand =
        document.getElementById("reportsBrand");

    if (dashboardNav) {
        dashboardNav.href = dashboard;
    }

    if (reportsBrand) {
        reportsBrand.href = dashboard;
    }

    setText(
        "reportsSubtitle",
        `${roleLabel} — role-specific intelligence reporting`
    );

    setText(
        "reportRoleDescription",
        `Reports and analytics available for ${roleLabel}.`
    );
}


// ============================================================
// STATUS
// ============================================================

function setStatus(
    message,
    type = "info"
) {

    const element =
        document.getElementById("reportStatus");

    if (!element) return;

    let icon =
        "fa-circle-info";

    if (type === "loading") {
        icon = "fa-circle-notch fa-spin";
    }

    else if (type === "success") {
        icon = "fa-circle-check";
    }

    else if (type === "error") {
        icon = "fa-triangle-exclamation";
    }

    element.className =
        `report-status ${type}`;

    element.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHTML(message)}</span>
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
// 1. WILDLIFE SURVEY REPORT
// ============================================================

async function buildWildlifeReport() {

    const records =
        await api("/wildlife");

    const list =
        Array.isArray(records)
            ? records
            : records?.items || [];

    const rows =
        list.map(item => ({

            Species:
                item.species_name ||
                item.species ||
                item.name ||
                "Unknown",

            Location:
                item.location ||
                "Not available",

            Count:
                item.count ??
                item.population ??
                1,

            ConservationStatus:
                item.conservation_status ||
                "Not Evaluated",

            Behavior:
                item.behavior ||
                "Unknown"

        }));

    return {

        title:
            "Wildlife Survey Report",

        subtitle:
            "Wildlife observations recorded by WPIS",

        summary: [

            ["Total Records", rows.length],

            [
                "Observed Animals",
                rows.reduce(
                    (total, row) =>
                        total +
                        Number(row.Count || 0),
                    0
                )
            ],

            [
                "Unique Species",
                new Set(
                    rows.map(
                        row => row.Species
                    )
                ).size
            ]

        ],

        columns: [
            "Species",
            "Location",
            "Count",
            "ConservationStatus",
            "Behavior"
        ],

        rows

    };
}


// ============================================================
// 2. POPULATION REPORT
// ============================================================

async function buildPopulationReport() {

    const overview =
        await api("/population/overview");

    const ranking =
        await api("/population/ranking/species");

    const rows =
        Array.isArray(ranking?.ranking)
            ? ranking.ranking.map(item => ({

                Rank:
                    item.rank,

                Species:
                    item.species,

                Population:
                    item.population,

                Percentage:
                    item.percentage !== undefined
                        ? `${item.percentage}%`
                        : "Not available"

            }))
            : [];

    return {

        title:
            "Species Population Report",

        subtitle:
            "Species-wise population intelligence",

        summary: [

            [
                "Total Population",
                overview?.total_population ?? 0
            ],

            [
                "Species Richness",
                overview?.species_richness ?? 0
            ],

            [
                "Most Abundant Species",
                overview?.most_abundant_species ||
                "No data"
            ]

        ],

        columns: [
            "Rank",
            "Species",
            "Population",
            "Percentage"
        ],

        rows

    };
}


// ============================================================
// 3. BIODIVERSITY REPORT
// ============================================================

async function buildBiodiversityReport() {

    const overview =
        await api("/population/overview");

    const biodiversity =
        await api("/population/biodiversity/index");

    const diversity =
        await api("/population/biodiversity/diversity");

    const rows = [];

    if (
        biodiversity?.shannon_diversity_index !==
        undefined
    ) {

        rows.push({

            Metric:
                "Shannon Diversity Index",

            Value:
                Number(
                    biodiversity.shannon_diversity_index
                ).toFixed(2)

        });

    }

    if (
        biodiversity?.species_richness !==
        undefined
    ) {

        rows.push({

            Metric:
                "Species Richness",

            Value:
                biodiversity.species_richness

        });

    }

    if (
        diversity?.species_richness !==
        undefined
    ) {

        rows.push({

            Metric:
                "Species Richness Analysis",

            Value:
                diversity.species_richness

        });

    }

    return {

        title:
            "Biodiversity Report",

        subtitle:
            "Biodiversity and species diversity assessment",

        summary: [

            [
                "Total Population",
                overview?.total_population ?? 0
            ],

            [
                "Species Richness",
                overview?.species_richness ?? 0
            ],

            [
                "Shannon Index",
                biodiversity?.shannon_diversity_index !==
                undefined
                    ? Number(
                        biodiversity.shannon_diversity_index
                    ).toFixed(2)
                    : "Not available"
            ]

        ],

        columns: [
            "Metric",
            "Value"
        ],

        rows

    };
}


// ============================================================
// 4. HABITAT REPORT
// ============================================================

async function buildHabitatReport() {

    const classifications =
        await api("/habitat/classifications");

    const suitability =
        await api("/habitat/suitability");

    const habitats =
        Array.isArray(
            classifications?.habitats
        )
            ? classifications.habitats
            : [];

    const analysis =
        Array.isArray(
            suitability?.suitability_analysis
        )
            ? suitability.suitability_analysis
            : [];

    const rows = [];

    habitats.forEach(habitat => {

        const match =
            analysis.find(
                item =>
                    item.location ===
                    habitat.location
            );

        rows.push({

            Location:
                habitat.location ||
                "Unknown",

            Habitat:
                habitat.habitat_type ||
                "Not available",

            AreaKm2:
                habitat.area_km2 ??
                "Not available",

            Protected:
                habitat.protected_area
                    ? "Yes"
                    : "No",

            Suitability:
                match?.suitability ||
                "Not evaluated",

            Score:
                match?.suitability_score ??
                "Not available"

        });

    });

    return {

        title:
            "Habitat Assessment Report",

        subtitle:
            "Habitat classification and suitability assessment",

        summary: [

            [
                "Habitat Locations",
                habitats.length
            ],

            [
                "Protected Areas",
                habitats.filter(
                    habitat =>
                        habitat.protected_area
                ).length
            ],

            [
                "Suitability Assessments",
                analysis.length
            ]

        ],

        columns: [
            "Location",
            "Habitat",
            "AreaKm2",
            "Protected",
            "Suitability",
            "Score"
        ],

        rows

    };
}


// ============================================================
// 5. CONSERVATION OFFICER REPORT
// ============================================================

async function buildConservationReport() {

    const priority =
        await api("/conservation/priority");

    const restoration =
        await api("/conservation/restoration");

    const protection =
        await api("/conservation/protection");

    const monitoring =
        await api("/conservation/monitoring");

    const priorityRows =
        Array.isArray(
            priority?.recommendations
        )
            ? priority.recommendations
            : [];

    const restorationRows =
        Array.isArray(
            restoration?.restoration_recommendations
        )
            ? restoration.restoration_recommendations
            : [];

    const protectionRows =
        Array.isArray(
            protection?.protection_strategies
        )
            ? protection.protection_strategies
            : [];

    const monitoringRows =
        Array.isArray(
            monitoring?.monitoring_plan
        )
            ? monitoring.monitoring_plan
            : [];

    const rows = [];


    // Priority species

    priorityRows.forEach(item => {

        rows.push({

            Type:
                "Conservation Priority",

            Subject:
                item.species ||
                "Unknown",

            Priority:
                item.priority ||
                "Not available",

            Score:
                item.priority_score ??
                "Not available",

            Action:
                item.recommendation ||
                "Not available"

        });

    });


    // Restoration

    restorationRows.forEach(item => {

        rows.push({

            Type:
                "Habitat Restoration",

            Subject:
                item.location ||
                "Unknown",

            Priority:
                item.priority ||
                "Not available",

            Score:
                "—",

            Action:
                Array.isArray(
                    item.recommended_actions
                )
                    ? item.recommended_actions.join(
                        "; "
                    )
                    : "Not available"

        });

    });


    // Protection

    protectionRows.forEach(item => {

        rows.push({

            Type:
                "Wildlife Protection",

            Subject:
                item.species ||
                "Unknown",

            Priority:
                item.conservation_status ||
                "Not available",

            Score:
                "—",

            Action:
                Array.isArray(
                    item.recommended_strategies
                )
                    ? item.recommended_strategies.join(
                        "; "
                    )
                    : "Not available"

        });

    });


    // Monitoring

    monitoringRows.forEach(item => {

        rows.push({

            Type:
                "Monitoring Optimization",

            Subject:
                item.location ||
                "Unknown",

            Priority:
                "Monitoring",

            Score:
                item.priority_score ??
                "Not available",

            Action:
                Array.isArray(
                    item.recommended_resources
                )
                    ? item.recommended_resources.join(
                        "; "
                    )
                    : "Not available"

        });

    });


    return {

        title:
            "Conservation Action Report",

        subtitle:
            "Conservation priorities, habitat restoration, wildlife protection and monitoring actions",

        summary: [

            [
                "Priority Species",
                priorityRows.length
            ],

            [
                "Restoration Areas",
                restorationRows.length
            ],

            [
                "Protection Strategies",
                protectionRows.length
            ],

            [
                "Monitoring Plans",
                monitoringRows.length
            ]

        ],

        columns: [
            "Type",
            "Subject",
            "Priority",
            "Score",
            "Action"
        ],

        rows

    };
}


// ============================================================
// 6. FOREST WILDLIFE FIELD SURVEY
// ============================================================

async function buildFieldWildlifeReport() {

    const records =
        await api("/wildlife");

    const sites =
        await api("/monitoring/");

    const wildlifeList =
        Array.isArray(records)
            ? records
            : records?.items || [];

    const siteList =
        Array.isArray(sites)
            ? sites
            : sites?.items || [];

    const protectedLocations =
        new Set(
            siteList
                .filter(
                    site =>
                        site.protected_area === true
                )
                .map(
                    site =>
                        String(
                            site.location ||
                            site.site_name ||
                            ""
                        ).toLowerCase()
                )
        );


    const rows =
        wildlifeList.map(item => {

            const location =
                item.location ||
                "Not available";

            const isProtected =
                protectedLocations.has(
                    String(
                        location
                    ).toLowerCase()
                );

            return {

                Species:
                    item.species_name ||
                    item.species ||
                    item.name ||
                    "Unknown",

                Location:
                    location,

                Count:
                    item.count ??
                    item.population ??
                    1,

                ProtectedArea:
                    isProtected
                        ? "Yes"
                        : "No",

                ConservationStatus:
                    item.conservation_status ||
                    "Not Evaluated",

                Behavior:
                    item.behavior ||
                    "Unknown"

            };

        });


    return {

        title:
            "Wildlife Field Survey Report",

        subtitle:
            "Forest Department field observations and protected-area context",

        summary: [

            [
                "Wildlife Observations",
                rows.length
            ],

            [
                "Observed Animals",
                rows.reduce(
                    (total, row) =>
                        total +
                        Number(row.Count || 0),
                    0
                )
            ],

            [
                "Protected-Area Observations",
                rows.filter(
                    row =>
                        row.ProtectedArea ===
                        "Yes"
                ).length
            ]

        ],

        columns: [

            "Species",
            "Location",
            "Count",
            "ProtectedArea",
            "ConservationStatus",
            "Behavior"

        ],

        rows

    };
}


// ============================================================
// 7. FOREST PROTECTED AREA REPORT
// ============================================================

async function buildProtectedAreaReport() {

    const sites =
        await api("/monitoring/");

    const list =
        Array.isArray(sites)
            ? sites
            : sites?.items || [];


    const rows =
        list.map(site => ({

            Site:
                site.site_name ||
                "Unknown",

            Location:
                site.location ||
                "Not available",

            Habitat:
                site.habitat_type ||
                "Not available",

            AreaKm2:
                site.area_km2 ??
                "Not available",

            ProtectedArea:
                site.protected_area
                    ? "Yes"
                    : "No",

            Latitude:
                site.latitude ??
                "Not available",

            Longitude:
                site.longitude ??
                "Not available"

        }));


    return {

        title:
            "Protected Area & Habitat Report",

        subtitle:
            "Forest Department monitoring-site and habitat assessment",

        summary: [

            [
                "Monitoring Sites",
                rows.length
            ],

            [
                "Protected Areas",
                rows.filter(
                    row =>
                        row.ProtectedArea ===
                        "Yes"
                ).length
            ],

            [
                "Total Area (km²)",
                rows.reduce(
                    (total, row) =>
                        total +
                        (
                            Number(
                                row.AreaKm2
                            ) || 0
                        ),
                    0
                )
            ]

        ],

        columns: [

            "Site",
            "Location",
            "Habitat",
            "AreaKm2",
            "ProtectedArea",
            "Latitude",
            "Longitude"

        ],

        rows

    };
}


// ============================================================
// 8. FOREST FIELD CONSERVATION REPORT
// ============================================================

async function buildFieldConservationReport() {

    const protection =
        await api("/conservation/protection");

    const monitoring =
        await api("/conservation/monitoring");

    const movement =
        await api("/population/migration");

    const protectionRows =
        Array.isArray(
            protection?.protection_strategies
        )
            ? protection.protection_strategies
            : [];

    const monitoringRows =
        Array.isArray(
            monitoring?.monitoring_plan
        )
            ? monitoring.monitoring_plan
            : [];

    const movementRows =
        Array.isArray(
            movement?.species_movement
        )
            ? movement.species_movement
            : [];

    const rows = [];


    protectionRows.forEach(item => {

        rows.push({

            Category:
                "Wildlife Protection",

            Subject:
                item.species ||
                "Unknown",

            Location:
                item.location ||
                "Not available",

            Priority:
                item.conservation_status ||
                "Not available",

            Action:
                Array.isArray(
                    item.recommended_strategies
                )
                    ? item.recommended_strategies.join(
                        "; "
                    )
                    : "Not available"

        });

    });


    monitoringRows.forEach(item => {

        rows.push({

            Category:
                "Patrol / Monitoring",

            Subject:
                item.habitat_type ||
                "Monitoring Site",

            Location:
                item.location ||
                "Unknown",

            Priority:
                item.priority_score ??
                "Not available",

            Action:
                Array.isArray(
                    item.recommended_resources
                )
                    ? item.recommended_resources.join(
                        "; "
                    )
                    : "Not available"

        });

    });


    movementRows.forEach(item => {

        rows.push({

            Category:
                "Wildlife Movement",

            Subject:
                item.species ||
                "Unknown",

            Location:
                `${item.locations_visited ?? 0} locations visited`,

            Priority:
                item.migration_detected
                    ? "Movement Detected"
                    : "Stable",

            Action:
                `${item.total_population_observed ?? 0} animals observed`

        });

    });


    return {

        title:
            "Field Conservation Report",

        subtitle:
            "Forest Department protection, monitoring and wildlife movement intelligence",

        summary: [

            [
                "Protection Strategies",
                protectionRows.length
            ],

            [
                "Monitoring Plans",
                monitoringRows.length
            ],

            [
                "Movement Records",
                movementRows.length
            ]

        ],

        columns: [

            "Category",
            "Subject",
            "Location",
            "Priority",
            "Action"

        ],

        rows

    };
}


// ============================================================
// BUILD SELECTED REPORT
// ============================================================

async function buildSelectedReport() {

    const type =
        document.getElementById(
            "reportType"
        ).value;

    const role =
        getCurrentRole();

    const allowed =
        ROLE_REPORTS[role] ||
        ROLE_REPORTS.wildlife_researcher;


    if (!allowed.includes(type)) {

        throw new Error(
            "This report is not available for your role."
        );

    }


    switch (type) {

        case "wildlife":
            return buildWildlifeReport();

        case "population":
            return buildPopulationReport();

        case "biodiversity":
            return buildBiodiversityReport();

        case "habitat":
            return buildHabitatReport();

        case "conservation":
            return buildConservationReport();

        case "field_wildlife":
            return buildFieldWildlifeReport();

        case "protected_area":
            return buildProtectedAreaReport();

        case "field_conservation":
            return buildFieldConservationReport();

        default:

            throw new Error(
                "Unknown report type."
            );

    }
}


// ============================================================
// REPORT PREVIEW
// ============================================================

function renderReport(report) {

    const container =
        document.getElementById(
            "reportPreview"
        );

    if (!container) return;

    currentReport =
        report;


    const summaryHTML =
        report.summary
            .map(
                ([label, value]) => `

                    <div class="report-summary-card">

                        <span>
                            ${escapeHTML(label)}
                        </span>

                        <strong>
                            ${escapeHTML(value)}
                        </strong>

                    </div>

                `
            )
            .join("");


    const rowsHTML =
        report.rows.length

            ? report.rows
                .slice(0, 100)
                .map(
                    row => `

                        <tr>

                            ${report.columns
                                .map(
                                    column =>
                                        `
                                        <td>
                                            ${escapeHTML(
                                                row[column]
                                            )}
                                        </td>
                                        `
                                )
                                .join("")}

                        </tr>

                    `
                )
                .join("")

            : `

                <tr>

                    <td
                        colspan="${report.columns.length}"
                    >

                        No report records available.

                    </td>

                </tr>

            `;


    container.innerHTML = `

        <div class="report-document">


            <div class="report-document-header">

                <div>

                    <span class="report-overline">
                        WPIS
                    </span>

                    <h2>
                        ${escapeHTML(
                            report.title
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            report.subtitle
                        )}
                    </p>

                </div>


                <div class="report-date">

                    <span>
                        Generated
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                new Date().toISOString()
                            )
                        )}
                    </strong>

                </div>

            </div>


            <div class="report-summary-grid">

                ${summaryHTML}

            </div>


            <div class="report-table-wrapper">

                <table class="report-table">

                    <thead>

                        <tr>

                            ${report.columns
                                .map(
                                    column =>
                                        `
                                        <th>
                                            ${escapeHTML(
                                                column
                                            )}
                                        </th>
                                        `
                                )
                                .join("")}

                        </tr>

                    </thead>


                    <tbody>

                        ${rowsHTML}

                    </tbody>

                </table>

            </div>


            <div class="report-footer">

                WPIS —
                Wildlife Population Intelligence System

            </div>

        </div>

    `;
}


// ============================================================
// GENERATE REPORT
// ============================================================

async function generateReport() {

    const button =
        document.getElementById(
            "generateReport"
        );

    if (button) {
        button.disabled = true;
    }

    setStatus(
        "Collecting data and generating report...",
        "loading"
    );


    try {

        const report =
            await buildSelectedReport();

        renderReport(report);

        setStatus(
            `${report.title} generated successfully.`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "Report generation error:",
            error
        );

        setStatus(
            error.message ||
            "Unable to generate report.",
            "error"
        );

    }

    finally {

        if (button) {
            button.disabled = false;
        }

    }
}


// ============================================================
// PDF EXPORT
// ============================================================

function exportPDF() {

    if (!currentReport) {

        setStatus(
            "Generate a report before exporting it.",
            "error"
        );

        return;
    }


    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        setStatus(
            "PDF library is not available.",
            "error"
        );

        return;
    }


    const {
        jsPDF
    } =
        window.jspdf;


    const doc =
        new jsPDF(
            "landscape"
        );


    const margin = 14;


    doc.setFontSize(18);

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Wildlife Population Intelligence System",
        margin,
        18
    );


    doc.setFontSize(14);

    doc.text(
        currentReport.title,
        margin,
        27
    );


    doc.setFontSize(9);

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        currentReport.subtitle,
        margin,
        34
    );


    doc.text(
        `Generated: ${formatDate(
            new Date().toISOString()
        )}`,
        margin,
        40
    );


    const summaryStartY = 48;


    currentReport.summary
        .forEach(
            (
                [label, value],
                index
            ) => {

                const x =
                    margin +
                    index * 65;


                doc.setFontSize(8);

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.text(
                    String(label),
                    x,
                    summaryStartY
                );


                doc.setFontSize(11);

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    String(value),
                    x,
                    summaryStartY + 6
                );

            }
        );


    const tableRows =
        currentReport.rows.map(
            row =>
                currentReport.columns
                    .map(
                        column =>
                            formatValue(
                                row[column],
                                ""
                            )
                    )
        );


    if (
        typeof doc.autoTable ===
        "function"
    ) {

        doc.autoTable({

            head: [
                currentReport.columns
            ],

            body:
                tableRows,

            startY:
                summaryStartY + 14,

            margin: {
                left: margin,
                right: margin
            },

            styles: {

                fontSize: 7,

                cellPadding: 2.5

            },

            headStyles: {

                fontSize: 7,

                fontStyle: "bold"

            }

        });

    }


    const filename =
        currentReport.title
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            );


    doc.save(
        `${filename}.pdf`
    );


    setStatus(
        "PDF exported successfully.",
        "success"
    );
}


// ============================================================
// EXCEL EXPORT
// ============================================================

function exportExcel() {

    if (!currentReport) {

        setStatus(
            "Generate a report before exporting it.",
            "error"
        );

        return;
    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        setStatus(
            "Excel export library is not available.",
            "error"
        );

        return;
    }


    const rows =
        currentReport.rows.map(
            row => {

                const output = {};

                currentReport.columns
                    .forEach(
                        column => {

                            output[column] =
                                row[column];

                        }
                    );

                return output;

            }
        );


    const workbook =
        XLSX.utils.book_new();


    const summaryRows =
        currentReport.summary
            .map(
                ([label, value]) => ({

                    Metric:
                        label,

                    Value:
                        value

                })
            );


    const summarySheet =
        XLSX.utils.json_to_sheet(
            summaryRows
        );


    XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Summary"
    );


    const reportSheet =
        XLSX.utils.json_to_sheet(
            rows
        );


    XLSX.utils.book_append_sheet(
        workbook,
        reportSheet,
        "Report Data"
    );


    const filename =
        currentReport.title
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            );


    XLSX.writeFile(
        workbook,
        `${filename}.xlsx`
    );


    setStatus(
        "Excel file exported successfully.",
        "success"
    );
}


// ============================================================
// LOAD REPORT SUMMARY
// ============================================================

async function loadReportSummary() {

    try {

        const dashboard =
            await api(
                "/dashboard/summary"
            );


        setText(
            "wildlifeReportCount",
            dashboard?.total_wildlife_records ??
            0
        );


        const population =
            await api(
                "/population/overview"
            );


        setText(
            "populationReportCount",
            population?.total_population ??
            0
        );


        const biodiversity =
            await api(
                "/population/biodiversity/index"
            );


        const index =
            Number(
                biodiversity
                    ?.shannon_diversity_index
            );


        setText(
            "biodiversityReportCount",
            Number.isFinite(index)
                ? index.toFixed(2)
                : "0.00"
        );


        const habitats =
            await api(
                "/habitat/classifications"
            );


        setText(
            "habitatReportCount",
            Array.isArray(
                habitats?.habitats
            )
                ? habitats.habitats.length
                : 0
        );

    }

    catch (error) {

        console.error(
            "Report summary error:",
            error
        );

    }

}


// ============================================================
// EVENT HANDLERS
// ============================================================

document
    .getElementById("generateReport")
    .addEventListener(
        "click",
        generateReport
    );


document
    .getElementById("exportPdf")
    .addEventListener(
        "click",
        exportPDF
    );


document
    .getElementById("exportExcel")
    .addEventListener(
        "click",
        exportExcel
    );


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "WPIS Role-Based Reports starting..."
        );

        configureRoleReports();

        await loadReportSummary();

        console.log(
            "WPIS Role-Based Reports ready."
        );

    }
);