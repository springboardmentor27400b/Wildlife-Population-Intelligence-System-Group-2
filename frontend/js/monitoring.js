/* =========================================================
   WPIS - MONITORING
   CRUD + SEARCH + GIS MAP
   + WILDLIFE OBSERVATION LOCATIONS
========================================================= */


/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE =
    localStorage.getItem("wpis_api_base") ||
    "http://127.0.0.1:8000";

const token = () =>
    localStorage.getItem("wpis_token");


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let rows = [];

let wildlifeRows = [];

let monitoringMap = null;


/*
   Separate marker collections.

   Monitoring markers:
   Existing GIS records

   Wildlife markers:
   Wildlife observations
*/

let monitoringMarkers = [];

let wildlifeMarkers = [];


/*
   Layer groups
*/

let monitoringLayer = null;

let wildlifeLayer = null;


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = selector =>
    document.querySelector(selector);


const key = x =>
    x.id || x._id;


const esc = value =>
    String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]
    );


/* =========================================================
   API REQUEST HELPER
========================================================= */

async function req(path, options = {}) {

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };


    if (token()) {

        headers.Authorization =
            `Bearer ${token()}`;

    }


    const response = await fetch(
        API_BASE + path,
        {
            ...options,
            headers
        }
    );


    /* -----------------------------------------
       SESSION EXPIRED
    ----------------------------------------- */

    if (response.status === 401) {

        localStorage.removeItem(
            "wpis_token"
        );

        location.href =
            "login.html";

        return;

    }


    /* -----------------------------------------
       API ERROR
    ----------------------------------------- */

    if (!response.ok) {

        const data =
            await response
                .json()
                .catch(() => ({}));


        throw Error(

            Array.isArray(data.detail)

                ? data.detail
                    .map(error => error.msg)
                    .join(" ")

                : data.detail ||

                  "Request failed."

        );

    }


    /* -----------------------------------------
       NO CONTENT
    ----------------------------------------- */

    if (response.status === 204) {

        return null;

    }


    return response.json();

}


/* =========================================================
   WILDLIFE COORDINATE EXTRACTOR

   Wildlife records may have coordinates in different
   structures depending on the backend.

   Supported:

   1. gps_coordinates:
      {
          latitude: ...,
          longitude: ...
      }

   2. latitude / longitude

   3. coordinates:
      {
          latitude: ...,
          longitude: ...
      }

   4. GeoJSON:
      coordinates: [longitude, latitude]
========================================================= */

function getWildlifeCoordinates(record) {

    if (!record) {

        return null;

    }


    /* -----------------------------------------
       FORMAT 1
       gps_coordinates
    ----------------------------------------- */

    if (record.gps_coordinates) {

        const latitude =
            Number(
                record.gps_coordinates.latitude
            );

        const longitude =
            Number(
                record.gps_coordinates.longitude
            );


        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {

            return {
                latitude,
                longitude
            };

        }

    }


    /* -----------------------------------------
       FORMAT 2
       Direct latitude / longitude
    ----------------------------------------- */

    if (
        record.latitude !== undefined &&
        record.longitude !== undefined
    ) {

        const latitude =
            Number(record.latitude);

        const longitude =
            Number(record.longitude);


        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {

            return {
                latitude,
                longitude
            };

        }

    }


    /* -----------------------------------------
       FORMAT 3
       coordinates object
    ----------------------------------------- */

    if (
        record.coordinates &&
        !Array.isArray(record.coordinates)
    ) {

        const latitude =
            Number(
                record.coordinates.latitude
            );

        const longitude =
            Number(
                record.coordinates.longitude
            );


        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {

            return {
                latitude,
                longitude
            };

        }

    }


    /* -----------------------------------------
       FORMAT 4
       GeoJSON coordinates

       GeoJSON uses:

       [longitude, latitude]
    ----------------------------------------- */

    if (
        Array.isArray(
            record.coordinates
        ) &&
        record.coordinates.length >= 2
    ) {

        const longitude =
            Number(
                record.coordinates[0]
            );

        const latitude =
            Number(
                record.coordinates[1]
            );


        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {

            return {
                latitude,
                longitude
            };

        }

    }


    /*
       No coordinates available.
    */

    return null;

}


/* =========================================================
   GIS MAP INITIALIZATION
========================================================= */

function initMap() {

    /*
       Make sure Leaflet is loaded.
    */

    if (typeof L === "undefined") {

        console.error(
            "Leaflet library was not loaded."
        );

        return;

    }


    /*
       Make sure map container exists.
    */

    const mapElement =
        $("#monitoringMap");


    if (!mapElement) {

        console.error(
            "Monitoring map container not found."
        );

        return;

    }


    /*
       Prevent duplicate initialization.
    */

    if (monitoringMap) {

        return;

    }


    /*
       Initial map position:
       India
    */

    monitoringMap =
        L.map(
            "monitoringMap"
        ).setView(
            [20.5937, 78.9629],
            5
        );


    /*
       OpenStreetMap tiles
    */

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(
        monitoringMap
    );


    /*
       Create separate layer groups.
    */

    monitoringLayer =
        L.layerGroup().addTo(
            monitoringMap
        );


    wildlifeLayer =
        L.layerGroup().addTo(
            monitoringMap
        );


    /*
       Layer switcher

       Users can turn:

       Monitoring Sites
       Wildlife Observations

       on/off.
    */

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

    ).addTo(
        monitoringMap
    );

}


/* =========================================================
   CREATE WILDLIFE MARKER
========================================================= */

function createWildlifeMarker(
    record,
    latitude,
    longitude
) {

    /*
       Use circle marker so wildlife observations
       are visually different from monitoring sites.
    */

    const marker =
        L.circleMarker(

            [
                latitude,
                longitude
            ],

            {

                radius: 9,

                weight: 2,

                fillOpacity: 0.85

            }

        );


    /* -----------------------------------------
       WILDLIFE DATA
    ----------------------------------------- */

    const species =
        record.species_name ||
        record.species ||
        "Unknown species";


    const count =
        record.count ??
        record.population_count ??
        1;


    const behavior =
        record.behavior ||
        "Unknown";


    const conservation =
        record.conservation_status ||
        "Not Evaluated";


    const health =
        record.health_status ||
        "Recorded";


    const location =
        record.location ||
        "Unknown location";


    const confidence =
        Number(
            record.detection_confidence ||
            record.confidence ||
            0
        );


    const date =
        record.date ||
        record.observation_date ||
        record.survey_date ||
        record.created_at ||
        "";


    /* -----------------------------------------
       POPUP
    ----------------------------------------- */

    const popup = `

        <div
            class="map-popup wildlife-popup"
        >

            <h3>
                🐾 ${esc(species)}
            </h3>


            <p>

                <strong>
                    Observation:
                </strong>

                Wildlife observation

            </p>


            <p>

                <strong>
                    Individuals:
                </strong>

                ${esc(count)}

            </p>


            <p>

                <strong>
                    Location:
                </strong>

                ${esc(location)}

            </p>


            <p>

                <strong>
                    Behavior:
                </strong>

                ${esc(behavior)}

            </p>


            <p>

                <strong>
                    Conservation:
                </strong>

                ${esc(conservation)}

            </p>


            <p>

                <strong>
                    Health status:
                </strong>

                ${esc(health)}

            </p>


            ${
                confidence > 0
                    ? `

                        <p>

                            <strong>
                                Detection confidence:
                            </strong>

                            ${
                                (
                                    confidence * 100
                                ).toFixed(1)
                            }%

                        </p>

                    `
                    : ""
            }


            ${
                date
                    ? `

                        <p>

                            <strong>
                                Observation date:
                            </strong>

                            ${esc(date)}

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


    marker.bindPopup(
        popup
    );


    return marker;

}


/* =========================================================
   UPDATE GIS MARKERS
========================================================= */

function updateMap() {

    /*
       Map not initialized.
    */

    if (!monitoringMap) {

        return;

    }


    /* =====================================================
       CLEAR OLD MONITORING MARKERS
    ===================================================== */

    if (monitoringLayer) {

        monitoringLayer.clearLayers();

    }


    monitoringMarkers = [];


    /* =====================================================
       CLEAR OLD WILDLIFE MARKERS
    ===================================================== */

    if (wildlifeLayer) {

        wildlifeLayer.clearLayers();

    }


    wildlifeMarkers = [];


    /* =====================================================
       ALL MAP BOUNDS

       Monitoring + Wildlife
    ===================================================== */

    const bounds = [];


    /* =====================================================
       MONITORING LOCATIONS
    ===================================================== */

    const validRows =
        rows.filter(record => {

            if (
                !record.gps_coordinates
            ) {

                return false;

            }


            const latitude =
                Number(
                    record
                        .gps_coordinates
                        .latitude
                );


            const longitude =
                Number(
                    record
                        .gps_coordinates
                        .longitude
                );


            return (

                Number.isFinite(
                    latitude
                )

                &&

                Number.isFinite(
                    longitude
                )

            );

        });


    validRows.forEach(record => {

        const latitude =
            Number(
                record
                    .gps_coordinates
                    .latitude
            );


        const longitude =
            Number(
                record
                    .gps_coordinates
                    .longitude
            );


        const marker =
            L.marker(

                [
                    latitude,
                    longitude
                ]

            );


        /* -------------------------------------
           MONITORING POPUP
        ------------------------------------- */

        const popup = `

            <div class="map-popup">

                <h3>

                    📍
                    ${esc(
                        record.protected_area
                    )}

                </h3>


                <p>

                    <strong>
                        Monitoring location:
                    </strong>

                    ${esc(
                        record.monitoring_location
                    )}

                </p>


                <p>

                    <strong>
                        Habitat:
                    </strong>

                    ${esc(
                        record.habitat_type
                    )}

                </p>


                <p>

                    <strong>
                        Device:
                    </strong>

                    ${esc(
                        record.monitoring_device
                    )}

                </p>


                <p>

                    <strong>
                        Survey date:
                    </strong>

                    ${esc(
                        record.survey_date
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


        marker.bindPopup(
            popup
        );


        /*
           Add to monitoring layer.
        */

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

    });


    /* =====================================================
       WILDLIFE OBSERVATION LOCATIONS
    ===================================================== */

    let wildlifeCoordinateCount = 0;


    wildlifeRows.forEach(record => {

        const coordinates =
            getWildlifeCoordinates(
                record
            );


        /*
           Skip records without GPS.

           IMPORTANT:
           We do NOT create fake coordinates.
        */

        if (!coordinates) {

            return;

        }


        const latitude =
            coordinates.latitude;


        const longitude =
            coordinates.longitude;


        wildlifeCoordinateCount++;


        const marker =
            createWildlifeMarker(

                record,

                latitude,

                longitude

            );


        /*
           Add to wildlife layer.
        */

        if (wildlifeLayer) {

            marker.addTo(
                wildlifeLayer
            );

        }


        wildlifeMarkers.push(
            marker
        );


        bounds.push([
            latitude,
            longitude
        ]);

    });


    /* =====================================================
       DEBUG INFORMATION
    ===================================================== */

    console.log(
        "GIS monitoring markers:",
        monitoringMarkers.length
    );


    console.log(
        "GIS wildlife markers:",
        wildlifeCoordinateCount
    );


    console.log(
        "GIS total locations:",
        bounds.length
    );


    /* =====================================================
       NO LOCATIONS
    ===================================================== */

    if (!bounds.length) {

        monitoringMap.setView(
            [20.5937, 78.9629],
            5
        );

        return;

    }


    /* =====================================================
       AUTO-ZOOM TO ALL LOCATIONS
    ===================================================== */

    if (bounds.length === 1) {

        monitoringMap.setView(
            bounds[0],
            12
        );

    }

    else {

        monitoringMap.fitBounds(

            bounds,

            {

                padding: [
                    40,
                    40
                ]

            }

        );

    }

}


/* =========================================================
   RENDER MONITORING TABLE
========================================================= */

function render() {

    const searchInput =
        $("#monitorSearch");


    const query =
        searchInput

            ? searchInput.value
                .toLowerCase()
                .trim()

            : "";


    /*
       Filter records
    */

    const list =
        rows.filter(record => {

            const searchableText = `

                ${record.protected_area || ""}

                ${record.monitoring_device || ""}

                ${record.monitoring_location || ""}

                ${record.habitat_type || ""}

                ${record.survey_id || ""}

            `.toLowerCase();


            return searchableText.includes(
                query
            );

        });


    /* -----------------------------------------
       RENDER TABLE
    ----------------------------------------- */

    const tableBody =
        $("#monitoringBody");


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML =

        list

            .map(record => {

                const latitude =
                    record
                        .gps_coordinates
                        ?.latitude;


                const longitude =
                    record
                        .gps_coordinates
                        ?.longitude;


                return `

                    <tr>

                        <td>
                            ${esc(
                                record.protected_area
                            )}
                        </td>


                        <td>

                            ${esc(latitude)},
                            ${esc(longitude)}

                        </td>


                        <td>
                            ${esc(
                                record.survey_date
                            )}
                        </td>


                        <td>
                            ${esc(
                                record.monitoring_device
                            )}
                        </td>


                        <td>

                            <button
                                class="icon-btn"
                                data-edit="${esc(
                                    key(record)
                                )}"
                                title="Edit monitoring"
                            >

                                <i
                                    class="fa-solid fa-pen"
                                ></i>

                            </button>


                            <button
                                class="icon-btn danger"
                                data-del="${esc(
                                    key(record)
                                )}"
                                title="Delete monitoring"
                            >

                                <i
                                    class="fa-solid fa-trash"
                                ></i>

                            </button>

                        </td>

                    </tr>

                `;

            })

            .join("");


    /* -----------------------------------------
       EMPTY STATE
    ----------------------------------------- */

    if (!list.length) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty"
                >

                    No monitoring records found.

                </td>

            </tr>

        `;

    }


    /* -----------------------------------------
       EDIT BUTTONS
    ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-edit]"
        )
        .forEach(button => {

            button.onclick = () => {

                const record =
                    rows.find(
                        item =>
                            String(
                                key(item)
                            ) ===
                            button.dataset.edit
                    );


                if (record) {

                    open(record);

                }

            };

        });


    /* -----------------------------------------
       DELETE BUTTONS
    ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-del]"
        )
        .forEach(button => {

            button.onclick = () => {

                del(
                    button.dataset.del
                );

            };

        });


    /*
       Update GIS map.
    */

    updateMap();

}


/* =========================================================
   OPEN ADD / EDIT MODAL
========================================================= */

function open(record = null) {

    const form =
        $("#monitoringForm");


    const notice =
        $("#monitoringNotice");


    const modal =
        $("#monitoringModal");


    if (!form || !modal) {

        return;

    }


    /*
       Reset form
    */

    form.reset();


    /*
       Reset notice
    */

    if (notice) {

        notice.className =
            "notice";

        notice.textContent =
            "";

    }


    /*
       Set record ID
    */

    $("#monitoringId").value =
        record
            ? key(record)
            : "";


    /*
       Modal title
    */

    $("#monitoringModalTitle").textContent =
        record
            ? "Edit monitoring"
            : "Add monitoring";


    /* -----------------------------------------
       FILL EDIT DATA
    ----------------------------------------- */

    if (record) {

        $("#survey_id").value =
            record.survey_id || "";


        $("#monitoring_location").value =
            record.monitoring_location || "";


        $("#habitat_type").value =
            record.habitat_type || "";


        $("#protected_area").value =
            record.protected_area || "";


        $("#survey_date").value =
            record.survey_date

                ? String(
                    record.survey_date
                ).slice(0, 10)

                : "";


        $("#latitude").value =
            record
                .gps_coordinates
                ?.latitude ?? "";


        $("#longitude").value =
            record
                .gps_coordinates
                ?.longitude ?? "";


        $("#monitoring_device").value =
            record.monitoring_device || "";

    }


    /*
       Show modal
    */

    modal.classList.add(
        "show"
    );

}


/* =========================================================
   LOAD MONITORING RECORDS
========================================================= */

async function loadMonitoring() {

    try {

        console.log(
            "Loading monitoring records..."
        );


        rows =
            await req(
                "/monitoring/"
            );


        if (
            !Array.isArray(rows)
        ) {

            rows = [];

        }


        render();


    }

    catch (error) {

        console.error(
            "Monitoring load error:",
            error
        );


        const tableBody =
            $("#monitoringBody");


        if (tableBody) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="empty"
                        style="color:#a6342a"
                    >

                        ${esc(
                            error.message
                        )}

                    </td>

                </tr>

            `;

        }

    }

}


/* =========================================================
   LOAD WILDLIFE RECORDS
========================================================= */

async function loadWildlife() {

    try {

        console.log(
            "Loading wildlife observation records..."
        );


        wildlifeRows =
            await req(
                "/wildlife/"
            );

        console.log("WILDLIFE API DATA:", wildlifeRows);


        if (
            !Array.isArray(
                wildlifeRows
            )
        ) {

            wildlifeRows = [];

        }


        console.log(
            "Wildlife records received:",
            wildlifeRows
        );


        /*
           Update map after wildlife data loads.
        */

        updateMap();

    }

    catch (error) {

        /*
           Wildlife loading should NOT break
           the monitoring page.

           Monitoring CRUD continues working.
        */

        console.error(
            "Wildlife map data could not be loaded:",
            error
        );


        wildlifeRows = [];


        updateMap();

    }

}


/* =========================================================
   DELETE MONITORING RECORD
========================================================= */

async function del(id) {

    if (
        !confirm(
            "Delete this monitoring record?"
        )
    ) {

        return;

    }


    try {

        await req(

            `/monitoring/${id}`,

            {
                method: "DELETE"
            }

        );


        /*
           Reload monitoring + map.
        */

        await loadMonitoring();

        await loadWildlife();

    }

    catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

const menuButton =
    $("#menuButton");


const sidebar =
    $("#sidebar");


if (
    menuButton &&
    sidebar
) {

    menuButton.onclick = () => {

        sidebar.classList.toggle(
            "open"
        );

    };

}


/* =========================================================
   LOGOUT
========================================================= */

document
    .querySelectorAll(
        "[data-logout]"
    )
    .forEach(button => {

        button.onclick = event => {

            event.preventDefault();


            localStorage.removeItem(
                "wpis_token"
            );


            location.href =
                "login.html";

        };

    });


/* =========================================================
   ADD MONITORING BUTTON
========================================================= */

const addMonitoring =
    $("#addMonitoring");


if (addMonitoring) {

    addMonitoring.onclick = () => {

        open();

    };

}


/* =========================================================
   CLOSE MODAL
========================================================= */

const closeModalButton =
    $(
        "[data-close-modal]"
    );


if (closeModalButton) {

    closeModalButton.onclick = () => {

        $("#monitoringModal")
            .classList.remove(
                "show"
            );

    };

}


/* =========================================================
   CLOSE MODAL OUTSIDE
========================================================= */

const monitoringModal =
    $("#monitoringModal");


if (monitoringModal) {

    monitoringModal.onclick =
        event => {

            if (
                event.target ===
                event.currentTarget
            ) {

                event.currentTarget
                    .classList.remove(
                        "show"
                    );

            }

        };

}


/* =========================================================
   SEARCH
========================================================= */

const monitorSearch =
    $("#monitorSearch");


if (monitorSearch) {

    monitorSearch.oninput = () => {

        render();

    };

}


/* =========================================================
   FORM SUBMISSION
========================================================= */

const monitoringForm =
    $("#monitoringForm");


if (monitoringForm) {

    monitoringForm.onsubmit =
        async event => {

            event.preventDefault();


            /*
               Collect form data
            */

            const data = {

                survey_id:
                    $("#survey_id")
                        .value
                        .trim(),


                monitoring_location:
                    $("#monitoring_location")
                        .value
                        .trim(),


                habitat_type:
                    $("#habitat_type")
                        .value
                        .trim(),


                protected_area:
                    $("#protected_area")
                        .value
                        .trim(),


                survey_date:
                    $("#survey_date")
                        .value,


                gps_coordinates: {

                    latitude:
                        Number(
                            $("#latitude")
                                .value
                        ),


                    longitude:
                        Number(
                            $("#longitude")
                                .value
                        )

                },


                monitoring_device:
                    $("#monitoring_device")
                        .value
                        .trim()

            };


            /*
               Existing ID
            */

            const id =
                $("#monitoringId")
                    .value;


            try {

                /*
                   EDIT
                */

                if (id) {

                    await req(

                        `/monitoring/${id}`,

                        {

                            method:
                                "PUT",

                            body:
                                JSON.stringify(
                                    data
                                )

                        }

                    );

                }


                /*
                   ADD
                */

                else {

                    await req(

                        "/monitoring/",

                        {

                            method:
                                "POST",

                            body:
                                JSON.stringify(
                                    data
                                )

                        }

                    );

                }


                /*
                   Close modal
                */

                $("#monitoringModal")
                    .classList.remove(
                        "show"
                    );


                /*
                   Reload both map datasets.
                */

                await loadMonitoring();

                await loadWildlife();


            }

            catch (error) {

                console.error(
                    "Monitoring save error:",
                    error
                );


                const notice =
                    $("#monitoringNotice");


                if (notice) {

                    notice.className =
                        "notice error";


                    notice.textContent =
                        error.message;

                }

            }

        };

}


/* =========================================================
   INITIALIZE GIS
========================================================= */

initMap();


/* =========================================================
   INITIAL DATA LOAD
========================================================= */

loadMonitoring();

loadWildlife();