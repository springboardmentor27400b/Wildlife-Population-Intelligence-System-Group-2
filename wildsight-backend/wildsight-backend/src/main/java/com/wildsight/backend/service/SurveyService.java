package com.wildsight.backend.service;

import com.wildsight.backend.dto.SurveyDashboardResponse;
import com.wildsight.backend.dto.SurveyRequest;
import com.wildsight.backend.dto.SurveyResponse;

import java.util.List;

public interface SurveyService {


    SurveyResponse createSurvey(SurveyRequest request);


    List<SurveyResponse> getAllSurveys();


    SurveyResponse getSurveyById(Long surveyId);


    SurveyResponse updateSurvey(
            Long surveyId,
            SurveyRequest request
    );


    void deleteSurvey(Long surveyId);


    SurveyDashboardResponse getDashboard();

}