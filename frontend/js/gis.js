// ============================================================
// WPIS - GIS VISUALIZATION
// Monitoring Sites + Wildlife Observation Locations
// ============================================================


// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE =
    localStorage.getItem("wpis_api_base") ||
    "http://127.0.0.1:8000";


const token = () =>
    localStorage.getItem("wpis_token");


// ============================================================
// STATE
// ============================================================

let monitoringSites = [];

let wildlifeRecords = [];

let map = null;

let monitoringMarkers = [];

let wildlifeMarkers = [];

let monitoringLayer = null;

let wildlifeLayer = null;


// ============================================================
// API REQUEST
// ============================================================

async function req(path) {

    const headers = {};

    if (token()) {

        headers.Authorization =
            `Bearer ${token()}`;

    }

    const response =
        await fetch(
            `${API_BASE}${path}`,
            {
                headers
            }
        );


    // --------------------------------------------------------
    // SESSION EXPIRED
    // --------------------------------------------------------

    if (response.status === 401) {

        localStorage.removeItem("wpis_token");
        localStorage.removeItem("wpis_user");

        window.location.href = "login.html";

        return null;
    }


    // --------------------------------------------------------
    // API ERROR
    // --------------------------------------------------------

    if (!response.ok) {

        const data =
            await response
                .json()
                .catch(() => ({}));


        throw new Error(
            data.detail ||
            "Unable to load GIS data."
        );

    }


    return response.json();

}


// ============================================================
// INITIALIZE MAP
// ============================================================

function initializeMap() {

    const mapElement =
        document.getElementById("gisMap");


    if (!mapElement) {

        console.error(
            "GIS map container not found."
        );

        return;

    }


    if (typeof L === "undefined") {

        console.error(
            "Leaflet is not loaded."
        );

        return;

    }


    // Prevent duplicate initialization

    if (map) {

        return;

    }


    // --------------------------------------------------------
    // CREATE MAP
    // --------------------------------------------------------

    map =
        L.map(
            "gisMap",
            {
                zoomControl: true
            }
        )
        .setView(
            [20.5937, 78.9629],
            5
        );


    // --------------------------------------------------------
    // OPEN STREET MAP
    // --------------------------------------------------------

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    // --------------------------------------------------------
    // CREATE LAYERS
    // --------------------------------------------------------

    monitoringLayer =
        L.layerGroup().addTo(map);


    wildlifeLayer =
        L.layerGroup().addTo(map);


    // --------------------------------------------------------
    // LAYER CONTROL
    // --------------------------------------------------------

    L.control.layers(

        null,

        {
            "📍 Monitoring Sites":
                monitoringLayer,

            "🐾 Wildlife Observations":
                wildlifeLayer
        },

        {
            collapsed: false
        }

    ).addTo(map);

}


// ============================================================
// CLEAR MARKERS
// ============================================================

function clearMarkers() {

    // --------------------------------------------------------
    // CLEAR MONITORING MARKERS
    // --------------------------------------------------------

    monitoringMarkers.forEach(
        marker => {

            if (map) {

                map.removeLayer(marker);

            }

        }
    );


    // --------------------------------------------------------
    // CLEAR WILDLIFE MARKERS
    // --------------------------------------------------------

    wildlifeMarkers.forEach(
        marker => {

            if (map) {

                map.removeLayer(marker);

            }

        }
    );


    monitoringMarkers = [];

    wildlifeMarkers = [];


    // --------------------------------------------------------
    // CLEAR LAYERS
    // --------------------------------------------------------

    if (monitoringLayer) {

        monitoringLayer.clearLayers();

    }


    if (wildlifeLayer) {

        wildlifeLayer.clearLayers();

    }

}


// ============================================================
// MONITORING POPUP
// ============================================================

function createMonitoringPopup(site) {

    const latitude =
        site.latitude;


    const longitude =
        site.longitude;


    return `

        <div class="gis-popup">

            <h3>

                <i class="fa-solid fa-location-dot"></i>

                ${escapeHTML(
                    site.site_name ||
                    site.protected_area ||
                    "Monitoring Site"
                )}

            </h3>


            <p>

                <strong>
                    Location:
                </strong>

                ${escapeHTML(
                    site.location ||
                    site.monitoring_location ||
                    "Not specified"
                )}

            </p>


            <p>

                <strong>
                    Habitat:
                </strong>

                ${escapeHTML(
                    site.habitat_type ||
                    "Not specified"
                )}

            </p>


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
                    "Not specified"
                )}

            </p>


            <p>

                <strong>
                    Coordinates:
                </strong>

                ${latitude},
                ${longitude}

            </p>

        </div>

    `;

}


// ============================================================
// GET VALID MONITORING SITES
// ============================================================

function getValidMonitoringSites(list) {

    return list.filter(
        site => {

            const latitude =
                Number(site.latitude);


            const longitude =
                Number(site.longitude);


            return (

                Number.isFinite(latitude) &&

                Number.isFinite(longitude)

            );

        }
    );

}


// ============================================================
// RENDER MONITORING MARKERS
// ============================================================

function renderMonitoringMarkers(
    list,
    bounds
) {

    if (!map) {

        return;

    }


    const validSites =
        getValidMonitoringSites(list);


    validSites.forEach(
        site => {

            const latitude =
                Number(site.latitude);


            const longitude =
                Number(site.longitude);


            const marker =
                L.marker(
                    [
                        latitude,
                        longitude
                    ]
                );


            marker.bindPopup(
                createMonitoringPopup(site)
            );


            if (monitoringLayer) {

                marker.addTo(
                    monitoringLayer
                );

            }


            monitoringMarkers.push(
                marker
            );


            bounds.push([
                latitude,
                longitude
            ]);

        }
    );


    updateSiteCount(
        validSites.length
    );

}


// ============================================================
// FIND MONITORING SITE FOR WILDLIFE
// ============================================================

function findMonitoringSiteForWildlife(
    wildlife
) {

    const wildlifeLocation =
        String(
            wildlife.location || ""
        )
        .trim()
        .toLowerCase();


    // Ignore AI Image Detection etc.

    if (!wildlifeLocation) {

        return null;

    }


    const site =
        monitoringSites.find(
            monitoringSite => {

                const siteLocation =
                    String(

                        monitoringSite.location ||

                        monitoringSite.monitoring_location ||

                        ""

                    )
                    .trim()
                    .toLowerCase();


                return (
                    siteLocation ===
                    wildlifeLocation
                );

            }
        );


    if (!site) {

        return null;

    }


    const latitude =
        Number(site.latitude);


    const longitude =
        Number(site.longitude);


    if (

        !Number.isFinite(latitude) ||

        !Number.isFinite(longitude)

    ) {

        return null;

    }


    return {

        site,

        latitude,

        longitude

    };

}


// ============================================================
// GROUP WILDLIFE RECORDS
// ============================================================

function groupWildlifeRecords(records) {

    const groups = {};


    records.forEach(
        record => {

            const species =
                String(

                    record.species_name ||

                    record.species ||

                    "Unknown species"

                )
                .trim();


            const location =
                String(

                    record.location ||

                    "Unknown location"

                )
                .trim();


            const groupKey =
                `${species.toLowerCase()}||${location.toLowerCase()}`;


            if (!groups[groupKey]) {

                groups[groupKey] = {

                    species_name:
                        species,

                    location:
                        location,

                    count: 0,

                    records: []

                };

            }


            groups[groupKey].count +=
                Number(
                    record.count || 1
                );


            groups[groupKey]
                .records
                .push(record);

        }
    );


    return Object.values(groups);

}


// ============================================================
// WILDLIFE POPUP
// ============================================================

function createWildlifePopup(
    group,
    latitude,
    longitude,
    site
) {

    const firstRecord =
        group.records[0] || {};


    const behavior =
        firstRecord.behavior ||
        "Unknown";


    const conservation =
        firstRecord.conservation_status ||
        "Not Evaluated";


    const health =
        firstRecord.health_status ||
        "Recorded";


    const detectionConfidence =
        Number(

            firstRecord.detection_confidence ||

            firstRecord.confidence ||

            0

        );


    return `

        <div class="gis-popup wildlife-popup">

            <h3>

                🐾

                ${escapeHTML(
                    group.species_name
                )}

            </h3>


            <p>

                <strong>
                    Wildlife observation
                </strong>

            </p>


            <p>

                <strong>
                    Individuals:
                </strong>

                ${escapeHTML(
                    group.count
                )}

            </p>


            <p>

                <strong>
                    Location:
                </strong>

                ${escapeHTML(
                    group.location
                )}

            </p>


            <p>

                <strong>
                    Monitoring site:
                </strong>

                ${escapeHTML(

                    site.site_name ||

                    site.protected_area ||

                    "Monitoring Site"

                )}

            </p>


            <p>

                <strong>
                    Behavior:
                </strong>

                ${escapeHTML(
                    behavior
                )}

            </p>


            <p>

                <strong>
                    Health status:
                </strong>

                ${escapeHTML(
                    health
                )}

            </p>


            <p>

                <strong>
                    Conservation:
                </strong>

                ${escapeHTML(
                    conservation
                )}

            </p>


            ${
                detectionConfidence > 0

                    ? `

                        <p>

                            <strong>
                                Detection confidence:
                            </strong>

                            ${(
                                detectionConfidence * 100
                            ).toFixed(1)}%

                        </p>

                    `

                    : ""

            }


            <p>

                <strong>
                    Coordinates:
                </strong>

                ${latitude},
                ${longitude}

            </p>

        </div>

    `;

}


// ============================================================
// WILDLIFE MARKER ICON
// ============================================================

function createWildlifeIcon() {

    return L.divIcon({

        className:
            "wildlife-map-marker",

        html: `

            <div style="
                width:40px;
                height:40px;
                border-radius:50%;
                background:#2e7d32;
                border:3px solid white;
                box-shadow:0 2px 8px rgba(0,0,0,0.35);
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:21px;
            ">

                🐾

            </div>

        `,

        iconSize: [
            40,
            40
        ],

        iconAnchor: [
            20,
            20
        ],

        popupAnchor: [
            0,
            -20
        ]

    });

}


// ============================================================
// CREATE WILDLIFE MARKER
// ============================================================

function createWildlifeMarker(
    group,
    latitude,
    longitude,
    site
) {

    const marker =
        L.marker(

            [
                latitude,
                longitude
            ],

            {
                icon:
                    createWildlifeIcon()
            }

        );


    marker.bindPopup(

        createWildlifePopup(

            group,

            latitude,

            longitude,

            site

        )

    );


    return marker;

}


// ============================================================
// RENDER WILDLIFE MARKERS
// ============================================================

function renderWildlifeMarkers(
    records,
    bounds
) {

    if (!map) {

        return;

    }


    const groups =
        groupWildlifeRecords(
            records
        );


    let mappedCount = 0;

    let unmappedCount = 0;


    groups.forEach(
        group => {

            const match =
                findMonitoringSiteForWildlife(
                    group.records[0]
                );


            // No matching monitoring location

            if (!match) {

                unmappedCount++;

                return;

            }


            const marker =
                createWildlifeMarker(

                    group,

                    match.latitude,

                    match.longitude,

                    match.site

                );


            if (wildlifeLayer) {

                marker.addTo(
                    wildlifeLayer
                );

            }


            wildlifeMarkers.push(
                marker
            );


            bounds.push([

                match.latitude,

                match.longitude

            ]);


            mappedCount++;

        }
    );


    console.log(
        "GIS wildlife groups:",
        groups
    );


    console.log(
        "GIS wildlife markers:",
        mappedCount
    );


    console.log(
        "GIS wildlife locations without monitoring coordinates:",
        unmappedCount
    );

}


// ============================================================
// RENDER ALL MAP MARKERS
// ============================================================

function renderMarkers(list) {

    if (!map) {

        return;

    }


    // Clear previous markers

    clearMarkers();


    const bounds = [];


    // --------------------------------------------------------
    // MONITORING MARKERS
    // --------------------------------------------------------

    renderMonitoringMarkers(
        list,
        bounds
    );


    // --------------------------------------------------------
    // WILDLIFE MARKERS
    // --------------------------------------------------------

    renderWildlifeMarkers(
        wildlifeRecords,
        bounds
    );


    // --------------------------------------------------------
    // NO LOCATIONS
    // --------------------------------------------------------

    if (!bounds.length) {

        map.setView(
            [20.5937, 78.9629],
            5
        );

        return;

    }


    // --------------------------------------------------------
    // SINGLE LOCATION
    // --------------------------------------------------------

    if (bounds.length === 1) {

        map.setView(
            bounds[0],
            12
        );

    }


    // --------------------------------------------------------
    // MULTIPLE LOCATIONS
    // --------------------------------------------------------

    else {

        map.fitBounds(

            L.latLngBounds(bounds),

            {
                padding: [
                    40,
                    40
                ],

                maxZoom: 15
            }

        );

    }

}


// ============================================================
// SITE COUNT
// ============================================================

function updateSiteCount(count) {

    const element =
        document.getElementById(
            "siteCount"
        );


    if (element) {

        element.textContent =
            count;

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(
        /[&<>"']/g,
        character => ({

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#39;"

        })[character]
    );

}


// ============================================================
// RENDER SITE LIST
// ============================================================

function renderSiteList(list) {

    const container =
        document.getElementById(
            "gisSiteList"
        );


    if (!container) {

        return;

    }


    if (!list.length) {

        container.innerHTML = `

            <div class="gis-empty">

                <i
                    class="fa-solid fa-map-location-dot"
                ></i>

                <strong>
                    No monitoring locations found
                </strong>

            </div>

        `;

        return;

    }


    container.innerHTML =

        list
            .map(
                (site, index) => {

                    const latitude =
                        site.latitude;


                    const longitude =
                        site.longitude;


                    return `

                        <div

                            class="gis-site-card"

                            data-site-index="${index}"

                        >

                            <div
                                class="gis-site-title"
                            >

                                <i
                                    class="fa-solid fa-location-dot"
                                ></i>


                                <strong>

                                    ${escapeHTML(

                                        site.site_name ||

                                        site.protected_area ||

                                        "Monitoring Site"

                                    )}

                                </strong>

                            </div>


                            <div
                                class="gis-site-detail"
                            >

                                <i
                                    class="fa-solid fa-location-crosshairs"
                                ></i>


                                <span>

                                    ${escapeHTML(

                                        site.location ||

                                        site.monitoring_location ||

                                        "Location not specified"

                                    )}

                                </span>

                            </div>


                            <div
                                class="gis-site-detail"
                            >

                                <i
                                    class="fa-solid fa-tree"
                                ></i>


                                <span>

                                    ${escapeHTML(

                                        site.habitat_type ||

                                        "Habitat not specified"

                                    )}

                                </span>

                            </div>


                            <div
                                class="gis-site-detail"
                            >

                                <i
                                    class="fa-solid fa-calendar"
                                ></i>


                                <span>

                                    ${escapeHTML(

                                        site.survey_date ||

                                        "Date unavailable"

                                    )}

                                </span>

                            </div>


                            <div
                                class="gis-site-detail"
                            >

                                <i
                                    class="fa-solid fa-satellite-dish"
                                ></i>


                                <span>

                                    ${escapeHTML(

                                        site.monitoring_device ||

                                        "Device unavailable"

                                    )}

                                </span>

                            </div>


                            <div
                                class="gis-site-detail"
                            >

                                <i
                                    class="fa-solid fa-globe"
                                ></i>


                                <span>

                                    ${escapeHTML(
                                        latitude ?? "--"
                                    )},

                                    ${escapeHTML(
                                        longitude ?? "--"
                                    )}

                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    // --------------------------------------------------------
    // CLICK SITE CARD
    // --------------------------------------------------------

    document
        .querySelectorAll(
            "[data-site-index]"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                card.dataset.siteIndex
                            );


                        const site =
                            list[index];


                        const latitude =
                            Number(
                                site.latitude
                            );


                        const longitude =
                            Number(
                                site.longitude
                            );


                        if (

                            !Number.isFinite(
                                latitude
                            )

                            ||

                            !Number.isFinite(
                                longitude
                            )

                        ) {

                            return;

                        }


                        map.setView(

                            [
                                latitude,
                                longitude
                            ],

                            15

                        );


                        // Find corresponding marker

                        const marker =
                            monitoringMarkers.find(
                                marker => {

                                    const position =
                                        marker.getLatLng();


                                    return (

                                        Math.abs(

                                            position.lat -
                                            latitude

                                        ) < 0.000001

                                        &&

                                        Math.abs(

                                            position.lng -
                                            longitude

                                        ) < 0.000001

                                    );

                                }
                            );


                        if (marker) {

                            marker.openPopup();

                        }

                    }
                );

            }
        );

}


// ============================================================
// SEARCH
// ============================================================

function filterSites() {

    const searchElement =
        document.getElementById(
            "gisSearch"
        );


    if (!searchElement) {

        return;

    }


    const search =
        searchElement.value
            .trim()
            .toLowerCase();


    // --------------------------------------------------------
    // NO SEARCH
    // --------------------------------------------------------

    if (!search) {

        renderMarkers(
            monitoringSites
        );


        renderSiteList(
            monitoringSites
        );

        return;

    }


    // --------------------------------------------------------
    // FILTER MONITORING SITES
    // --------------------------------------------------------

    const filtered =
        monitoringSites.filter(
            site => {

                const text = `

                    ${site.site_name || ""}

                    ${site.location || ""}

                    ${site.protected_area || ""}

                    ${site.monitoring_location || ""}

                    ${site.habitat_type || ""}

                    ${site.monitoring_device || ""}

                `.toLowerCase();


                return text.includes(
                    search
                );

            }
        );


    renderMarkers(
        filtered
    );


    renderSiteList(
        filtered
    );

}


// ============================================================
// LOAD MONITORING DATA
// ============================================================

async function loadMonitoringData() {

    try {

        const data =
            await req(
                "/monitoring/"
            );


        monitoringSites =

            Array.isArray(data)

                ? data

                : data?.items || [];


        console.log(
            "GIS monitoring sites:",
            monitoringSites
        );


        // Render monitoring + wildlife

        renderMarkers(
            monitoringSites
        );


        renderSiteList(
            monitoringSites
        );

    }


    catch (error) {

        console.error(
            "GIS monitoring loading error:",
            error
        );


        const container =
            document.getElementById(
                "gisSiteList"
            );


        if (container) {

            container.innerHTML = `

                <div
                    class="gis-empty"
                >

                    <i
                        class="fa-solid fa-triangle-exclamation"
                    ></i>


                    <strong>
                        GIS data unavailable
                    </strong>


                    <p>

                        ${escapeHTML(
                            error.message
                        )}

                    </p>

                </div>

            `;

        }

    }

}


// ============================================================
// LOAD WILDLIFE DATA
// ============================================================

async function loadWildlifeData() {

    try {

        const data =
            await req(
                "/wildlife/"
            );


        wildlifeRecords =

            Array.isArray(data)

                ? data

                : data?.items || [];


        console.log(
            "GIS wildlife records:",
            wildlifeRecords
        );


        // Re-render map after wildlife loads

        renderMarkers(
            monitoringSites
        );

    }


    catch (error) {

        console.error(
            "GIS wildlife loading error:",
            error
        );


        wildlifeRecords = [];


        // Monitoring GIS continues working

        renderMarkers(
            monitoringSites
        );

    }

}


// ============================================================
// MOBILE SIDEBAR
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
    .forEach(
        button => {

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

        }
    );


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // ----------------------------------------------------
        // Initialize map first
        // ----------------------------------------------------

        initializeMap();


        // ----------------------------------------------------
        // Load monitoring sites first
        // ----------------------------------------------------

        await loadMonitoringData();


        // ----------------------------------------------------
        // Load wildlife observations
        // ----------------------------------------------------

        await loadWildlifeData();


        // ----------------------------------------------------
        // SEARCH
        // ----------------------------------------------------

        const search =
            document.getElementById(
                "gisSearch"
            );


        if (search) {

            search.addEventListener(
                "input",
                filterSites
            );

        }


        // ----------------------------------------------------
        // REFRESH
        // ----------------------------------------------------

        const refresh =
            document.getElementById(
                "refreshMap"
            );


        if (refresh) {

            refresh.addEventListener(
                "click",
                async () => {

                    await loadMonitoringData();

                    await loadWildlifeData();

                }
            );

        }

    }
);