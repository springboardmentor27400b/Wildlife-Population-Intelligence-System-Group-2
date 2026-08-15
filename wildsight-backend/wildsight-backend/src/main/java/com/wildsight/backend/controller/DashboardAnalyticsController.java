package com.wildsight.backend.controller;


import com.wildsight.backend.dto.BiodiversityDashboardResponse;
import com.wildsight.backend.dto.ConservationPriorityResponse;
import com.wildsight.backend.dto.HabitatDashboardResponse;
import com.wildsight.backend.dto.ThreatMonitoringResponse;
import com.wildsight.backend.dto.UserManagementResponse;
import com.wildsight.backend.dto.population.PopulationDashboardResponse;

import com.wildsight.backend.service.DashboardAnalyticsService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DashboardAnalyticsController {



    private final DashboardAnalyticsService dashboardService;



    // =====================================================
    // POPULATION ANALYTICS
    // =====================================================

    @GetMapping("/population")
    public ResponseEntity<PopulationDashboardResponse>
    getPopulationAnalytics(){


        return ResponseEntity.ok(
                dashboardService
                .getPopulationAnalytics()
        );

    }

    // =====================================================
    // BIODIVERSITY ANALYTICS
    // =====================================================

    @GetMapping("/biodiversity")
    public ResponseEntity<BiodiversityDashboardResponse>
    getBiodiversityAnalytics(){


        return ResponseEntity.ok(
                dashboardService
                .getBiodiversityAnalytics()
        );

    }





    // =====================================================
    // HABITAT ANALYTICS
    // =====================================================

    @GetMapping("/habitat")
    public ResponseEntity<HabitatDashboardResponse>
    getHabitatAnalytics(){


        return ResponseEntity.ok(
                dashboardService
                .getHabitatAnalytics()
        );

    }
    @GetMapping("/users")
public ResponseEntity<UserManagementResponse>
getUsers(){

    return ResponseEntity.ok(
        dashboardService.getUserManagement()
    );

}
@GetMapping("/threat-monitoring")
public ResponseEntity<ThreatMonitoringResponse>
getThreatMonitoring(){


return ResponseEntity.ok(
        dashboardService
        .getThreatMonitoring()
);


}
@GetMapping("/conservation-priority")
public ResponseEntity<ConservationPriorityResponse>
getConservationPriority(){


    return ResponseEntity.ok(
        dashboardService
        .getConservationPriority()
    );

}

}