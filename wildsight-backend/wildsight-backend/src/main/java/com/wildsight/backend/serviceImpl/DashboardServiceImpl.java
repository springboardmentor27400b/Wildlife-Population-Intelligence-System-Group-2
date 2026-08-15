package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.LocationIntelligenceResponse;
import com.wildsight.backend.dto.MapLocationResponse;
import com.wildsight.backend.dto.ThreatMonitoringResponse;

import com.wildsight.backend.entity.ConservationLocation;

import com.wildsight.backend.repository.ConservationLocationRepository;

import com.wildsight.backend.service.DashboardService;
import com.wildsight.backend.service.LocationIntelligenceService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl
        implements DashboardService {


    private final ConservationLocationRepository locationRepository;

    private final LocationIntelligenceService locationService;


    // =====================================================
    // MAP LOCATIONS
    // =====================================================

    @Override
    public List<MapLocationResponse> getMapLocations() {

        return locationRepository.findAll()

                .stream()

                .map(location -> {

                    LocationIntelligenceResponse intelligence;

                    try {

                        intelligence =
                                locationService.getLocationDetails(
                                        location.getLocationId()
                                );

                    } catch (Exception e) {

                        e.printStackTrace();

                        intelligence = null;

                    }


                    return MapLocationResponse.builder()

                            .id(
                                    location.getLocationId()
                            )

                            .name(
                                    location.getLocationName()
                            )

                            .latitude(
                                    location.getLatitude()
                            )

                            .longitude(
                                    location.getLongitude()
                            )

                            .type(
                                    location.getLocationType()
                            )

                            .state(
                                    location.getState()
                            )

                            .healthScore(

                                    intelligence != null
                                            ? intelligence.getHealthScore()
                                            : 0.0

                            )

                            .speciesCount(

                                    intelligence != null
                                            ? intelligence.getSpeciesCount()
                                            : 0L

                            )

                            .population(

                                    intelligence != null
                                            ? intelligence.getPopulation()
                                            : 0L

                            )

                            .biodiversityScore(

                                    intelligence != null
                                            ? intelligence.getBiodiversityScore()
                                            : 0.0

                            )

                            .habitatScore(

                                    intelligence != null
                                            ? intelligence.getHabitatScore()
                                            : 0.0

                            )

                            .conservationStatus(

                                    intelligence != null
                                            ? intelligence.getConservationStatus()
                                            : "Unknown"

                            )

                            .threatLevel(

                                    intelligence != null
                                            ? intelligence.getThreatLevel()
                                            : "Unknown"

                            )

                            .recommendation(

                                    intelligence != null
                                            ? intelligence.getRecommendation()
                                            : "No recommendation available"

                            )

                            .build();

                })

                .toList();

    }


    // =====================================================
    // THREAT MONITORING
    // =====================================================

    @Override
    public ThreatMonitoringResponse getThreatMonitoring() {


        List<ConservationLocation> locations =
                locationRepository.findAll();


        long totalLocations =
                locations.size();


        long highRisk = 0;

        long moderateRisk = 0;

        long lowRisk = 0;


        double totalHealthScore = 0.0;

        int healthScoreCount = 0;


        String criticalArea = "No critical area";


        double highestThreatScore = -1;


        for (ConservationLocation location : locations) {


            try {


                LocationIntelligenceResponse intelligence =
                        locationService.getLocationDetails(
                                location.getLocationId()
                        );


                if (intelligence == null) {
                    continue;
                }


                // =================================================
                // THREAT LEVEL
                // =================================================

                String threatLevel =
                        intelligence.getThreatLevel();


                if (threatLevel != null) {


                    String threat =
                            threatLevel
                                    .trim()
                                    .toUpperCase();


                    if (
                            threat.equals("HIGH") ||
                            threat.equals("CRITICAL")
                    ) {

                        highRisk++;

                    }

                    else if (
                            threat.equals("MODERATE") ||
                            threat.equals("MEDIUM")
                    ) {

                        moderateRisk++;

                    }

                    else if (
                            threat.equals("LOW")
                    ) {

                        lowRisk++;

                    }


                    // =============================================
                    // HIGHEST THREAT LOCATION
                    // =============================================

                    double threatScore = 0;


                    if (threat.equals("CRITICAL")) {

                        threatScore = 4;

                    }

                    else if (threat.equals("HIGH")) {

                        threatScore = 3;

                    }

                    else if (
                            threat.equals("MODERATE") ||
                            threat.equals("MEDIUM")
                    ) {

                        threatScore = 2;

                    }

                    else if (threat.equals("LOW")) {

                        threatScore = 1;

                    }


                    if (threatScore > highestThreatScore) {

                        highestThreatScore =
                                threatScore;

                        criticalArea =
                                location.getLocationName();

                    }

                }


                // =================================================
                // HEALTH SCORE
                // =================================================

                Double healthScore =
                        intelligence.getHealthScore();


                if (healthScore != null) {

                    totalHealthScore += healthScore;

                    healthScoreCount++;

                }


            }

            catch (Exception e) {

                e.printStackTrace();

            }

        }


        // =====================================================
        // AVERAGE HEALTH
        // =====================================================

        double averageHealthScore = 0.0;


        if (healthScoreCount > 0) {

            averageHealthScore =
                    totalHealthScore /
                    healthScoreCount;

        }


        // =====================================================
        // RESPONSE
        // =====================================================

        return ThreatMonitoringResponse.builder()

                .totalLocations(
                        totalLocations
                )

                .highRisk(
                        highRisk
                )

                .moderateRisk(
                        moderateRisk
                )

                .lowRisk(
                        lowRisk
                )

                .averageHealthScore(
                        Math.round(
                                averageHealthScore * 100.0
                        ) / 100.0
                )

                .criticalArea(
                        criticalArea
                )

                .build();

    }

}