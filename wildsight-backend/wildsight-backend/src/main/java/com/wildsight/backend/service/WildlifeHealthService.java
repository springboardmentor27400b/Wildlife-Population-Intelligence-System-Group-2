package com.wildsight.backend.service;

import com.wildsight.backend.dto.WildlifeHealthDashboardResponse;
import com.wildsight.backend.dto.WildlifeHealthResponse;

public interface WildlifeHealthService {


    WildlifeHealthResponse calculateHealthScore();


    WildlifeHealthDashboardResponse getDashboard();

}