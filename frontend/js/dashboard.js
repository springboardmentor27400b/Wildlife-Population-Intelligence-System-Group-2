const API_BASE =
    localStorage.getItem('wpis_api_base') ||
    'http://127.0.0.1:8000';


const token = () =>
    localStorage.getItem('wpis_token');


// ==========================================
// API HELPER
// ==========================================

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

        localStorage.removeItem(
            'wpis_token'
        );

        location.href =
            'login.html';

        return;

    }


    if (!response.ok) {

        throw new Error(
            'Could not load dashboard data.'
        );

    }


    return response.json();

}



// ==========================================
// MOBILE MENU
// ==========================================

document
    .querySelector('#menuButton')
    .onclick = () => {

        document
            .querySelector('#sidebar')
            .classList
            .toggle('open');

    };



// ==========================================
// LOGOUT
// ==========================================

document
    .querySelectorAll('[data-logout]')
    .forEach(button => {

        button.onclick = event => {

            event.preventDefault();

            localStorage.removeItem(
                'wpis_token'
            );

            location.href =
                'login.html';

        };

    });



// ==========================================
// DISPLAY STATISTICS
// ==========================================

function displayStatistics(
    elementId,
    statistics
) {

    const element =
        document.querySelector(
            `#${elementId}`
        );

    if (!element) return;


    // Classes that should not appear
    // in the wildlife species dashboard.
    const excludedClasses = new Set([
        'car',
        'truck',
        'bus',
        'motorcycle',
        'bicycle',
        'airplane',
        'boat',
        'traffic light',
        'stop sign',
        'parking meter',
        'bench'
    ]);


    if (
        !statistics ||
        Object.keys(statistics).length === 0
    ) {

        element.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-paw"></i>
                <span>No species detected yet.</span>
            </div>
        `;

        return;

    }


    const filteredStatistics =
        Object.entries(statistics)
            .filter(
                ([name]) =>
                    !excludedClasses.has(
                        name.toLowerCase().trim()
                    )
            )
            .sort(
                (a, b) => b[1] - a[1]
            );


    if (filteredStatistics.length === 0) {

        element.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-paw"></i>
                <span>No wildlife species available.</span>
            </div>
        `;

        return;

    }


    element.innerHTML =
        filteredStatistics
            .map(
                ([name, count], index) => `

                    <div class="species-row">

                        <div class="species-info">

                            <span class="species-rank">
                                ${index + 1}
                            </span>

                            <span class="species-name">
                                ${formatSpeciesName(name)}
                            </span>

                        </div>

                        <strong class="species-count">
                            ${count}
                        </strong>

                    </div>

                `
            )
            .join('');

}

// ==========================================
// FORMAT SPECIES NAME
// ==========================================

function formatSpeciesName(name) {

    return String(name)
        .trim()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}
// ==========================================
// AI INTELLIGENCE STATISTICS
// ==========================================

function displayIntelligenceStatistics(
    elementId,
    statistics,
    type
) {

    const element =
        document.querySelector(
            `#${elementId}`
        );

    if (!element) return;


    if (
        !statistics ||
        Object.keys(statistics).length === 0
    ) {

        const emptyIcons = {
            behavior: 'fa-brain',
            audio: 'fa-microphone',
            bird: 'fa-dove'
        };

        const emptyMessages = {
            behavior: 'No behavior analysis available.',
            audio: 'No audio detections available.',
            bird: 'No bird detections available.'
        };

        element.innerHTML = `
            <div class="ai-empty-state">

                <i class="fa-solid ${emptyIcons[type]}"></i>

                <span>
                    ${emptyMessages[type]}
                </span>

            </div>
        `;

        return;
    }


    const sorted =
        Object.entries(statistics)
            .sort((a, b) => b[1] - a[1]);


    element.innerHTML =
        sorted
            .map(([name, count], index) => {

                const icons = {

                    behavior: 'fa-brain',

                    audio: 'fa-volume-high',

                    bird: 'fa-dove'

                };

                return `

                    <div class="ai-stat-row">

                        <div class="ai-stat-info">

                            <span class="ai-stat-icon">

                                <i class="fa-solid ${icons[type]}"></i>

                            </span>

                            <div>

                                <span class="ai-stat-name">
                                    ${formatSpeciesName(name)}
                                </span>

                                <small>
                                    ${getIntelligenceLabel(type)}
                                </small>

                            </div>

                        </div>


                        <div class="ai-stat-value">

                            ${count}

                        </div>

                    </div>

                `;

            })
            .join('');

}


// ==========================================
// AI INTELLIGENCE LABEL
// ==========================================

function getIntelligenceLabel(type) {

    if (type === 'behavior') {
        return 'Behavior observation';
    }

    if (type === 'audio') {
        return 'YAMNet detection';
    }

    if (type === 'bird') {
        return 'BirdNET detection';
    }

    return 'AI detection';

}


// ==========================================
// LOAD AI ANALYTICS SUMMARY
// ==========================================

async function loadAnalyticsSummary() {

    try {

        const overview =
            await api('/population/overview');

        const biodiversity =
            await api('/population/biodiversity/index');

        document.querySelector('#totalPopulation').textContent =
            overview.total_population ?? 0;

        document.querySelector('#speciesRichness').textContent =
            overview.species_richness ?? 0;

        document.querySelector('#biodiversityScore').textContent =
        biodiversity.shannon_diversity_index
        ? biodiversity.shannon_diversity_index.toFixed(2)
        : "0.00";

    } catch (error) {

        console.error(error);

    }


    // Habitat score (optional)

    try {

        const habitat =
        await api('/population/biodiversity/habitat-health');

        document.querySelector('#habitatScore').textContent =
            habitat.overall_habitat_health_score ?? "--";

    }

    catch {

        document.querySelector('#habitatScore').textContent = "--";

    }

}


// ==========================================
// LOAD DASHBOARD
// ==========================================

(async () => {

    try {

        const data =
            await api(
                '/dashboard/summary'
            );



// ==================================
// RESEARCH OVERVIEW
// ==================================

document
    .querySelector('#totalWildlife')
    .textContent =
    data.total_wildlife_records || 0;


// ==================================
// SYSTEM OVERVIEW CHART
// ==================================

const chartValues = [
    data.total_users || 0,
    data.total_monitoring_sites || 0,
    data.total_wildlife_records || 0,
    data.total_images || 0,
    data.total_animals_detected || 0,
    data.total_audio_files || 0
];

const chartLabels = [
    'Users',
    'Sites',
    'Wildlife Records',
    'Images',
    'Animals',
    'Audio'
];

// Find the largest value
const maxValue = Math.max(...chartValues, 1);

// Convert values to percentages relative to the largest metric
const chartPercentages = chartValues.map(value =>
    value === 0
        ? 0
        : Math.round((value / maxValue) * 100)
);

new Chart(
    document.querySelector('#summaryChart'),
    {
        type: 'bar',

        data: {

            labels: [
                'Users',
                'Sites',
                'Wildlife',
                'Images',
                'Animals',
                'Audio'
            ],

            datasets: [

                {
                    label: 'System Activity',

                    data: chartValues,

                    backgroundColor: [
                        '#43a06f',
                        '#2f8b5f',
                        '#6fae8a',
                        '#8fc7a5',
                        '#176344',
                        '#b9dc79'
                    ],

                    borderWidth: 0,

                    borderRadius: 8,

                    borderSkipped: false,

                    barPercentage: 0.65,

                    categoryPercentage: 0.72
                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: {
                duration: 700,
                easing: 'easeOutQuart'
            },

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    backgroundColor: '#143c2c',

                    titleColor: '#ffffff',

                    bodyColor: '#dce9e2',

                    padding: 12,

                    cornerRadius: 10,

                    displayColors: false,

                    callbacks: {

                        label: function(context) {

                            return ` ${context.parsed.y} records`;

                        }

                    }

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    border: {
                        display: false
                    },

                    grid: {
                        color: '#edf1ee',
                        drawTicks: false
                    },

                    ticks: {

                        color: '#7a8d83',

                        padding: 8,

                        precision: 0,

                        font: {
                            size: 11,
                            weight: '600'
                        }

                    }

                },

                x: {

                    border: {
                        display: false
                    },

                    grid: {
                        display: false
                    },

                    ticks: {

                        color: '#526c5f',

                        padding: 8,

                        font: {
                            size: 11,
                            weight: '700'
                        }

                    }

                }

            }

        }

    }
);

        // ==================================
        // SPECIES
        // ==================================

        displayStatistics(

            'speciesStatistics',

            data.species_statistics

        );



        // ==================================
        // BEHAVIOR
        // ==================================

        displayIntelligenceStatistics(
            'behaviorStatistics',
            data.behavior_statistics,
            'behavior'
        );


        // ==================================
        // YAMNET
        // ==================================

        displayIntelligenceStatistics(
            'audioStatistics',
            data.audio_statistics,
            'audio'
        );



        // ==================================
        // BIRDNET
        // ==================================

        displayIntelligenceStatistics(
            'birdnetStatistics',
            data.birdnet_statistics,
            'bird'
        );



        // ==================================
        // RECENT IMAGE UPLOADS
        // ==================================

        const recentImages =
            document.querySelector(
                '#recentImages'
            );


        const images =
            data.recent_image_uploads || [];


        if (images.length === 0) {

            recentImages.innerHTML =
                '<span style="color:#6c7d76">No image uploads yet.</span>';

        } else {

            recentImages.innerHTML =

                images.map(
                    image => `

                    <div>

                        <span>
                            ${image.filename}
                        </span>

                        <small>
                            ${image.animal_count}
                            animals
                        </small>

                    </div>

                    `
                ).join('');

        }



        // ==================================
        // RECENT AUDIO UPLOADS
        // ==================================

        const recentAudio =
            document.querySelector(
                '#recentAudio'
            );


        const audio =
            data.recent_audio_uploads || [];


        if (audio.length === 0) {

            recentAudio.innerHTML =
                '<span style="color:#6c7d76">No audio uploads yet.</span>';

        } else {

            recentAudio.innerHTML =

                audio.map(
                    item => `

                    <div>

                        <span>
                            ${item.filename}
                        </span>

                        <small>
                            ${item.analysis_status}
                        </small>

                    </div>

                    `
                ).join('');

        }


// ==========================================
// RECENT WILDLIFE
// ==========================================

try {

    const records = await api('/wildlife');

    const list =
        Array.isArray(records)
            ? records
            : records.items || [];

    const recentWildlife =
        document.querySelector('#recentWildlife');


    if (!list.length) {

        recentWildlife.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-paw"></i>

                <strong>
                    No wildlife records yet
                </strong>

                <span>
                    Detected wildlife will appear here.
                </span>

            </div>

        `;

    } else {

        recentWildlife.innerHTML =

            list
                .slice(0, 5)
                .map(item => {

                    const species =
                        item.species_name ||
                        item.species ||
                        item.name ||
                        'Unknown species';


                    const location =
                        item.location ||
                        'Location unavailable';


                    const status =
                        item.conservation_status ||
                        'Not Evaluated';


                    const count =
                        item.count ??
                        item.population ??
                        1;


                    let statusClass = 'status-neutral';


                    const statusLower =
                        status.toLowerCase();


                    if (
                        statusLower.includes('endangered') ||
                        statusLower.includes('critical')
                    ) {

                        statusClass = 'status-danger';

                    } else if (
                        statusLower.includes('vulnerable') ||
                        statusLower.includes('near')
                    ) {

                        statusClass = 'status-warning';

                    } else if (
                        statusLower.includes('least concern')
                    ) {

                        statusClass = 'status-safe';

                    }


                    return `

                        <div class="wildlife-feed-item">

                            <div class="wildlife-avatar">

                                <i class="fa-solid fa-paw"></i>

                            </div>


                            <div class="wildlife-info">

                                <strong>
                                    ${species}
                                </strong>

                                <span>

                                    <i class="fa-solid fa-location-dot"></i>

                                    ${location}

                                </span>

                            </div>


                            <div class="wildlife-meta">

                                <strong>
                                    ${count}
                                </strong>

                                <small>
                                    detected
                                </small>

                                <span class="wildlife-status ${statusClass}">
                                    ${status}
                                </span>

                            </div>

                        </div>

                    `;

                })
                .join('');

    }


} catch (error) {

    console.error(
        'Recent wildlife error:',
        error
    );


    document.querySelector(
        '#recentWildlife'
    ).innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <strong>
                Wildlife data unavailable
            </strong>

            <span>
                Unable to load recent wildlife records.
            </span>

        </div>

    `;
}
    } catch (error) {

        console.error(
            'Dashboard error:',
            error
        );

    }

})();
loadAnalyticsSummary();