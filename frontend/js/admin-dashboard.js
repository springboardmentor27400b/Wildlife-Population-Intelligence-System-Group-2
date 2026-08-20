// ============================================================
// WPIS - ADMINISTRATOR DASHBOARD
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
            "Unable to load administrator data.";

        try {

            const data =
                await response.json();

            message =
                data.detail ||
                message;

        } catch {

            // Ignore invalid JSON
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

                localStorage.removeItem("wpis_token");
                localStorage.removeItem("wpis_user");

                window.location.href =
                    "login.html";

            }
        );

    });


// ============================================================
// PLATFORM SUMMARY
// ============================================================

async function loadPlatformSummary() {

    const data =
        await api("/dashboard/summary");


    setText(
        "totalUsers",
        data?.total_users ?? 0
    );


    setText(
        "totalSites",
        data?.total_monitoring_sites ?? 0
    );


    setText(
        "totalWildlife",
        data?.total_wildlife_records ?? 0
    );


    setText(
        "totalImages",
        data?.total_images ?? 0
    );


    setText(
        "totalAudio",
        data?.total_audio_files ?? 0
    );


    renderActivityChart(data);

    renderAIAnalytics(data);
}


// ============================================================
// PLATFORM ACTIVITY
// ============================================================

function renderActivityChart(data) {

    const canvas =
        document.getElementById(
            "adminActivityChart"
        );

    if (!canvas) return;


    const wrapper =
        canvas.parentElement;

    if (!wrapper) return;


    const metrics = [

        {
            label: "Users",
            value: Number(data?.total_users || 0)
        },

        {
            label: "Monitoring Sites",
            value: Number(
                data?.total_monitoring_sites || 0
            )
        },

        {
            label: "Wildlife Records",
            value: Number(
                data?.total_wildlife_records || 0
            )
        },

        {
            label: "Images Analyzed",
            value: Number(
                data?.total_images || 0
            )
        },

        {
            label: "Animals Detected",
            value: Number(
                data?.total_animals_detected || 0
            )
        },

        {
            label: "Audio Files",
            value: Number(
                data?.total_audio_files || 0
            )
        }

    ];


    const maxValue =
        Math.max(
            ...metrics.map(
                item => item.value
            ),
            1
        );


    wrapper.innerHTML = `

        <div
            style="
                width:100%;
                display:flex;
                flex-direction:column;
                gap:18px;
                padding:15px 10px;
                box-sizing:border-box;
            "
        >

            ${
                metrics
                    .map(item => {

                        const percentage =
                            Math.max(
                                3,
                                Math.round(
                                    (
                                        item.value /
                                        maxValue
                                    ) * 100
                                )
                            );


                        return `

                            <div>

                                <div
                                    style="
                                        display:flex;
                                        justify-content:space-between;
                                        align-items:center;
                                        margin-bottom:7px;
                                        font-size:13px;
                                        font-weight:700;
                                    "
                                >

                                    <span
                                        style="color:#315746;"
                                    >
                                        ${escapeHTML(
                                            item.label
                                        )}
                                    </span>

                                    <strong
                                        style="color:#143c2c;"
                                    >
                                        ${item.value}
                                    </strong>

                                </div>


                                <div
                                    style="
                                        width:100%;
                                        height:12px;
                                        background:#edf1ee;
                                        border-radius:999px;
                                        overflow:hidden;
                                    "
                                >

                                    <div
                                        style="
                                            width:${percentage}%;
                                            height:100%;
                                            background:linear-gradient(
                                                90deg,
                                                #43a06f,
                                                #176344
                                            );
                                            border-radius:999px;
                                            transition:width .6s ease;
                                        "
                                    ></div>

                                </div>

                            </div>

                        `;

                    })
                    .join("")
            }

        </div>

    `;
}


// ============================================================
// AI ANALYTICS
// ============================================================

function renderAIAnalytics(data) {

    const container =
        document.getElementById(
            "aiAnalyticsData"
        );

    if (!container) return;


    const species =
        data?.species_statistics || {};

    const behavior =
        data?.behavior_statistics || {};

    const audio =
        data?.audio_statistics || {};

    const birds =
        data?.birdnet_statistics || {};


    const speciesCount =
        Object.keys(species).length;

    const behaviorCount =
        Object.keys(behavior).length;

    const audioCount =
        Object.keys(audio).length;

    const birdCount =
        Object.keys(birds).length;


    container.innerHTML = `

        <div class="ai-stat-row">

            <div class="ai-stat-info">

                <span class="ai-stat-icon">

                    <i class="fa-solid fa-paw"></i>

                </span>

                <div>

                    <span class="ai-stat-name">
                        Species Intelligence
                    </span>

                    <small>
                        Unique detected classes
                    </small>

                </div>

            </div>

            <div class="ai-stat-value">
                ${speciesCount}
            </div>

        </div>


        <div class="ai-stat-row">

            <div class="ai-stat-info">

                <span class="ai-stat-icon">

                    <i class="fa-solid fa-brain"></i>

                </span>

                <div>

                    <span class="ai-stat-name">
                        Behavior Intelligence
                    </span>

                    <small>
                        Observed behaviors
                    </small>

                </div>

            </div>

            <div class="ai-stat-value">
                ${behaviorCount}
            </div>

        </div>


        <div class="ai-stat-row">

            <div class="ai-stat-info">

                <span class="ai-stat-icon">

                    <i class="fa-solid fa-volume-high"></i>

                </span>

                <div>

                    <span class="ai-stat-name">
                        Audio Intelligence
                    </span>

                    <small>
                        YAMNet classes
                    </small>

                </div>

            </div>

            <div class="ai-stat-value">
                ${audioCount}
            </div>

        </div>


        <div class="ai-stat-row">

            <div class="ai-stat-info">

                <span class="ai-stat-icon">

                    <i class="fa-solid fa-dove"></i>

                </span>

                <div>

                    <span class="ai-stat-name">
                        Bird Intelligence
                    </span>

                    <small>
                        BirdNET species
                    </small>

                </div>

            </div>

            <div class="ai-stat-value">
                ${birdCount}
            </div>

        </div>

    `;
}


// ============================================================
// USER MANAGEMENT
// ============================================================

async function loadUsers() {

    const container =
        document.getElementById(
            "usersData"
        );

    if (!container) return;


    try {

        const users =
            await api(
                "/auth/users"
            );


        const list =
            Array.isArray(users)
                ? users
                : users?.items || [];


        if (!list.length) {

            container.innerHTML =
                emptyState(
                    "fa-users",
                    "No Users Found",
                    "No registered users are currently available."
                );

            return;
        }


        container.innerHTML =
            list
                .map(user => `

                    <div class="mini-item">

                        <div class="panel-heading">

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        user.username ||
                                        "Unnamed user"
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        user.email ||
                                        "No email"
                                    )}
                                </small>

                            </div>

                            <span class="wildlife-status status-safe">

                                ${escapeHTML(
                                    user.role ||
                                    "Not assigned"
                                )}

                            </span>

                        </div>

                        <p>

                            <strong>
                                User ID:
                            </strong>

                            ${escapeHTML(
                                user.id ??
                                "N/A"
                            )}

                        </p>

                    </div>

                `)
                .join("");

    }

    catch (error) {

        console.error(
            "User management error:",
            error
        );

        container.innerHTML = `
            <div class="ai-empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <strong>
                    User data unavailable
                </strong>

                <span>
                    ${escapeHTML(error.message)}
                </span>

            </div>
        `;

    }

}


// ============================================================
// MONITORING MANAGEMENT
// ============================================================

async function loadMonitoringSystems() {

    const container =
        document.getElementById(
            "monitoringData"
        );

    if (!container) return;


    try {

        const sites =
            await api(
                "/monitoring/"
            );


        const list =
            Array.isArray(sites)
                ? sites
                : sites?.items || [];


        if (!list.length) {

            container.innerHTML =
                emptyState(
                    "fa-map-location-dot",
                    "No Monitoring Systems",
                    "No monitoring site records are currently registered."
                );

            return;
        }


        container.innerHTML =
            list
                .slice(0, 10)
                .map(site => `

                    <div class="mini-item">

                        <div class="panel-heading">

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        site.protected_area ||
                                        "Unknown protected area"
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        site.monitoring_location ||
                                        "Unknown location"
                                    )}
                                </small>

                            </div>

                            <span class="wildlife-status status-safe">
                                Registered
                            </span>

                        </div>

                        <p>

                            <strong>
                                Device:
                            </strong>

                            ${escapeHTML(
                                site.monitoring_device ||
                                "Not specified"
                            )}

                        </p>

                        <p>

                            <strong>
                                Survey Date:
                            </strong>

                            ${escapeHTML(
                                site.survey_date ||
                                "Not available"
                            )}

                        </p>

                    </div>

                `)
                .join("");

    }

    catch (error) {

        console.error(
            "Monitoring management error:",
            error
        );

        container.innerHTML = `
            <div class="ai-empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <strong>
                    Monitoring data unavailable
                </strong>

                <span>
                    ${escapeHTML(error.message)}
                </span>

            </div>
        `;

    }

}


// ============================================================
// START
// ============================================================

async function loadAdminDashboard() {

    console.log(
        "WPIS Administrator Dashboard starting..."
    );


    try {

        await loadPlatformSummary();

        console.log(
            "✓ Platform analytics loaded"
        );

    }

    catch (error) {

        console.error(
            "Platform summary failed:",
            error
        );

    }


    try {

        await loadUsers();

        console.log(
            "✓ User management loaded"
        );

    }

    catch (error) {

        console.error(
            "User management failed:",
            error
        );

    }


    try {

        await loadMonitoringSystems();

        console.log(
            "✓ Monitoring management loaded"
        );

    }

    catch (error) {

        console.error(
            "Monitoring management failed:",
            error
        );

    }


    console.log(
        "WPIS Administrator Dashboard ready."
    );

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    loadAdminDashboard
);