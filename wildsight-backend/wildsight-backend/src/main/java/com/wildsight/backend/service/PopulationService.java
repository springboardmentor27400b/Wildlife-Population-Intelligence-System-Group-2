package com.wildsight.backend.service;

import com.wildsight.backend.dto.population.*;

import java.util.List;

public interface PopulationService {

    PopulationDashboardResponse getDashboard();

    List<PopulationTrendResponse> getPopulationTrend();

    List<PopulationDistributionResponse> getPopulationDistribution();

    List<MigrationResponse> getMigrationAnalysis();

}