export interface ConservationPriority{

    biodiversityScore:number;

    averageGrowthRate:number;

    increasingSpecies:number;

    stableSpecies:number;

    decreasingSpecies:number;

    conservationPriority:string;

    reason:string;

    recommendedAction:string;

}

export interface HabitatRestoration{

    averageHabitatQuality:number;

    totalHabitats:number;

    restorationPriority:string;

    restorationRecommendation:string;

    expectedOutcome:string;

}

export interface ProtectionStrategy{

    biodiversityScore:number;

    habitatQuality:number;

    averageGrowthRate:number;

    protectionLevel:string;

    strategy:string;

    expectedImpact:string;

}

export interface MonitoringOptimization{

    recommendedSurveyFrequency:number;

    monitoringLevel:string;

    cameraTrapRecommendation:string;

    droneMonitoring:string;

    aiRecommendation:string;

}

export interface ResourceAllocation{

    budgetPriority:string;

    fieldStaffRequired:number;

    cameraTrapsRequired:number;

    dronesRequired:number;

    deploymentStrategy:string;

}

export interface ConservationDashboard{

    priority:ConservationPriority;

    restoration:HabitatRestoration;

    protection:ProtectionStrategy;

    monitoring:MonitoringOptimization;

    resources:ResourceAllocation;

}