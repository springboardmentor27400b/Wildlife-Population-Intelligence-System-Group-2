package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.EnvironmentalMonitoringResponse;
import com.wildsight.backend.dto.HabitatClassificationResponse;
import com.wildsight.backend.dto.HabitatDashboardResponse;
import com.wildsight.backend.dto.HabitatDegradationResponse;
import com.wildsight.backend.dto.HabitatRequest;
import com.wildsight.backend.dto.HabitatResponse;
import com.wildsight.backend.dto.HabitatSuitabilityResponse;
import com.wildsight.backend.dto.VegetationAnalysisResponse;
import com.wildsight.backend.entity.Habitat;
import com.wildsight.backend.repository.HabitatRepository;
import com.wildsight.backend.service.HabitatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.wildsight.backend.dto.HabitatDashboardResponse;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HabitatServiceImpl implements HabitatService {

    private final HabitatRepository habitatRepository;

    @Override
    public HabitatResponse createHabitat(HabitatRequest request) {

        Habitat habitat = Habitat.builder()
                .habitatName(request.getHabitatName())
                .habitatType(request.getHabitatType())
                .vegetationType(request.getVegetationType())
                .description(request.getDescription())
                .build();

        habitat = habitatRepository.save(habitat);

        return mapToResponse(habitat);
    }

    @Override
    public List<HabitatResponse> getAllHabitats() {

        return habitatRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public HabitatResponse getHabitatById(Long id) {

        Habitat habitat = habitatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habitat not found"));

        return mapToResponse(habitat);
    }

    @Override
    public HabitatResponse updateHabitat(Long id,
                                         HabitatRequest request) {

        Habitat habitat = habitatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habitat not found"));

        habitat.setHabitatName(request.getHabitatName());
        habitat.setHabitatType(request.getHabitatType());
        habitat.setVegetationType(request.getVegetationType());
        habitat.setDescription(request.getDescription());

        habitat = habitatRepository.save(habitat);

        return mapToResponse(habitat);
    }

    @Override
    public void deleteHabitat(Long id) {

        Habitat habitat = habitatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habitat not found"));

        habitatRepository.delete(habitat);
    }

    private HabitatResponse mapToResponse(Habitat habitat) {

        return HabitatResponse.builder()
                .habitatId(habitat.getHabitatId())
                .habitatName(habitat.getHabitatName())
                .habitatType(habitat.getHabitatType())
                .vegetationType(habitat.getVegetationType())
                .description(habitat.getDescription())
                .build();
    }
    @Override
public HabitatDashboardResponse getDashboard() {

    Double quality = habitatRepository.getAverageHabitatQualityScore();

    Double suitability = habitatRepository.getAverageSuitabilityScore();

    if (quality == null)
        quality = 0.0;

    if (suitability == null)
        suitability = 0.0;

    return HabitatDashboardResponse.builder()

            .totalHabitats(habitatRepository.count())

            .averageHabitatQuality(
                    Math.round(quality * 100.0) / 100.0)

            .averageSuitability(
                    Math.round(suitability * 100.0) / 100.0)

            .healthyHabitats(
                    habitatRepository.countHealthyHabitats())

            .degradedHabitats(
                    habitatRepository.countDegradedHabitats())

            .criticalHabitats(
                    habitatRepository.countCriticalHabitats())

            .build();

}
@Override
public HabitatClassificationResponse getHabitatClassification() {

    Long forest = habitatRepository.countByHabitatTypeIgnoreCase("Forest");
    Long grassland = habitatRepository.countByHabitatTypeIgnoreCase("Grassland");
    Long wetland = habitatRepository.countByHabitatTypeIgnoreCase("Wetland");
    Long mountain = habitatRepository.countByHabitatTypeIgnoreCase("Mountain");
    Long river = habitatRepository.countByHabitatTypeIgnoreCase("River");

    String dominant = "Forest";
    long max = forest;

    if (grassland > max) {
        max = grassland;
        dominant = "Grassland";
    }

    if (wetland > max) {
        max = wetland;
        dominant = "Wetland";
    }

    if (mountain > max) {
        max = mountain;
        dominant = "Mountain";
    }

    if (river > max) {
        dominant = "River";
    }

    return HabitatClassificationResponse.builder()
            .totalHabitats(habitatRepository.count())
            .forestHabitats(forest)
            .grasslandHabitats(grassland)
            .wetlandHabitats(wetland)
            .mountainHabitats(mountain)
            .riverHabitats(river)
            .dominantHabitat(dominant)
            .build();
}
@Override
public HabitatDegradationResponse getHabitatDegradation() {

    Double degradation = habitatRepository.getAverageDegradationLevel();

    if (degradation == null) {
        degradation = 0.0;
    }

    String status;

    if (degradation < 25) {
        status = "Low Risk";
    } else if (degradation < 50) {
        status = "Moderate Risk";
    } else if (degradation < 75) {
        status = "High Risk";
    } else {
        status = "Critical";
    }

    return HabitatDegradationResponse.builder()
            .averageDegradationLevel(
                    Math.round(degradation * 100.0) / 100.0)
            .lowRiskHabitats(
                    habitatRepository.countLowRiskHabitats())
            .moderateRiskHabitats(
                    habitatRepository.countModerateRiskHabitats())
            .highRiskHabitats(
                    habitatRepository.countHighRiskHabitats())
            .criticalHabitats(
                    habitatRepository.countCriticalHabitatsByDegradation())
            .overallStatus(status)
            .build();
}
@Override
public VegetationAnalysisResponse getVegetationAnalysis() {

    Double density = habitatRepository.getAverageVegetationDensity();

    if (density == null)
        density = 0.0;

    String status;

    if (density >= 80)
        status = "Dense Vegetation";
    else if (density >= 60)
        status = "Moderate Vegetation";
    else if (density >= 40)
        status = "Sparse Vegetation";
    else
        status = "Critical Vegetation Loss";

    return VegetationAnalysisResponse.builder()

            .averageVegetationDensity(
                    Math.round(density * 100.0) / 100.0)

            .dominantVegetationType(
                    habitatRepository.getDominantVegetationType())

            .vegetationStatus(status)

            .build();
}
@Override
public EnvironmentalMonitoringResponse getEnvironmentalMonitoring() {

    Double temperature = habitatRepository.getAverageTemperature();
    Double humidity = habitatRepository.getAverageHumidity();
    Double rainfall = habitatRepository.getAverageRainfall();
    Double waterQuality = habitatRepository.getAverageWaterQuality();
    Double airQuality = habitatRepository.getAverageAirQuality();

    if (temperature == null) temperature = 0.0;
    if (humidity == null) humidity = 0.0;
    if (rainfall == null) rainfall = 0.0;
    if (waterQuality == null) waterQuality = 0.0;
    if (airQuality == null) airQuality = 0.0;

    double environmentScore =
            (waterQuality + airQuality + humidity) / 3.0;

    String status;

    if (environmentScore >= 80)
        status = "Excellent";

    else if (environmentScore >= 60)
        status = "Good";

    else if (environmentScore >= 40)
        status = "Moderate";

    else
        status = "Critical";

    return EnvironmentalMonitoringResponse.builder()

            .averageTemperature(
                    Math.round(temperature * 100.0) / 100.0)

            .averageHumidity(
                    Math.round(humidity * 100.0) / 100.0)

            .averageRainfall(
                    Math.round(rainfall * 100.0) / 100.0)

            .averageWaterQuality(
                    Math.round(waterQuality * 100.0) / 100.0)

            .averageAirQuality(
                    Math.round(airQuality * 100.0) / 100.0)

            .environmentalStatus(status)

            .build();
}
@Override
public HabitatSuitabilityResponse getHabitatSuitability() {

    Double suitability = habitatRepository.getAverageSuitabilityScore();

    if (suitability == null)
        suitability = 0.0;

    String status;

    if (suitability >= 80)
        status = "Highly Suitable";
    else if (suitability >= 50)
        status = "Moderately Suitable";
    else
        status = "Unsuitable";

    return HabitatSuitabilityResponse.builder()

            .averageSuitabilityScore(
                    Math.round(suitability * 100.0) / 100.0)

            .highlySuitableHabitats(
                    habitatRepository.countHighlySuitableHabitats())

            .moderatelySuitableHabitats(
                    habitatRepository.countModeratelySuitableHabitats())

            .unsuitableHabitats(
                    habitatRepository.countUnsuitableHabitats())

            .suitabilityStatus(status)

            .build();
}
}