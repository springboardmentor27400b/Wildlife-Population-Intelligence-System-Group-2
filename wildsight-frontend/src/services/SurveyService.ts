import { api } from "./api";


export const getSurveyDashboard = async()=>{


    const response =
        await api.get(
            "/api/surveys/dashboard"
        );


    return response.data;

};



export const getAllSurveys = async()=>{


    const response =
        await api.get(
            "/api/surveys"
        );


    return response.data;

};