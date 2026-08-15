package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.ConservationRecommendationRequest;
import com.wildsight.backend.dto.ConservationRecommendationResponse;
import com.wildsight.backend.dto.HabitatRestorationResponse;
import com.wildsight.backend.dto.MonitoringOptimizationResponse;
import com.wildsight.backend.dto.ProtectionStrategyResponse;
import com.wildsight.backend.dto.ResourceAllocationResponse;
import com.wildsight.backend.entity.BiodiversityScore;
import com.wildsight.backend.entity.ConservationRecommendation;
import com.wildsight.backend.repository.BiodiversityScoreRepository;
import com.wildsight.backend.repository.ConservationRecommendationRepository;
import com.wildsight.backend.repository.HabitatRepository;
import com.wildsight.backend.repository.PopulationEstimateRepository;
import com.wildsight.backend.repository.PopulationHistoryRepository;
import com.wildsight.backend.service.ConservationRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

import com.wildsight.backend.dto.ConservationDashboardResponse;
import com.wildsight.backend.dto.ConservationPriorityResponse;
import com.wildsight.backend.entity.PopulationTrend;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConservationRecommendationServiceImpl
        implements ConservationRecommendationService {

    private final ConservationRecommendationRepository recommendationRepository;
    private final HabitatRepository habitatRepository;
    private final BiodiversityScoreRepository biodiversityScoreRepository;

    private final PopulationEstimateRepository populationEstimateRepository;

    private final PopulationHistoryRepository populationHistoryRepository;

    @Override
    public ConservationRecommendationResponse createRecommendation(
            ConservationRecommendationRequest request) {

        BiodiversityScore biodiversityScore = null;

        if (request.getBiodiversityId() != null) {

            biodiversityScore = biodiversityScoreRepository
                    .findById(request.getBiodiversityId())
                    .orElseThrow(() ->
                            new RuntimeException("Biodiversity Score not found"));
        }

        ConservationRecommendation recommendation =
                ConservationRecommendation.builder()
                        .biodiversityScore(biodiversityScore)
                        .priority(request.getPriority())
                        .recommendation(request.getRecommendation())
                        .build();

        recommendation = recommendationRepository.save(recommendation);

        return mapToResponse(recommendation);
    }

    @Override
    public List<ConservationRecommendationResponse> getAllRecommendations() {

        return recommendationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ConservationRecommendationResponse getRecommendationById(Long id) {

        ConservationRecommendation recommendation =
                recommendationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Recommendation not found"));

        return mapToResponse(recommendation);
    }

    @Override
    public ConservationRecommendationResponse updateRecommendation(
            Long id,
            ConservationRecommendationRequest request) {

        ConservationRecommendation recommendation =
                recommendationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Recommendation not found"));

        BiodiversityScore biodiversityScore = null;

        if (request.getBiodiversityId() != null) {

            biodiversityScore = biodiversityScoreRepository
                    .findById(request.getBiodiversityId())
                    .orElseThrow(() ->
                            new RuntimeException("Biodiversity Score not found"));
        }

        recommendation.setBiodiversityScore(biodiversityScore);
        recommendation.setPriority(request.getPriority());
        recommendation.setRecommendation(request.getRecommendation());

        recommendation = recommendationRepository.save(recommendation);

        return mapToResponse(recommendation);
    }

    @Override
    public void deleteRecommendation(Long id) {

        ConservationRecommendation recommendation =
                recommendationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Recommendation not found"));

        recommendationRepository.delete(recommendation);
    }
    @Override
public ConservationPriorityResponse getConservationPriority() {

    BigDecimal biodiversityValue =
            biodiversityScoreRepository.getAverageOverallScore();

    BigDecimal growthValue =
            populationEstimateRepository.getAverageGrowthRate();

    double biodiversity =
            biodiversityValue != null
                    ? biodiversityValue.doubleValue()
                    : 0.0;

    double growth =
            growthValue != null
                    ? growthValue.doubleValue()
                    : 0.0;

    Long increasing =
            populationHistoryRepository.countByTrend(
                    PopulationTrend.INCREASING);

    Long stable =
            populationHistoryRepository.countByTrend(
                    PopulationTrend.STABLE);

    Long decreasing =
            populationHistoryRepository.countByTrend(
                    PopulationTrend.DECLINING);

    increasing = increasing == null ? 0L : increasing;
    stable = stable == null ? 0L : stable;
    decreasing = decreasing == null ? 0L : decreasing;

    String priority;
    String reason;
    String action;

    if (biodiversity < 50 || decreasing > increasing) {

        priority = "HIGH";

        reason =
                "Wildlife population is declining and biodiversity is below the safe threshold.";

        action =
                "Increase habitat restoration, strengthen anti-poaching patrols and deploy additional AI monitoring.";

    }
    else if (biodiversity < 75) {

        priority = "MEDIUM";

        reason =
                "Moderate ecosystem condition detected.";

        action =
                "Increase periodic surveys and improve habitat management.";

    }
    else {

        priority = "LOW";

        reason =
                "Healthy biodiversity with stable wildlife population.";

        action =
                "Continue routine conservation and monitoring.";

    }

    return ConservationPriorityResponse.builder()

            .biodiversityScore(
                    Math.round(biodiversity * 100.0) / 100.0)

            .averageGrowthRate(
                    Math.round(growth * 100.0) / 100.0)

            .increasingSpecies(increasing)

            .stableSpecies(stable)

            .decreasingSpecies(decreasing)

            .conservationPriority(priority)

            .reason(reason)

            .recommendedAction(action)

            .build();
}
    private ConservationRecommendationResponse mapToResponse(
            ConservationRecommendation recommendation) {

        return ConservationRecommendationResponse.builder()

                .recommendationId(
                        recommendation.getRecommendationId())

                .biodiversityId(
                        recommendation.getBiodiversityScore() != null
                                ? recommendation.getBiodiversityScore().getBiodiversityId()
                                : null)

                .overallScore(
                        recommendation.getBiodiversityScore() != null
                                ? recommendation.getBiodiversityScore().getOverallScore().doubleValue()
                                : null)

                .priority(recommendation.getPriority())

                .recommendation(recommendation.getRecommendation())

                .generatedAt(recommendation.getGeneratedAt())

                .build();
    }
    @Override
public HabitatRestorationResponse getHabitatRestoration() {

    Double quality =
            habitatRepository.getAverageHabitatQualityScore();

    if (quality == null) {
        quality = 0.0;
    }

    Long habitats = habitatRepository.count();

    String priority;
    String recommendation;
    String outcome;

    if (quality < 40) {

        priority = "CRITICAL";

        recommendation =
                "Immediate reforestation, wetland restoration, invasive species removal and water source rehabilitation.";

        outcome =
                "Rapid ecosystem recovery expected.";

    }
    else if (quality < 70) {

        priority = "HIGH";

        recommendation =
                "Increase vegetation cover, restore wildlife corridors and improve habitat monitoring.";

        outcome =
                "Habitat quality expected to improve significantly.";

    }
    else if (quality < 85) {

        priority = "MEDIUM";

        recommendation =
                "Continue habitat enhancement and ecological restoration activities.";

        outcome =
                "Stable ecological improvement.";

    }
    else {

        priority = "LOW";

        recommendation =
                "Continue preventive habitat conservation and routine inspections.";

        outcome =
                "Habitat expected to remain healthy.";

    }

    return HabitatRestorationResponse.builder()

            .averageHabitatQuality(
                    Math.round(quality * 100.0) / 100.0)

            .totalHabitats(habitats)

            .restorationPriority(priority)

            .restorationRecommendation(recommendation)

            .expectedOutcome(outcome)

            .build();
}
@Override
public ProtectionStrategyResponse getProtectionStrategy() {

    Double biodiversity = 0.0;
    Double habitat = 0.0;
    Double growth = 0.0;

    if (biodiversityScoreRepository.getAverageOverallScore() != null) {
        biodiversity = biodiversityScoreRepository
                .getAverageOverallScore()
                .doubleValue();
    }

    if (habitatRepository.getAverageHabitatQualityScore() != null) {
        habitat = habitatRepository.getAverageHabitatQualityScore();
    }

    if (populationEstimateRepository.getAverageGrowthRate() != null) {
        growth = populationEstimateRepository
                .getAverageGrowthRate()
                .doubleValue();
    }

    String level;
    String strategy;
    String impact;

    if (biodiversity < 50 || habitat < 50 || growth < 0) {

        level = "HIGH";

        strategy =
                "Deploy anti-poaching patrols, increase camera trap coverage, strengthen habitat protection and restrict human interference.";

        impact =
                "Rapid reduction in biodiversity loss and improved wildlife survival.";

    }
    else if (biodiversity < 75 || habitat < 75) {

        level = "MEDIUM";

        strategy =
                "Increase wildlife monitoring, improve conservation patrol frequency and restore degraded habitats.";

        impact =
                "Improved ecosystem stability and species recovery.";

    }
    else {

        level = "LOW";

        strategy =
                "Maintain routine wildlife monitoring and continue existing protection policies.";

        impact =
                "Stable biodiversity and long-term ecosystem sustainability.";

    }

    return ProtectionStrategyResponse.builder()

            .biodiversityScore(
                    Math.round(biodiversity * 100.0) / 100.0)

            .habitatQuality(
                    Math.round(habitat * 100.0) / 100.0)

            .averageGrowthRate(
                    Math.round(growth * 100.0) / 100.0)

            .protectionLevel(level)

            .strategy(strategy)

            .expectedImpact(impact)

            .build();

}
@Override
public MonitoringOptimizationResponse getMonitoringOptimization() {

    Double biodiversity = 0.0;

    Double growth = 0.0;

    if (biodiversityScoreRepository.getAverageOverallScore() != null) {

        biodiversity =
                biodiversityScoreRepository
                        .getAverageOverallScore()
                        .doubleValue();

    }

    if (populationEstimateRepository.getAverageGrowthRate() != null) {

        growth =
                populationEstimateRepository
                        .getAverageGrowthRate()
                        .doubleValue();

    }

    int surveyFrequency;

    String level;

    String camera;

    String drone;

    String ai;

    if (biodiversity < 50 || growth < 0) {

        surveyFrequency = 7;

        level = "HIGH";

        camera = "Deploy additional AI camera traps across critical habitats.";

        drone = "Weekly drone surveillance recommended.";

        ai = "Increase AI-based wildlife monitoring and anomaly detection.";

    }

    else if (biodiversity < 75) {

        surveyFrequency = 15;

        level = "MEDIUM";

        camera = "Increase monitoring coverage near migration corridors.";

        drone = "Bi-weekly drone monitoring.";

        ai = "Perform seasonal AI biodiversity analysis.";

    }

    else {

        surveyFrequency = 30;

        level = "LOW";

        camera = "Current monitoring infrastructure is sufficient.";

        drone = "Monthly aerial monitoring.";

        ai = "Continue routine AI monitoring.";

    }

    return MonitoringOptimizationResponse.builder()

            .recommendedSurveyFrequency(surveyFrequency)

            .monitoringLevel(level)

            .cameraTrapRecommendation(camera)

            .droneMonitoring(drone)

            .aiRecommendation(ai)

            .build();

}
@Override
public ResourceAllocationResponse getResourceAllocation() {

    double biodiversity = 0.0;
    double habitat = 0.0;
    double growth = 0.0;

    if (biodiversityScoreRepository.getAverageOverallScore() != null) {
        biodiversity = biodiversityScoreRepository
                .getAverageOverallScore()
                .doubleValue();
    }

    if (habitatRepository.getAverageHabitatQualityScore() != null) {
        habitat = habitatRepository.getAverageHabitatQualityScore();
    }

    if (populationEstimateRepository.getAverageGrowthRate() != null) {
        growth = populationEstimateRepository
                .getAverageGrowthRate()
                .doubleValue();
    }

    String budget;
    int staff;
    int cameras;
    int drones;
    String deployment;

    if (biodiversity < 50 || habitat < 50 || growth < 0) {

        budget = "HIGH";

        staff = 25;

        cameras = 120;

        drones = 10;

        deployment =
                "Deploy additional conservation teams to critical habitats and increase AI surveillance.";

    }
    else if (biodiversity < 75 || habitat < 75) {

        budget = "MEDIUM";

        staff = 15;

        cameras = 75;

        drones = 5;

        deployment =
                "Strengthen monitoring near wildlife corridors and degraded habitats.";

    }
    else {

        budget = "LOW";

        staff = 8;

        cameras = 40;

        drones = 2;

        deployment =
                "Maintain current conservation infrastructure and periodic inspections.";

    }

    return ResourceAllocationResponse.builder()

            .budgetPriority(budget)

            .fieldStaffRequired(staff)

            .cameraTrapsRequired(cameras)

            .dronesRequired(drones)

            .deploymentStrategy(deployment)

            .build();

}
@Override
public ConservationDashboardResponse getDashboard() {

    return ConservationDashboardResponse.builder()

            .priority(
                    getConservationPriority())

            .restoration(
                    getHabitatRestoration())

            .protection(
                    getProtectionStrategy())

            .monitoring(
                    getMonitoringOptimization())

            .resources(
                    getResourceAllocation())

            .build();

}
}