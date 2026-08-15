export interface PopulationDashboard {

    totalPopulation: number;

    speciesRichness: number;

    populationDensity: number;

    growthRate: number;

    monitoringSites: number;

}

export interface PopulationTrend {

    month: string;

    population: number;

}

export interface PopulationDistribution {

    species: string;

    location: string;

    population: number;

}

export interface Migration {

    species: string;

    fromLocation: string;

    toLocation: string;

}