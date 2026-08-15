export interface SurveyDashboard {

    totalSurveys:number;

    activeSurveys:number;

    completedSurveys:number;

    pendingSurveys:number;

    forestSurveys:number;

    grasslandSurveys:number;

    wetlandSurveys:number;

    dominantHabitat:string;

}


export interface Survey {

    surveyId:number;

    userId:number;

    surveyName:string;

    description:string;

    habitatType:string;

    protectedArea:string;

    surveyDate:string;

    status:string;

    createdAt:string;

}