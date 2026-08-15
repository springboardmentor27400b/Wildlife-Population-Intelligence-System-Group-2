export interface BiodiversityDashboard {

    totalAssessments:number;

    totalSpecies:number;

    averageSpeciesDiversity:number;

    averageHabitatQuality:number;

    averageEcosystemHealth:number;

    averageOverallScore:number;

    healthyCount:number;

    vulnerableCount:number;

    criticalCount:number;

}


export interface SpeciesDiversity {

    speciesName:string;

    diversityScore:number;

}


export interface HabitatHealth {

    habitatName:string;

    qualityScore:number;

}


export interface EcosystemMonitoring {

    ecosystemHealth:number;

    status:string;

}