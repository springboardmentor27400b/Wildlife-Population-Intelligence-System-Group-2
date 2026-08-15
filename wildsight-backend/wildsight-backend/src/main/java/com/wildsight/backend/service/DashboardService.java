package com.wildsight.backend.service;

import com.wildsight.backend.dto.MapLocationResponse;
import com.wildsight.backend.dto.ThreatMonitoringResponse;

import java.util.List;

public interface DashboardService {

    List<MapLocationResponse> getMapLocations();

    ThreatMonitoringResponse getThreatMonitoring();

}