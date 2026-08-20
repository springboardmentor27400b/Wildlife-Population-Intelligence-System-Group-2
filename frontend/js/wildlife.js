const API_BASE =
    localStorage.getItem('wpis_api_base') ||
    'http://127.0.0.1:8000';

const token = () =>
    localStorage.getItem('wpis_token');


/* ============================================================
   WILDLIFE.JS
   Wildlife Population Intelligence System
   ============================================================ */


/* ============================================================
   GLOBAL DATA
   ============================================================ */

let records = [];

let groupedRecords = [];


/* ============================================================
   DOM HELPER
   ============================================================ */

const $ = selector =>
    document.querySelector(selector);


/* ============================================================
   ESCAPE HTML
   ============================================================ */

const esc = value =>

    String(
        value ?? ''
    )

    .replace(
        /[&<>"']/g,

        character => ({

            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'

        })[character]

    );


/* ============================================================
   GET RECORD ID
   ============================================================ */

function getId(record) {

    return (

        record?.id ||

        record?._id ||

        ''

    );

}


/* ============================================================
   IMAGE URL
   ============================================================ */

function imageUrl(path) {

    if (!path) {

        return '';

    }


    /* Already a complete URL */

    if (

        path.startsWith(
            'http://'
        )

        ||

        path.startsWith(
            'https://'
        )

    ) {

        return path;

    }


    /* Backend provides /uploads/... */

    if (

        path.startsWith(
            '/'
        )

    ) {

        return (

            'http://127.0.0.1:8000' +

            path

        );

    }


    return path;

}


/* ============================================================
   API REQUEST
   ============================================================ */

async function request(

    path,

    options = {}

) {


    /* ========================================================
       GET TOKEN
       ======================================================== */

    const token =

        localStorage.getItem(
            'wpis_token'
        );


    /* ========================================================
       CREATE HEADERS
       ======================================================== */

    const headers = {

        ...(options.headers || {})

    };


    /* ========================================================
       DO NOT SET JSON HEADER FOR FORMDATA
       ======================================================== */

    if (

        !(

            options.body

            instanceof

            FormData

        )

    ) {

        headers[
            'Content-Type'
        ] =

            'application/json';

    }


    /* ========================================================
       AUTHORIZATION
       ======================================================== */

    if (token) {

        headers.Authorization =

            `Bearer ${token}`;

    }


    /* ========================================================
       SEND REQUEST
       ======================================================== */

    const response =

        await fetch(

            'http://127.0.0.1:8000' +

            path,

            {

                ...options,

                headers

            }

        );


    /* ========================================================
       UNAUTHORIZED
       ======================================================== */

    if (

        response.status ===

        401

    ) {

        localStorage.removeItem(
            'wpis_token'
        );

        window.location.href =
            'login.html';

        return;

    }


    /* ========================================================
       HANDLE ERRORS
       ======================================================== */

    if (

        !response.ok

    ) {

        let detail =

            'Request failed.';


        try {

            const data =

                await response.json();


            if (

                Array.isArray(
                    data.detail
                )

            ) {

                detail =

                    data.detail

                        .map(
                            item =>
                                item.msg
                        )

                        .join(
                            ' '
                        );

            }

            else {

                detail =

                    data.detail ||

                    detail;

            }

        }

        catch (error) {

            console.error(
                error
            );

        }


        throw new Error(
            detail
        );

    }


    /* ========================================================
       NO CONTENT
       ======================================================== */

    if (

        response.status ===

        204

    ) {

        return null;

    }


    /* ========================================================
       RETURN JSON
       ======================================================== */

    return response.json();

}


/* ============================================================
   GROUP WILDLIFE RECORDS

   Backend stores AI detections individually:

   Elephant #1 -> count 1
   Elephant #2 -> count 1

   Frontend displays:

   Elephant -> 2 individuals

   Individual records are preserved in:

   group.individualRecords
   ============================================================ */

function groupWildlifeRecords(

    wildlifeRecords

) {


    const groups = {};


    wildlifeRecords.forEach(

        record => {


            /* =================================================
               NORMALIZE VALUES
               ================================================= */

            const species =

                (

                    record.species_name ||

                    'Unknown species'

                )

                .trim();


            const location =

                (

                    record.location ||

                    'Unknown location'

                )

                .trim();


            const image =

                (

                    record.image_url ||

                    ''

                )

                .trim();


            /* =================================================
               GROUP KEY

               Same species
               +
               Same location
               +
               Same image

               This means:

               Elephant image A -> group 1
               Elephant image B -> group 2

               Two elephants detected in image A
               -> same group
               ================================================= */

            const groupKey =

                [

                    species.toLowerCase(),

                    location.toLowerCase(),

                    image

                ]

                .join(
                    '||'
                );


            /* =================================================
               CREATE GROUP
               ================================================= */

            if (

                !groups[groupKey]

            ) {

                groups[groupKey] = {


                    /* First record ID is used
                       for Edit/Delete */

                    id:

                        getId(
                            record
                        ),


                    species_name:

                        species,


                    /* Start at zero.
                       Every record adds its count. */

                    count:

                        0,


                    location:

                        location,


                    health_status:

                        record.health_status ||

                        record.conservation_status ||

                        'Recorded',


                    conservation_status:

                        record.conservation_status ||

                        'Not Evaluated',


                    behavior:

                        record.behavior ||

                        'Unknown',


                    behavior_confidence:

                        Number(

                            record.behavior_confidence ||

                            0

                        ),


                    detection_confidence:

                        Number(

                            record.detection_confidence ||

                            0

                        ),


                    image_url:

                        record.image_url ||

                        null,


                    /* Keep individual detections */

                    individualRecords:

                        []

                };

            }


            /* =================================================
               SAVE INDIVIDUAL RECORD

               This is important because:

               Elephant #1 -> Standing
               Elephant #2 -> Eating

               should NOT be lost when displaying:

               Elephant -> 2 individuals
               ================================================= */

            groups[groupKey]

                .individualRecords

                .push(

                    record

                );


            /* =================================================
               ADD COUNT

               Example:

               First elephant:
               count = 1

               Second elephant:
               count = 1

               Total:
               1 + 1 = 2
               ================================================= */

            console.log(
                "WILDLIFE RECORD:",
                record.species_name,
                "count:",
                record.count,
                "behavior:",
                record.behavior
                );

                groups[groupKey].count += Number(record.count || 0);

        }

    );


    return Object.values(

        groups

    );

}


/* ============================================================
   RENDER WILDLIFE CARDS
   ============================================================ */

function render() {


    console.log(

        'Rendering wildlife records:',

        records

    );


    const grid =

        $('#wildlifeGrid');


    if (!grid) {

        console.error(

            'wildlifeGrid not found'

        );

        return;

    }


    const searchInput =

        $('#searchInput');


    const statusFilter =

        $('#statusFilter');


    const query =

        searchInput

            ? searchInput.value

                .toLowerCase()

                .trim()

            : '';


    const filter =

        statusFilter

            ? statusFilter.value

            : '';


    /* ========================================================
       FILTER ORIGINAL RECORDS FIRST
       ======================================================== */

    const filteredRecords =

        records.filter(

            record => {


                const searchableText =

                    `

                    ${record.species_name || ''}

                    ${record.location || ''}

                    ${record.behavior || ''}

                    ${record.conservation_status || ''}

                    ${record.health_status || ''}

                    `

                    .toLowerCase();


                const matchesSearch =

                    searchableText

                        .includes(

                            query

                        );


                const matchesFilter =

                    (

                        !filter

                        ||

                        record.health_status ===

                        filter

                    );


                return (

                    matchesSearch

                    &&

                    matchesFilter

                );

            }

        );


    /* ========================================================
       GROUP FILTERED RECORDS
       ======================================================== */

    groupedRecords =

        groupWildlifeRecords(

            filteredRecords

        );


    console.log(

        'Grouped wildlife records:',

        groupedRecords

    );


    /* ========================================================
       EMPTY STATE
       ======================================================== */

    if (

        groupedRecords.length ===

        0

    ) {

        grid.innerHTML =

            `

            <p style="color:#6c7d76">

                No wildlife records match this view.

            </p>

            `;


        return;

    }


    /* ========================================================
       RENDER CARDS
       ======================================================== */

    grid.innerHTML =

        groupedRecords

            .map(

                group => {


                    /* =================================================
                       INDIVIDUAL BEHAVIOR SUMMARY

                       Example:

                       Standing (0.98)
                       Eating (0.85)

                       This allows you to see the behavior
                       of each detected animal.
                       ================================================= */

                    const behaviorSummary =

    group.individualRecords

        .map(

            (

                individual,

                index

            ) => {

                const behavior =

                    individual.behavior ||

                    'Unknown';


                const behaviorConfidence =

                    Number(

                        individual.behavior_confidence ||

                        0

                    ) * 100;


                const detectionConfidence =

                    Number(

                        individual.detection_confidence ||

                        individual.confidence ||

                        0

                    ) * 100;


                return `

                    <div class="individual-detection">

                        <strong>
                            Animal ${index + 1}
                        </strong>

                        <br>

                        <span>
                            Species:
                            ${esc(
                                individual.species_name ||
                                individual.species ||
                                group.species_name
                            )}
                        </span>

                        <br>

                        <span>
                            Detection:
                            ${detectionConfidence.toFixed(1)}%
                        </span>

                        <br>

                        <span>
                            Behavior:
                            ${esc(behavior)}
                            (${behaviorConfidence.toFixed(1)}%)
                        </span>

                    </div>

                `;

            }

        )

        .join('');


                    return `

                    <article

                        class="record-card"

                    >


                        <!-- IMAGE -->

                        <img

                            src="${esc(

                                imageUrl(

                                    group.image_url

                                )

                                ||

                                'images/deer.jpg'

                            )}"

                            alt="${esc(

                                group.species_name ||

                                'Wildlife'

                            )}"

                        >


                        <div

                            class="record-body"

                        >


                            <!-- CONSERVATION STATUS -->

                            <span

                                class="badge"

                            >

                                ${esc(

                                    group.health_status ||

                                    group.conservation_status ||

                                    'Recorded'

                                )}

                            </span>


                            <!-- SPECIES -->

                            <h3>

                                ${esc(

                                    group.species_name ||

                                    'Unknown species'

                                )}

                            </h3>


                            <!-- LOCATION + TOTAL COUNT -->

                            <p>

                                ${esc(

                                    group.location ||

                                    'Unknown location'

                                )}

                                ·

                                ${esc(

                                    group.count

                                )}

                                individuals

                            </p>


                            <!-- AI ANALYSIS -->

<div class="wildlife-ai-analysis">

    <p>
        <strong>
            <i class="fa-solid fa-brain"></i>
            AI Analysis
        </strong>
    </p>

    <!-- DETECTION CONFIDENCE -->

    <p>

        <strong>
            Detection confidence:
        </strong>

        ${(
            Number(
                group.detection_confidence || 0
            ) * 100
        ).toFixed(1)}%

    </p>


    <!-- BEHAVIOR -->

    <p>
        <strong>
            Behavior:
        </strong>
    </p>

    <div class="behavior-list">

        ${behaviorSummary}

    </div>


    <!-- INDIVIDUAL DETECTIONS -->

    <p>

        <strong>
            Individual detections:
        </strong>

        ${esc(
            group.individualRecords.length
        )}

    </p>

</div>

                            <!-- ACTION BUTTONS -->

                            <div

                                class="record-actions"

                            >


                                <button

                                    class="icon-btn"

                                    data-edit="${esc(

                                        group.id

                                    )}"

                                >

                                    <i

                                        class="fa-solid fa-pen"

                                    ></i>

                                    Edit

                                </button>


                                <button

                                    class="icon-btn danger"

                                    data-delete="${esc(

                                        group.id

                                    )}"

                                >

                                    <i

                                        class="fa-solid fa-trash"

                                    ></i>

                                </button>


                            </div>


                        </div>


                    </article>

                    `;

                }

            )

            .join('');


    /* ========================================================
       EDIT BUTTONS
       ======================================================== */

    document

        .querySelectorAll(

            '[data-edit]'

        )

        .forEach(

            button => {


                button.onclick = () => {


                    handleEdit(

                        button.dataset.edit

                    );

                };

            }

        );


    /* ========================================================
       DELETE BUTTONS
       ======================================================== */

    document

        .querySelectorAll(

            '[data-delete]'

        )

        .forEach(

            button => {


                button.onclick = () => {


                    handleDelete(

                        button.dataset.delete

                    );

                };

            }

        );

}

/* ============================================================
   ADD WILDLIFE BUTTON
   ============================================================ */

const addWildlifeButton =
    $('#addWildlife');


if (addWildlifeButton) {

    addWildlifeButton.addEventListener(
        'click',
        function () {

            console.log(
                'Add Wildlife button clicked'
            );


            /* Reset form */

            const form =
                $('#wildlifeForm');


            if (form) {

                form.reset();

            }


            /* Clear hidden ID */

            const wildlifeId =
                $('#wildlifeId');


            if (wildlifeId) {

                wildlifeId.value = '';

            }


            /* Reset modal title */

            const modalTitle =
                $('#wildlifeModalTitle');


            if (modalTitle) {

                modalTitle.textContent =
                    'Add wildlife';

            }


            /* Clear notice */

            const notice =
                $('#wildlifeNotice');


            if (notice) {

                notice.className =
                    'notice';

                notice.textContent =
                    '';

            }


            /* Reset AI result */

            const aiResultContent =
                $('#aiResultContent');


            if (aiResultContent) {

                aiResultContent.innerHTML =

                    `

                    Select an image and click

                    <strong>
                        Analyze with AI
                    </strong>.

                    `;

            }


            /* Hide image preview */

            const imagePreview =
                $('#imagePreview');


            if (imagePreview) {

                imagePreview.src = '';

                imagePreview.style.display =
                    'none';

            }


            /* Open modal */

            const modal =
                $('#wildlifeModal');


            if (modal) {

                modal.classList.add(
                    'show'
                );

            }

        }

    );

}


/* ============================================================
   CLOSE WILDLIFE MODAL
   ============================================================ */

document
    .querySelectorAll(
        '[data-close-modal]'
    )
    .forEach(

        button => {

            button.addEventListener(
                'click',
                function () {

                    const modal =
                        $('#wildlifeModal');


                    if (modal) {

                        modal.classList.remove(
                            'show'
                        );

                    }

                }

            );

        }

    );


/* ============================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
   ============================================================ */

const wildlifeModal =
    $('#wildlifeModal');


if (wildlifeModal) {

    wildlifeModal.addEventListener(

        'click',

        function (event) {

            if (

                event.target ===
                wildlifeModal

            ) {

                wildlifeModal.classList.remove(
                    'show'
                );

            }

        }

    );

}

/* ============================================================
   ANALYZE IMAGE WITH AI
   ============================================================ */

const analyzeImageButton =
    document.getElementById('analyzeImage');

const imageInput =
    document.getElementById('image');

const aiResultContent =
    document.getElementById('aiResultContent');


if (analyzeImageButton) {

    analyzeImageButton.addEventListener(
        'click',
        async function () {

            const file =
                imageInput.files[0];


            /* CHECK IMAGE */

            if (!file) {

                aiResultContent.innerHTML =

                    `<p style="color:#a6342a">
                        Please select an image first.
                    </p>`;

                return;

            }


            /* LOADING */

            analyzeImageButton.disabled =
                true;

            analyzeImageButton.innerHTML =

                `<i class="fa-solid fa-spinner fa-spin"></i>
                 Analyzing...`;


            aiResultContent.innerHTML =

                `<p>
                    AI is analyzing the image...
                </p>`;


            try {

                /* CREATE FORM DATA */

                const formData =
                    new FormData();

                formData.append(
                    'image',
                    file
                );


                console.log(
                    'Sending image to:',
                    `${API_BASE}/images/`
                );


                /* CALL AI IMAGE ENDPOINT */

                const response =
                    await fetch(
                        'http://127.0.0.1:8000/images/',

                        {

                            method: 'POST',

                            headers: {

                                Authorization:
                                    `Bearer ${token()}`

                            },

                            body:
                                formData

                        }

                    );


                /* HANDLE ERROR */

                if (!response.ok) {

                    const errorData =
                        await response
                            .json()
                            .catch(
                                () => ({})
                            );


                    throw new Error(

                        errorData.detail ||

                        `AI analysis failed.
                         Status: ${response.status}`

                    );

                }


                /* GET RESPONSE */

                const data =
                    await response.json();


                console.log(
                    'AI RESULT:',
                    data
                );


                const detections =
                    data.detections || [];


                const animalCount =
                    data.animal_count ||
                    detections.length;


                /* NO DETECTIONS */

                if (
                    detections.length === 0
                ) {

                    aiResultContent.innerHTML =

                        `

                        <div>

                            <h4>
                                No animals detected
                            </h4>

                            <p>
                                The AI could not
                                identify any supported
                                animals.
                            </p>

                        </div>

                        `;

                    return;

                }


                /* =================================================
                   BUILD AI RESULT
                   ================================================= */

                let html =

                    `

                    <div class="ai-success">

                        <h4>
                            <i class="fa-solid fa-check-circle"></i>
                            AI Analysis Completed
                        </h4>

                        <p>

                            <strong>
                                ${animalCount}
                            </strong>

                            animal(s) detected.

                        </p>

                    </div>

                    `;


                /* =================================================
                   SHOW EACH DETECTION
                   ================================================= */

                detections.forEach(

                    (detection, index) => {

                        html +=

                            `

                            <div
                                class="ai-animal-result"
                                style="
                                    margin-top:15px;
                                    padding:15px;
                                    border:1px solid #ddd;
                                    border-radius:10px;
                                "
                            >

                                <h4>
                                    Animal ${index + 1}
                                </h4>


                                <p>

                                    <strong>
                                        Species:
                                    </strong>

                                    ${
                                        esc(
                                            detection.species ||
                                            'Unknown'
                                        )
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Detection confidence:
                                    </strong>

                                    ${
                                        (
                                            Number(
                                                detection.confidence ||
                                                0
                                            ) * 100
                                        ).toFixed(1)
                                    }%

                                </p>


                                <p>

                                    <strong>
                                        Behavior:
                                    </strong>

                                    ${
                                        esc(
                                            detection.behavior ||
                                            'Unknown'
                                        )
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Behavior confidence:
                                    </strong>

                                    ${
                                        (
                                            Number(
                                                detection.behavior_confidence ||
                                                0
                                            ) * 100
                                        ).toFixed(1)
                                    }%

                                </p>


                                <p>

                                    <strong>
                                        Conservation status:
                                    </strong>

                                    ${
                                        esc(
                                            detection.conservation_status ||
                                            'Not Evaluated'
                                        )
                                    }

                                </p>

                            </div>

                            `;

                    }

                );


                aiResultContent.innerHTML =
                    html;


                /* =================================================
                   AUTO-FILL FORM
                   ================================================= */

                const firstDetection =
                    detections[0];


                if (firstDetection) {

                    /* SPECIES */

                    const speciesInput =
                        document.getElementById(
                            'species'
                        );


                    if (speciesInput) {

                        speciesInput.value =

                            firstDetection.species

                                ? firstDetection.species
                                    .charAt(0)
                                    .toUpperCase() +

                                  firstDetection.species
                                    .slice(1)

                                : '';

                    }


                    /* COUNT */

                    const countInput =
                        document.getElementById(
                            'population_count'
                        );


                    if (countInput) {

                        countInput.value =
                            animalCount;

                    }


                    /* CONSERVATION STATUS */

                    const statusInput =
                        document.getElementById(
                            'conservation_status'
                        );


                    if (statusInput) {

                        statusInput.value =

                            firstDetection
                                .conservation_status ||

                            'Protected';

                    }

                }


            }

            catch (error) {

                console.error(
                    'AI analysis error:',
                    error
                );


                aiResultContent.innerHTML =

                    `

                    <div
                        style="color:#a6342a"
                    >

                        <strong>
                            AI Analysis Failed
                        </strong>

                        <p>
                            ${esc(
                                error.message
                            )}
                        </p>

                    </div>

                    `;

            }


            finally {

                analyzeImageButton.disabled =
                    false;

                analyzeImageButton.innerHTML =

                    `

                    <i class="fa-solid fa-brain"></i>

                    Analyze with AI

                    `;

            }

        }

    );

}


/* ============================================================
   LOAD WILDLIFE DATA
   ============================================================ */

async function load() {


    try {


        console.log(

            'Loading wildlife records...'

        );


        records =

            await request(

                '/wildlife/'

            );


        console.log(

            'Raw records received:',

            records

        );


        if (

            !Array.isArray(

                records

            )

        ) {

            records = [];

        }


        render();


    }


    catch (error) {


        console.error(

            'Failed to load wildlife:',

            error

        );


        const grid =

            $('#wildlifeGrid');


        if (grid) {

            grid.innerHTML =

                `

                <p

                    style="color:#a6342a"

                >

                    ${esc(

                        error.message

                    )}

                </p>

                `;

        }

    }

}


/* ============================================================
   EDIT WILDLIFE RECORD
============================================================ */

function handleEdit(recordId) {

    const record =
        records.find(
            item =>
                String(getId(item)) ===
                String(recordId)
        );

    if (!record) {

        console.error(
            "Wildlife record not found:",
            recordId
        );

        return;

    }

    console.log(
        "Editing wildlife record:",
        record
    );


    /* ========================================================
       GET MODAL
    ======================================================== */

    const modal =
        $("#wildlifeModal");

    if (!modal) {

        console.error(
            "wildlifeModal not found."
        );

        return;

    }


    /* ========================================================
       GET FORM
    ======================================================== */

    const form =
        $("#wildlifeForm");

    if (form) {

        form.reset();

    }


    /* ========================================================
       SET RECORD ID
    ======================================================== */

    const wildlifeId =
        $("#wildlifeId");

    if (wildlifeId) {

        wildlifeId.value =
            getId(record) || "";

    }


    /* ========================================================
       MODAL TITLE
    ======================================================== */

    const modalTitle =
        $("#wildlifeModalTitle");

    if (modalTitle) {

        modalTitle.textContent =
            "Edit wildlife";

    }


    /* ========================================================
       FILL SPECIES
    ======================================================== */

    const species =
        $("#species_name") ||
        $("#species");

    if (species) {

        species.value =
            record.species_name ||
            record.species ||
            "";

    }


    /* ========================================================
       FILL COUNT
    ======================================================== */

    const count =
        $("#count") ||
        $("#population_count");

    if (count) {

        count.value =
            record.count ??
            record.population_count ??
            1;

    }


    /* ========================================================
       LOCATION
    ======================================================== */

    const location =
        $("#location");

    if (location) {

        location.value =
            record.location ||
            "";

    }


    /* ========================================================
       HEALTH STATUS
    ======================================================== */

    const healthStatus =
        $("#health_status");

    if (healthStatus) {

        healthStatus.value =
            record.health_status ||
            "";

    }


    /* ========================================================
       CONSERVATION STATUS
    ======================================================== */

    const conservationStatus =
        $("#conservation_status");

    if (conservationStatus) {

        conservationStatus.value =
            record.conservation_status ||
            "";

    }


    /* ========================================================
       BEHAVIOR
    ======================================================== */

    const behavior =
        $("#behavior");

    if (behavior) {

        behavior.value =
            record.behavior ||
            "";

    }


    /* ========================================================
       BEHAVIOR CONFIDENCE
    ======================================================== */

    const behaviorConfidence =
        $("#behavior_confidence");

    if (behaviorConfidence) {

        behaviorConfidence.value =
            record.behavior_confidence ??
            "";

    }


    /* ========================================================
       DETECTION CONFIDENCE
    ======================================================== */

    const detectionConfidence =
        $("#detection_confidence");

    if (detectionConfidence) {

        detectionConfidence.value =
            record.detection_confidence ??
            "";

    }


    /* ========================================================
       IMAGE PREVIEW
    ======================================================== */

    const imagePreview =
        $("#imagePreview");

    if (
        imagePreview &&
        record.image_url
    ) {

        let imageUrl =
            record.image_url;

        /*
           If backend returns a relative
           upload path, attach API_BASE.
        */

        if (
            imageUrl.startsWith("/")
        ) {

            imageUrl =
                API_BASE +
                imageUrl;

        }

        imagePreview.src =
            imageUrl;

        imagePreview.style.display =
            "block";

    }


    /* ========================================================
       RESET NOTICE
    ======================================================== */

    const notice =
        $("#wildlifeNotice");

    if (notice) {

        notice.className =
            "notice";

        notice.textContent =
            "";

    }


    /* ========================================================
       SHOW MODAL
    ======================================================== */

    modal.classList.add(
        "show"
    );

}


/* ============================================================
   DELETE WILDLIFE RECORD
   ============================================================ */

async function handleDelete(

    recordId

) {


    if (

        !recordId

    ) {

        return;

    }


    const confirmed =

        confirm(

            'Delete this wildlife record?'

        );


    if (

        !confirmed

    ) {

        return;

    }


    try {


        await request(

            `/wildlife/${recordId}`,

            {

                method:

                    'DELETE'

            }

        );


        await load();


    }


    catch (error) {


        console.error(

            'Failed to delete wildlife:',

            error

        );


        alert(

            error.message

        );

    }

}


/* ============================================================
   SEARCH
   ============================================================ */

const searchInput =

    $('#searchInput');


if (

    searchInput

) {

    searchInput.addEventListener(

        'input',

        render

    );

}


/* ============================================================
   STATUS FILTER
   ============================================================ */

const statusFilter =

    $('#statusFilter');


if (

    statusFilter

) {

    statusFilter.addEventListener(

        'change',

        render

    );

}


/* ============================================================
   INITIAL LOAD
   ============================================================ */

load();

/* ============================================================
   WILDLIFE FORM SUBMIT
   ADD + EDIT
   ============================================================ */

const wildlifeForm = document.getElementById("wildlifeForm");

if (wildlifeForm) {

    wildlifeForm.onsubmit = async function (event) {

        event.preventDefault();

        console.log("Wildlife form submitted");

        const wildlifeId =
            document.getElementById("wildlifeId")?.value?.trim() || "";

        const species =
            document.getElementById("species_name")?.value?.trim() ||
            document.getElementById("species")?.value?.trim() ||
            "";

        const count =
            document.getElementById("count")?.value ||
            document.getElementById("population_count")?.value ||
            "1";

        const location =
            document.getElementById("location")?.value?.trim() ||
            "";

        const healthStatus =
            document.getElementById("health_status")?.value?.trim() ||
            "";

        const conservationStatus =
            document.getElementById("conservation_status")?.value?.trim() ||
            "";

        const behavior =
            document.getElementById("behavior")?.value?.trim() ||
            "";

        const behaviorConfidence =
            document.getElementById("behavior_confidence")?.value ||
            "";

        const detectionConfidence =
            document.getElementById("detection_confidence")?.value ||
            "";

        const imageInput =
            document.getElementById("image");

        const notice =
            document.getElementById("wildlifeNotice");


        /* ========================================================
           VALIDATION
           ======================================================== */

        if (!species) {

            if (notice) {

                notice.className = "notice error";

                notice.textContent =
                    "Please enter the species name.";

            }

            return;

        }


        if (!location) {

            if (notice) {

                notice.className = "notice error";

                notice.textContent =
                    "Please enter the location.";

            }

            return;

        }


        /* ========================================================
           FORM DATA
           ======================================================== */

        const formData = new FormData();

        formData.append(
            "species_name",
            species
        );

        formData.append(
            "count",
            count
        );

        formData.append(
            "location",
            location
        );

        formData.append(
            "health_status",
            healthStatus
        );

        formData.append(
            "conservation_status",
            conservationStatus
        );

        formData.append(
            "behavior",
            behavior
        );

        if (behaviorConfidence !== "") {

            formData.append(
                "behavior_confidence",
                behaviorConfidence
            );

        }

        if (detectionConfidence !== "") {

            formData.append(
                "detection_confidence",
                detectionConfidence
            );

        }


        /* ========================================================
           IMAGE
           
           Only send a new image if the user selected one.
           Existing image remains unchanged otherwise.
           ======================================================== */

        if (
            imageInput &&
            imageInput.files &&
            imageInput.files.length > 0
        ) {

            formData.append(
                "image",
                imageInput.files[0]
            );

        }


        /* ========================================================
           BUTTON
           ======================================================== */

        const submitButton =
            wildlifeForm.querySelector(
                'button[type="submit"]'
            );

        const originalButtonText =
            submitButton
                ? submitButton.innerHTML
                : "";


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.innerHTML =
                `<i class="fa-solid fa-spinner fa-spin"></i>
                 ${wildlifeId ? "Updating..." : "Saving..."}`;

        }


        if (notice) {

            notice.className = "notice";

            notice.textContent =
                wildlifeId
                    ? "Updating wildlife record..."
                    : "Saving wildlife record...";

        }


        try {

            /* ====================================================
               EDIT
               ==================================================== */

            if (wildlifeId) {

                console.log(
                    "Updating wildlife record:",
                    wildlifeId
                );


                const response =
                    await fetch(
                        `${API_BASE}/wildlife/${encodeURIComponent(wildlifeId)}`,
                        {
                            method: "PUT",

                            headers: {
                                Authorization:
                                    `Bearer ${token()}`
                            },

                            body: formData
                        }
                    );


                if (response.status === 401) {

                    localStorage.removeItem(
                        "wpis_token"
                    );

                    localStorage.removeItem(
                        "wpis_user"
                    );

                    window.location.href =
                        "login.html";

                    return;

                }


                if (!response.ok) {

                    const errorData =
                        await response
                            .json()
                            .catch(() => ({}));


                    let errorMessage =
                        "Failed to update wildlife record.";


                    if (
                        Array.isArray(
                            errorData.detail
                        )
                    ) {

                        errorMessage =
                            errorData.detail
                                .map(
                                    item =>
                                        item.msg
                                )
                                .join(" ");

                    }

                    else if (
                        errorData.detail
                    ) {

                        errorMessage =
                            errorData.detail;

                    }


                    throw new Error(
                        errorMessage
                    );

                }


                const updatedRecord =
                    await response.json()
                        .catch(() => null);


                console.log(
                    "Wildlife record updated:",
                    updatedRecord
                );


                if (notice) {

                    notice.className =
                        "notice success";

                    notice.textContent =
                        "Wildlife record updated successfully.";

                }


                /* Reload records */

                await load();


                /* Close modal */

                setTimeout(
                    () => {

                        const modal =
                            document.getElementById(
                                "wildlifeModal"
                            );

                        if (modal) {

                            modal.classList.remove(
                                "show"
                            );

                        }

                    },
                    500
                );


                return;

            }


            /* ====================================================
               ADD NEW RECORD
               ==================================================== */

            console.log(
                "Creating new wildlife record"
            );


            const response =
                await fetch(
                    `${API_BASE}/wildlife/`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token()}`
                        },

                        body: formData
                    }
                );


            if (response.status === 401) {

                localStorage.removeItem(
                    "wpis_token"
                );

                localStorage.removeItem(
                    "wpis_user"
                );

                window.location.href =
                    "login.html";

                return;

            }


            if (!response.ok) {

                const errorData =
                    await response
                        .json()
                        .catch(() => ({}));


                let errorMessage =
                    "Failed to create wildlife record.";


                if (
                    Array.isArray(
                        errorData.detail
                    )
                ) {

                    errorMessage =
                        errorData.detail
                            .map(
                                item =>
                                    item.msg
                            )
                            .join(" ");

                }

                else if (
                    errorData.detail
                ) {

                    errorMessage =
                        errorData.detail;

                }


                throw new Error(
                    errorMessage
                );

            }


            const createdRecord =
                await response.json()
                    .catch(() => null);


            console.log(
                "Wildlife record created:",
                createdRecord
            );


            if (notice) {

                notice.className =
                    "notice success";

                notice.textContent =
                    "Wildlife record added successfully.";

            }


            /* Reload */

            await load();


            /* Close modal */

            setTimeout(
                () => {

                    const modal =
                        document.getElementById(
                            "wildlifeModal"
                        );

                    if (modal) {

                        modal.classList.remove(
                            "show"
                        );

                    }

                },
                500
            );

        }


        catch (error) {

            console.error(
                "Wildlife form submission error:",
                error
            );


            if (notice) {

                notice.className =
                    "notice error";

                notice.textContent =
                    error.message ||
                    "Something went wrong.";

            }

        }


        finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.innerHTML =
                    originalButtonText;

            }

        }

    };

}