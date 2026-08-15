package com.wildsight.backend.serviceImpl;


import com.wildsight.backend.dto.BiodiversityDashboardResponse;
import com.wildsight.backend.dto.BiodiversityIndexResponse;
import com.wildsight.backend.dto.BiodiversityScoreRequest;
import com.wildsight.backend.dto.BiodiversityScoreResponse;
import com.wildsight.backend.dto.EcosystemMonitoringResponse;
import com.wildsight.backend.dto.HabitatHealthResponse;
import com.wildsight.backend.dto.SpeciesDiversityChartResponse;
import com.wildsight.backend.dto.SpeciesDiversityResponse;

import com.wildsight.backend.entity.BiodiversityScore;
import com.wildsight.backend.entity.Habitat;
import com.wildsight.backend.entity.Survey;

import com.wildsight.backend.repository.BiodiversityScoreRepository;
import com.wildsight.backend.repository.HabitatRepository;
import com.wildsight.backend.repository.SurveyRepository;

import com.wildsight.backend.service.BiodiversityScoreService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BiodiversityScoreServiceImpl implements BiodiversityScoreService {

    private final BiodiversityScoreRepository biodiversityScoreRepository;
    private final SurveyRepository surveyRepository;
    private final HabitatRepository habitatRepository;

    @Override
    public BiodiversityScoreResponse createScore(BiodiversityScoreRequest request) {

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        Habitat habitat = null;

        if (request.getHabitatId() != null) {
            habitat = habitatRepository.findById(request.getHabitatId())
                    .orElseThrow(() -> new RuntimeException("Habitat not found"));
        }

        BiodiversityScore score = BiodiversityScore.builder()
                .survey(survey)
                .habitat(habitat)
                .speciesDiversityScore(request.getSpeciesDiversityScore())
                .habitatQualityScore(request.getHabitatQualityScore())
                .ecosystemHealthScore(request.getEcosystemHealthScore())
                .overallScore(request.getOverallScore())
                .speciesCount(request.getSpeciesCount())
                .healthStatus(request.getHealthStatus())
                .build();

        score = biodiversityScoreRepository.save(score);

        return mapToResponse(score);
    }

    @Override
    public List<BiodiversityScoreResponse> getAllScores() {

        return biodiversityScoreRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BiodiversityScoreResponse getScoreById(Long id) {

        BiodiversityScore score = biodiversityScoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Biodiversity Score not found"));

        return mapToResponse(score);
    }

    @Override
    public BiodiversityScoreResponse updateScore(Long id,
                                                 BiodiversityScoreRequest request) {

        BiodiversityScore score = biodiversityScoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Biodiversity Score not found"));

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        Habitat habitat = null;

        if (request.getHabitatId() != null) {
            habitat = habitatRepository.findById(request.getHabitatId())
                    .orElseThrow(() -> new RuntimeException("Habitat not found"));
        }

        score.setSurvey(survey);
        score.setHabitat(habitat);
        score.setSpeciesDiversityScore(request.getSpeciesDiversityScore());
        score.setHabitatQualityScore(request.getHabitatQualityScore());
        score.setEcosystemHealthScore(request.getEcosystemHealthScore());
        score.setOverallScore(request.getOverallScore());
        score.setSpeciesCount(request.getSpeciesCount());
        score.setHealthStatus(request.getHealthStatus());

        score = biodiversityScoreRepository.save(score);

        return mapToResponse(score);
    }

    @Override
    public void deleteScore(Long id) {

        BiodiversityScore score = biodiversityScoreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Biodiversity Score not found"));

        biodiversityScoreRepository.delete(score);
    }
    @Override
public BiodiversityDashboardResponse getDashboard() {


    long totalAssessments =
            biodiversityScoreRepository.count();


    Integer totalSpecies =
            biodiversityScoreRepository.getTotalSpeciesCount();


    Double diversity =
            biodiversityScoreRepository
                    .getAverageSpeciesDiversityScore();


    Double habitat =
            biodiversityScoreRepository
                    .getAverageHabitatHealth();


    Double ecosystem =
            biodiversityScoreRepository
                    .getAverageEcosystemHealth()
                    != null
                    ?
                    biodiversityScoreRepository
                    .getAverageEcosystemHealth()
                    .doubleValue()
                    :
                    0.0;


    Double overall =
            biodiversityScoreRepository
                    .getAverageOverallScore()
                    != null
                    ?
                    biodiversityScoreRepository
                    .getAverageOverallScore()
                    .doubleValue()
                    :
                    0.0;



    return BiodiversityDashboardResponse.builder()

            .totalAssessments(
                    totalAssessments
            )

            .totalSpecies(
                    totalSpecies == null ? 0 : totalSpecies
            )

            .averageSpeciesDiversity(
                    diversity == null ? 0.0 : diversity
            )

            .averageHabitatQuality(
                    habitat == null ? 0.0 : habitat
            )

            .averageEcosystemHealth(
                    ecosystem
            )

            .averageOverallScore(
                    overall
            )

            .healthyCount(
                    biodiversityScoreRepository
                    .countByHealthStatus("Healthy")
            )

            .vulnerableCount(
                    biodiversityScoreRepository
                    .countByHealthStatus("Vulnerable")
            )

            .criticalCount(
                    biodiversityScoreRepository
                    .countByHealthStatus("Critical")
            )

            .build();

}

@Override
public BiodiversityIndexResponse getBiodiversityIndex() {

    Double index =
            biodiversityScoreRepository.calculateBiodiversityIndex();


    if(index == null){
        index = 0.0;
    }


    String status;


    if(index >= 90){

        status = "Excellent";

    }
    else if(index >= 75){

        status = "Healthy";

    }
    else if(index >= 60){

        status = "Moderate Concern";

    }
    else if(index >= 40){

        status = "Vulnerable";

    }
    else{

        status = "Critical";

    }


    return BiodiversityIndexResponse.builder()
            .biodiversityIndex(
                    Math.round(index * 100.0) / 100.0
            )
            .status(status)
            .build();
}
    private BiodiversityScoreResponse mapToResponse(BiodiversityScore score) {

        return BiodiversityScoreResponse.builder()
                .biodiversityId(score.getBiodiversityId())
                .surveyId(score.getSurvey().getSurveyId())
                .surveyName(score.getSurvey().getSurveyName())
                .habitatId(score.getHabitat() != null ? score.getHabitat().getHabitatId() : null)
                .habitatName(score.getHabitat() != null ? score.getHabitat().getHabitatName() : null)
                .speciesDiversityScore(score.getSpeciesDiversityScore())
                .habitatQualityScore(score.getHabitatQualityScore())
                .ecosystemHealthScore(score.getEcosystemHealthScore())
                .overallScore(score.getOverallScore())
                .speciesCount(score.getSpeciesCount())
                .healthStatus(score.getHealthStatus())
                .calculatedAt(score.getCalculatedAt())
                .build();
    }

    @Override
public SpeciesDiversityResponse getSpeciesDiversityAnalysis() {


    Integer totalSpecies =
            biodiversityScoreRepository.getTotalSpeciesCount();


    Double diversityScore =
            biodiversityScoreRepository
                    .getAverageSpeciesDiversityScore();


    if(diversityScore == null){
        diversityScore = 0.0;
    }


    String status;


    if(diversityScore >= 90){

        status = "Very High Diversity";

    }
    else if(diversityScore >= 75){

        status = "High Diversity";

    }
    else if(diversityScore >= 50){

        status = "Moderate Diversity";

    }
    else{

        status = "Low Diversity";

    }


    return SpeciesDiversityResponse.builder()

            .totalSpecies(totalSpecies)

            .averageDiversityScore(
                    Math.round(diversityScore * 100.0) / 100.0
            )

            .diversityStatus(status)

            .build();

}

@Override
public HabitatHealthResponse getHabitatHealthAssessment() {


    Double average =
            biodiversityScoreRepository
                    .getAverageHabitatHealth();


    if(average == null){
        average = 0.0;
    }


    String status;


    if(average >= 90){

        status = "Excellent";

    }
    else if(average >= 75){

        status = "Healthy";

    }
    else if(average >= 50){

        status = "Moderate Concern";

    }
    else{

        status = "Critical";

    }


    return HabitatHealthResponse.builder()

            .averageHabitatHealth(
                    Math.round(average * 100.0)/100.0
            )

            .healthyHabitats(
                    biodiversityScoreRepository.countHealthyHabitats()
            )

            .degradedHabitats(
                    biodiversityScoreRepository.countDegradedHabitats()
            )

            .status(status)

            .build();

}
@Override
public EcosystemMonitoringResponse getEcosystemMonitoring() {


    BigDecimal healthValue =
            biodiversityScoreRepository
                    .getAverageEcosystemHealth();


    Double healthScore =
            healthValue != null
            ?
            healthValue.doubleValue()
            :
            0.0;



    String monitoringStatus;

    String riskLevel;



    if(healthScore >= 90){

        monitoringStatus = "Stable";
        riskLevel = "Low";

    }
    else if(healthScore >= 75){

        monitoringStatus = "Healthy";
        riskLevel = "Moderate";

    }
    else if(healthScore >= 50){

        monitoringStatus = "Needs Attention";
        riskLevel = "High";

    }
    else{

        monitoringStatus = "Critical";
        riskLevel = "Very High";

    }



    return EcosystemMonitoringResponse.builder()

            .averageEcosystemHealth(
                    Math.round(healthScore * 100.0) / 100.0
            )

            .monitoringStatus(
                    monitoringStatus
            )

            .riskLevel(
                    riskLevel
            )

            .build();

}
private Double defaultValue(BigDecimal value) {

    if (value == null) {
        return 0.0;
    }

    return value.doubleValue();
}
@Override
public List<SpeciesDiversityChartResponse>
getSpeciesDiversityChart() {

    return biodiversityScoreRepository
            .getSpeciesDiversityChart();

}
}