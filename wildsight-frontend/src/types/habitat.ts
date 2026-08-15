export interface HabitatDashboard {

    totalHabitats:number;

    averageHabitatQuality:number;

    averageSuitability:number;

    healthyHabitats:number;

    degradedHabitats:number;

    criticalHabitats:number;

}

export interface HabitatClassification{

    totalHabitats:number;

    forestHabitats:number;

    grasslandHabitats:number;

    wetlandHabitats:number;

    mountainHabitats:number;

    riverHabitats:number;

    dominantHabitat:string;

}

export interface HabitatDegradation{

    averageDegradationLevel:number;

    lowRiskHabitats:number;

    moderateRiskHabitats:number;

    highRiskHabitats:number;

    criticalHabitats:number;

    overallStatus:string;

}

export interface VegetationAnalysis{

    averageVegetationDensity:number;

    dominantVegetationType:string;

    vegetationStatus:string;

}

export interface EnvironmentalMonitoring{

    averageTemperature:number;

    averageHumidity:number;

    averageRainfall:number;

    averageWaterQuality:number;

    averageAirQuality:number;

    environmentalStatus:string;

}

export interface HabitatSuitability{

    averageSuitabilityScore:number;

    highlySuitableHabitats:number;

    moderatelySuitableHabitats:number;

    unsuitableHabitats:number;

    suitabilityStatus:string;

}