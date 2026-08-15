package com.wildsight.backend.service;


import com.wildsight.backend.dto.BiodiversityDashboardResponse;
import com.wildsight.backend.dto.ConservationPriorityResponse;
import com.wildsight.backend.dto.HabitatDashboardResponse;
import com.wildsight.backend.dto.ThreatMonitoringResponse;
import com.wildsight.backend.dto.UserManagementResponse;
import com.wildsight.backend.dto.population.PopulationDashboardResponse;


public interface DashboardAnalyticsService {


    PopulationDashboardResponse getPopulationAnalytics();


    BiodiversityDashboardResponse getBiodiversityAnalytics();


    HabitatDashboardResponse getHabitatAnalytics();

    UserManagementResponse getUserManagement();

    ThreatMonitoringResponse getThreatMonitoring();
    ConservationPriorityResponse getConservationPriority();

}