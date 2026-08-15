package com.wildsight.backend.serviceImpl;


import com.wildsight.backend.dto.BiodiversityDashboardResponse;
import com.wildsight.backend.dto.HabitatDashboardResponse;
import com.wildsight.backend.dto.MapLocationResponse;
import com.wildsight.backend.dto.UserManagementResponse;
import com.wildsight.backend.dto.population.PopulationDashboardResponse;

import com.wildsight.backend.repository.*;

import com.wildsight.backend.service.DashboardAnalyticsService;
import com.wildsight.backend.service.DashboardService;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.wildsight.backend.dto.ThreatMonitoringResponse;
import com.wildsight.backend.dto.ConservationPriorityResponse;
@Service
@RequiredArgsConstructor
public class DashboardAnalyticsServiceImpl 
        implements DashboardAnalyticsService {

    private final UserRepository userRepository;

    private final PopulationEstimateRepository populationRepository;

    private final BiodiversityScoreRepository biodiversityRepository;

    private final HabitatRepository habitatRepository;

    private final ConservationLocationRepository locationRepository;
    private final DashboardService dashboardService;
    // =====================================================
    // POPULATION ANALYTICS
    // =====================================================

    @Override
    public PopulationDashboardResponse getPopulationAnalytics(){


        Long totalPopulation =
                populationRepository
                .getTotalEstimatedPopulation();



        Long speciesRichness =
                populationRepository
                .getSpeciesCount();



        Double density =
                populationRepository
                .getAverageDensity()
                != null
                ?
                populationRepository
                .getAverageDensity()
                .doubleValue()
                :
                0.0;



        Double growthRate =
                populationRepository
                .getAverageGrowthRate()
                != null
                ?
                populationRepository
                .getAverageGrowthRate()
                .doubleValue()
                :
                0.0;



        Long monitoringSites =
                locationRepository.count();



        return PopulationDashboardResponse.builder()

                .totalPopulation(
                        totalPopulation != null
                        ?
                        totalPopulation
                        :
                        0L
                )

                .speciesRichness(
                        speciesRichness != null
                        ?
                        speciesRichness
                        :
                        0L
                )

                .populationDensity(
                        density
                )

                .growthRate(
                        growthRate
                )

                .monitoringSites(
                        monitoringSites
                )

                .build();

    }





    // =====================================================
    // BIODIVERSITY ANALYTICS
    // =====================================================


    @Override
    public BiodiversityDashboardResponse 
    getBiodiversityAnalytics(){



        Long totalAssessments =
                biodiversityRepository.count();



        Integer totalSpecies =
                biodiversityRepository
                .getTotalSpeciesCount();



        Double speciesDiversity =
                biodiversityRepository
                .getAverageSpeciesDiversityScore();



        Double habitatQuality =
                biodiversityRepository
                .getAverageHabitatQuality();



        Double ecosystemHealth =
                biodiversityRepository
                .getAverageEcosystemHealth()
                != null
                ?
                biodiversityRepository
                .getAverageEcosystemHealth()
                .doubleValue()
                :
                0.0;



        Double overallScore =
                biodiversityRepository
                .getAverageOverallScore()
                != null
                ?
                biodiversityRepository
                .getAverageOverallScore()
                .doubleValue()
                :
                0.0;




        Long healthy =
                biodiversityRepository
                .countByHealthStatus(
                        "Healthy"
                );



        Long vulnerable =
                biodiversityRepository
                .countByHealthStatus(
                        "Vulnerable"
                );



        Long critical =
                biodiversityRepository
                .countByHealthStatus(
                        "Critical"
                );




        return BiodiversityDashboardResponse.builder()

                .totalAssessments(
                        totalAssessments
                )

                .totalSpecies(
                        totalSpecies
                )

                .averageSpeciesDiversity(
                        speciesDiversity
                )

                .averageHabitatQuality(
                        habitatQuality
                )

                .averageEcosystemHealth(
                        ecosystemHealth
                )

                .averageOverallScore(
                        overallScore
                )

                .healthyCount(
                        healthy
                )

                .vulnerableCount(
                        vulnerable
                )

                .criticalCount(
                        critical
                )

                .build();


    }





    // =====================================================
    // HABITAT ANALYTICS
    // =====================================================


    @Override
    public HabitatDashboardResponse 
    getHabitatAnalytics(){



        Long totalHabitats =
                habitatRepository.count();



        Double quality =
                habitatRepository
                .getAverageHabitatQualityScore();



        Double suitability =
                habitatRepository
                .getAverageSuitabilityScore();



        Long healthy =
                habitatRepository
                .countHealthyHabitats();



        Long degraded =
                habitatRepository
                .countDegradedHabitats();



        Long critical =
                habitatRepository
                .countCriticalHabitats();





        return HabitatDashboardResponse.builder()


                .totalHabitats(
                        totalHabitats
                )

                .averageHabitatQuality(
                        quality
                )

                .averageSuitability(
                        suitability
                )

                .healthyHabitats(
                        healthy
                )

                .degradedHabitats(
                        degraded
                )

                .criticalHabitats(
                        critical
                )

                .build();

    }
    @Override
public UserManagementResponse getUserManagement(){


    return UserManagementResponse.builder()

            .totalUsers(
                userRepository.count()
            )


            .admins(
                userRepository.countAdmins()
            )


            .researchers(
                userRepository.countResearchers()
            )


            .forestOfficers(
                userRepository.countForestOfficers()
            )


            .volunteers(
                userRepository.countVolunteers()
            )


            .build();

}@Override
public ThreatMonitoringResponse getThreatMonitoring(){


    List<MapLocationResponse> locations =
            dashboardService.getMapLocations();



    long high =
            locations.stream()
            .filter(x ->
                    "HIGH".equalsIgnoreCase(
                            x.getThreatLevel()
                    )
            )
            .count();



    long moderate =
            locations.stream()
            .filter(x ->
                    "MODERATE".equalsIgnoreCase(
                            x.getThreatLevel()
                    )
            )
            .count();



    long low =
            locations.stream()
            .filter(x ->
                    "LOW".equalsIgnoreCase(
                            x.getThreatLevel()
                    )
            )
            .count();



    double health =
            locations.stream()
            .filter(x ->
                    x.getHealthScore()!=null
            )
            .mapToDouble(
                    MapLocationResponse::getHealthScore
            )
            .average()
            .orElse(0);



    String criticalArea =
            locations.stream()
            .filter(x ->
                    "HIGH".equalsIgnoreCase(
                            x.getThreatLevel()
                    )
            )
            .map(
                    MapLocationResponse::getName
            )
            .findFirst()
            .orElse(
                    "No Critical Area"
            );



    return ThreatMonitoringResponse.builder()

            .totalLocations(
                    (long)locations.size()
            )

            .highRisk(high)

            .moderateRisk(moderate)

            .lowRisk(low)

            .averageHealthScore(
                    health
            )

            .criticalArea(
                    criticalArea
            )

            .build();

}
@Override
public ConservationPriorityResponse getConservationPriority(){


    Double biodiversity =
            biodiversityRepository
            .getAverageOverallScore()
            != null
            ?
            biodiversityRepository
            .getAverageOverallScore()
            .doubleValue()
            :
            0.0;



    Double growth =
            populationRepository
            .getAverageGrowthRate()
            != null
            ?
            populationRepository
            .getAverageGrowthRate()
            .doubleValue()
            :
            0.0;



    Long increasing =
            populationRepository
            .countIncreasingSpecies();



    Long stable =
            populationRepository
            .countStableSpecies();



    Long decreasing =
            populationRepository
            .countDecreasingSpecies();



    String priority;

    String reason;

    String action;



    if(decreasing > increasing)
    {

        priority="HIGH";

        reason=
        "Species population decline detected";

        action=
        "Immediate habitat restoration and protection required";

    }

    else if(biodiversity < 70)
    {

        priority="MEDIUM";

        reason=
        "Biodiversity index needs improvement";

        action=
        "Increase conservation monitoring";

    }

    else
    {

        priority="LOW";

        reason=
        "Ecosystem is stable";

        action=
        "Continue regular monitoring";

    }



    return ConservationPriorityResponse.builder()

            .biodiversityScore(
                biodiversity
            )

            .averageGrowthRate(
                growth
            )

            .increasingSpecies(
                increasing
            )

            .stableSpecies(
                stable
            )

            .decreasingSpecies(
                decreasing
            )

            .conservationPriority(
                priority
            )

            .reason(
                reason
            )

            .recommendedAction(
                action
            )

            .build();

}
}