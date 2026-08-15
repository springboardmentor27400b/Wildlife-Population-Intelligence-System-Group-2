package com.wildsight.backend.service;


import com.wildsight.backend.dto.AIPredictionDashboardResponse;

import java.util.List;


public interface AIPredictionDashboardService {


List<AIPredictionDashboardResponse> getRecentPredictions();

}