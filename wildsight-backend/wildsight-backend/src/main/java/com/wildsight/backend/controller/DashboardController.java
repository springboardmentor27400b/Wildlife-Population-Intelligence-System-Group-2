package com.wildsight.backend.controller;

import com.wildsight.backend.dto.MapLocationResponse;
import com.wildsight.backend.dto.ThreatMonitoringResponse;
import com.wildsight.backend.service.DashboardService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;


    // =====================================================
    // MAP
    // =====================================================

    @GetMapping("/map")
    public ResponseEntity<List<MapLocationResponse>> getMap() {

        return ResponseEntity.ok(
                dashboardService.getMapLocations()
        );

    }


    // =====================================================
    // THREAT MONITORING
    // =====================================================

    @GetMapping("/threat")
    public ResponseEntity<ThreatMonitoringResponse> getThreatMonitoring() {

        return ResponseEntity.ok(
                dashboardService.getThreatMonitoring()
        );

    }

}