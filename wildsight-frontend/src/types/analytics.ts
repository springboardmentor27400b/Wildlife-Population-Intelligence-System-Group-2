export interface DashboardSummary {
    totalObservations: number;
    totalImages: number;
    totalAudio: number;
    totalSpecies: number;
    totalAnimalsDetected: number;

    endangeredSpecies: number;

    birdDetections: number;
    mammalDetections: number;
    reptileDetections: number;
    amphibianDetections: number;
    insectDetections: number;
}

export interface SpeciesDistribution {
    species: string;
    count: number;
}

export interface CategoryDistribution {
    category: string;
    count: number;
}