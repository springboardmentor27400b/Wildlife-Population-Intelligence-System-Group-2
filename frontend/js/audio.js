const API_BASE =
    localStorage.getItem('wpis_api_base') ||
    'http://127.0.0.1:8000';

const token = () =>
    localStorage.getItem('wpis_token');


const $ = selector =>
    document.querySelector(selector);


/* =========================
   API REQUEST
========================= */

async function request(path, options = {}) {

    const headers = {
        ...(options.body instanceof FormData
            ? {}
            : {
                'Content-Type': 'application/json'
            }),

        ...(options.headers || {})
    };


    if (token()) {

        headers.Authorization =
            `Bearer ${token()}`;

    }


    let response;

    try {

        response = await fetch(
            API_BASE + path,
            {
                ...options,
                headers
            }
        );

    } catch (error) {

        throw new Error(
            'Cannot connect to the backend. Please make sure FastAPI is running on http://127.0.0.1:8000'
        );

    }


    if (response.status === 401) {

        localStorage.removeItem(
            'wpis_token'
        );

        location.href =
            'login.html';

        return;

    }


    if (!response.ok) {

        const data =
            await response
                .json()
                .catch(() => ({}));


        const message =
            Array.isArray(data.detail)

                ? data.detail
                    .map(x => x.msg)
                    .join(' ')

                : data.detail;


        throw new Error(
            message ||
            `Request failed with status ${response.status}`
        );

    }


    if (response.status === 204) {

        return null;

    }


    return response.json();

}


/* =========================
   MESSAGE
========================= */

function showMessage(
    message,
    type = 'loading'
) {

    const box =
        $('#audioMessage');


    box.textContent =
        message;


    box.className =
        `message show ${type}`;

}


function hideMessage() {

    $('#audioMessage')
        .className =
        'message';

}


/* =========================
   FILE SELECTION
========================= */

$('#audioFile').onchange =
    event => {

        const file =
            event.target.files[0];


        if (!file) {

            $('#selectedFile').textContent =
                'No file selected';


            $('#audioPreviewBox')
                .classList
                .remove('show');


            return;

        }


        $('#selectedFile').textContent =
            file.name;


        const audioURL =
            URL.createObjectURL(
                file
            );


        $('#audioPlayer').src =
            audioURL;


        $('#audioPreviewBox')
            .classList
            .add('show');

    };


/* =========================
   UPLOAD + ANALYZE AUDIO
========================= */

$('#audioForm').onsubmit =
    async event => {

        event.preventDefault();


        const file =
            $('#audioFile')
                .files[0];


        if (!file) {

            showMessage(
                'Please select an audio file.',
                'error'
            );

            return;

        }


        const button =
            $('#analyzeButton');


        button.disabled =
            true;


        button.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Analyzing...

        `;


        showMessage(
            'AI is analyzing your audio. This may take some time...',
            'loading'
        );


        try {

            /* =========================
               CREATE FORM DATA
            ========================= */

            const formData =
                new FormData();


            formData.append(
                'audio',
                file
            );


            /* =========================
               SEND TO BACKEND
            ========================= */

            const result =
                await request(
                    '/audio/',
                    {
                        method: 'POST',
                        body: formData
                    }
                );


            console.log(
                'Audio analysis result:',
                result
            );


            /* =========================
               SUCCESS MESSAGE
            ========================= */

            showMessage(
                'Audio analyzed successfully!',
                'success'
            );


            /* =========================
               DISPLAY RESULTS
            ========================= */

            displayResults(
                result
            );


            /* =========================
               REFRESH HISTORY
            ========================= */

            await loadHistory();


        }

        catch (error) {

            console.error(
                'Audio analysis error:',
                error
            );


            showMessage(
                error.message ||
                'Audio analysis failed.',
                'error'
            );

        }

        finally {

            button.disabled =
                false;


            button.innerHTML = `

                <i class="fa-solid fa-wand-magic-sparkles"></i>

                Analyze Audio

            `;

        }

    };


/* =========================
   DISPLAY AUDIO RESULTS
========================= */

function displayResults(result) {

    console.log(
        'Displaying audio result:',
        result
    );


    /* =========================
       SHOW FILE NAME
    ========================= */

    const filename =
        result.filename ||
        'Audio file';


    $('#resultFilename').textContent =
        filename;


    /* =========================
       GET YAMNET RESULTS
    ========================= */

    const yamnetPredictions =
        Array.isArray(
            result.yamnet_predictions
        )
            ? result.yamnet_predictions
            : [];


    /* =========================
       GET BIRDNET RESULTS
    ========================= */

    const birdnetPredictions =
        Array.isArray(
            result.birdnet_predictions
        )
            ? result.birdnet_predictions
            : [];


    console.log(
        'YAMNet predictions:',
        yamnetPredictions
    );


    console.log(
        'BirdNET predictions:',
        birdnetPredictions
    );


    /* =========================
       CREATE RESULT HTML
    ========================= */

    let html = '';
    /* =========================
   BIOACOUSTIC SUMMARY
========================= */

const topYamnet = yamnetPredictions[0];
const topBirdnet = birdnetPredictions[0];

html += `
    <div class="bioacoustic-summary">

        <h3>
            <i class="fa-solid fa-microphone-lines"></i>
            Bioacoustic Analysis Summary
        </h3>

        <p>
            <strong>Audio File:</strong>
            ${escapeHTML(filename)}
        </p>

        <p>
            <strong>Sound Detection:</strong>
            ${
                topYamnet
                    ? escapeHTML(
                        topYamnet.label ||
                        'Unknown sound'
                    )
                    : 'No sound detected'
            }
        </p>

        <p>
            <strong>Bird Species:</strong>
            ${
                topBirdnet
                    ? escapeHTML(
                        topBirdnet.species ||
                        'Unknown bird'
                    )
                    : 'No bird species identified'
            }
        </p>

    </div>
`;


    /* =========================
       YAMNET RESULTS
    ========================= */

    if (
        yamnetPredictions.length > 0
    ) {

        html += `

            <div class="prediction-section">

                <h3>

                    <i class="fa-solid fa-volume-high"></i>

                    Bioacoustic & Acoustic Event Analysis
                    <small>(YAMNet)</small>

                </h3>

        `;


        yamnetPredictions.forEach(
            prediction => {

                const label =
                    prediction.label ||
                    'Unknown sound';


                const confidence =
                    Number(
                        prediction.confidence ||
                        0
                    );


                const percentage =
                    Math.min(
                        100,
                        Math.max(
                            0,
                            confidence * 100
                        )
                    ).toFixed(2);


                html += `

                    <div class="prediction-card">

                        <div class="prediction-top">

                            <span class="prediction-label">

                                <i class="fa-solid fa-volume-high"></i>

                                ${escapeHTML(
                                    label
                                )}

                            </span>


                            <span class="confidence">

                                ${percentage}%

                            </span>

                        </div>


                        <small>

                            AI Model:
                            <strong>
                            YAMNet
                            </strong>

                        </small>


                        <div class="progress">

                            <div
                                class="progress-bar"
                                style="width:${percentage}%"
                            ></div>

                        </div>

                    </div>

                `;

            }
        );


        html += `

            </div>

        `;

    }


    /* =========================
       BIRDNET RESULTS
    ========================= */

    if (
        birdnetPredictions.length > 0
    ) {

        html += `

            <div class="prediction-section">

                <h3>

                    <i class="fa-solid fa-dove"></i>

                    Bird Species Identification
                    <small>(BirdNET)</small>

                </h3>

        `;


        birdnetPredictions.forEach(
            prediction => {

                const species =
                    prediction.species ||
                    'Unknown bird';


                const scientificName =
                    prediction.scientific_name ||
                    '';


                const confidence =
                    Number(
                        prediction.confidence ||
                        0
                    );


                const percentage =
                    Math.min(
                        100,
                        Math.max(
                            0,
                            confidence * 100
                        )
                    ).toFixed(2);


                html += `

                    <div class="prediction-card bird-prediction">

                        <div class="prediction-top">

                            <span class="prediction-label">

                                <i class="fa-solid fa-dove"></i>

                                ${escapeHTML(
                                    species
                                )}

                            </span>


                            <span class="confidence">

                                ${percentage}%

                            </span>

                        </div>


                        ${
                            scientificName
                                ? `

                                    <p>

                                        <strong>
                                            Scientific Name:
                                        </strong>

                                        <em>
                                            ${escapeHTML(
                                                scientificName
                                            )}
                                        </em>

                                    </p>

                                `
                                : ''
                        }


                        <p>

                            <strong>
                                AI Model:
                            </strong>

                            BirdNET

                        </p>


                        <div class="progress">

                            <div
                                class="progress-bar"
                                style="width:${percentage}%"
                            ></div>

                        </div>

                    </div>

                `;

            }
        );


        html += `

            </div>

        `;

    }


    /* =========================
       NO RESULTS
    ========================= */

    if (
        !yamnetPredictions.length &&
        !birdnetPredictions.length
    ) {

        html = `

            <div class="empty-state">

                <i class="fa-solid fa-circle-exclamation"></i>

                <p>

                    No wildlife sounds or bird species
                    were detected in this audio.

                </p>

            </div>

        `;

    }


    /* =========================
       DISPLAY RESULTS
    ========================= */

    $('#predictionList').innerHTML =
        html;


    /* =========================
       MAKE RESULTS VISIBLE
    ========================= */

    const resultsPanel =
        $('#resultsPanel');


    if (resultsPanel) {

        resultsPanel.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

    }

}


/* =========================
   LOAD AUDIO HISTORY
========================= */

async function loadHistory() {

    try {

        const records =
            await request(
                '/audio/'
            );


        const list =
            Array.isArray(records)

                ? records

                : [];


        if (
            !list.length
        ) {

            $('#historyList').innerHTML = `

                <p class="empty-state">

                    No audio analyses yet.

                </p>

            `;

            return;

        }


        $('#historyList').innerHTML =

            list
                .slice()
                .reverse()
                .map(
                    record => {

                        /* =========================
                           YAMNET
                        ========================= */

                        const yamnet =
                            record.predictions ||
                            [];


                        /* =========================
                           BIRDNET
                        ========================= */

                        const birdnet =
                            record.bird_predictions ||
                            [];


                        /* =========================
                           TOP RESULT
                        ========================= */

                        const topYamnet =
                            yamnet[0];


                        const topBird =
                            birdnet[0];


                        return `

                            <div
                                class="history-item"
                            >

                                <div
                                    class="history-info"
                                >

                                    <strong>

                                        <i
                                            class="fa-solid fa-file-audio"
                                        ></i>

                                        ${escapeHTML(
                                            record.filename ||
                                            'Audio file'
                                        )}

                                    </strong>


                                    <small>

                                        ${
                                            record.analysis_status ||
                                            'Completed'
                                        }

                                    </small>

                                </div>


                                <div
                                    class="history-predictions"
                                >

                                    ${
                                        topBird

                                            ? `Bird:
                                                ${escapeHTML(
                                                    topBird.species ||
                                                    'Unknown'
                                                )}`

                                            : topYamnet

                                                ? `Sound:
                                                    ${escapeHTML(
                                                        topYamnet.label ||
                                                        'Unknown'
                                                    )}`

                                                : 'No prediction'

                                    }

                                </div>


                                <button

                                    class="delete-btn"

                                    data-delete="${
                                        record._id ||
                                        record.id
                                    }"

                                    title="Delete"

                                >

                                    <i
                                        class="fa-solid fa-trash"
                                    ></i>

                                </button>


                            </div>

                        `;

                    }

                )

                .join('');


        /* =========================
           DELETE BUTTONS
        ========================= */

        document
            .querySelectorAll(
                '[data-delete]'
            )
            .forEach(
                button => {

                    button.onclick =
                        () => deleteAudio(
                            button.dataset.delete
                        );

                }
            );


    }

    catch (error) {

        console.error(
            'History loading error:',
            error
        );


        $('#historyList').innerHTML = `

            <p class="empty-state">

                ${escapeHTML(
                    error.message
                )}

            </p>

        `;

    }

}


/* =========================
   DELETE AUDIO
========================= */

async function deleteAudio(
    audioId
) {

    if (
        !confirm(
            'Delete this audio analysis?'
        )
    ) {

        return;

    }


    try {

        await request(

            `/audio/${audioId}`,

            {
                method:
                    'DELETE'
            }

        );


        await loadHistory();


    }

    catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(
    value = ''
) {

    return String(
        value
    )
        .replace(

            /[&<>'"]/g,

            char => ({

                '&':
                    '&amp;',

                '<':
                    '&lt;',

                '>':
                    '&gt;',

                "'":
                    '&#39;',

                '"':
                    '&quot;'

            }[char])

        );

}


/* =========================
   MENU
========================= */

$('#menuButton').onclick =
    () => {

        $('#sidebar')
            .classList
            .toggle(
                'open'
            );

    };


/* =========================
   LOGOUT
========================= */

document
    .querySelectorAll(
        '[data-logout]'
    )
    .forEach(
        button => {

            button.onclick =
                event => {

                    event.preventDefault();


                    localStorage.removeItem(
                        'wpis_token'
                    );


                    location.href =
                        'login.html';

                };

        }
    );


/* =========================
   REFRESH HISTORY
========================= */

$('#refreshHistory').onclick =
    loadHistory;


/* =========================
   INITIAL LOAD
========================= */

loadHistory();