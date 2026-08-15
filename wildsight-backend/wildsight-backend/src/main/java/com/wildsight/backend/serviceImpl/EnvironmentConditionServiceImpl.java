package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.EnvironmentConditionRequest;
import com.wildsight.backend.dto.EnvironmentConditionResponse;
import com.wildsight.backend.entity.EnvironmentCondition;
import com.wildsight.backend.entity.Habitat;
import com.wildsight.backend.entity.Survey;
import com.wildsight.backend.repository.EnvironmentConditionRepository;
import com.wildsight.backend.repository.HabitatRepository;
import com.wildsight.backend.repository.SurveyRepository;
import com.wildsight.backend.service.EnvironmentConditionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnvironmentConditionServiceImpl implements EnvironmentConditionService {

    private final EnvironmentConditionRepository environmentConditionRepository;
    private final HabitatRepository habitatRepository;
    private final SurveyRepository surveyRepository;

    @Override
    public EnvironmentConditionResponse createCondition(EnvironmentConditionRequest request) {

        Habitat habitat = habitatRepository.findById(request.getHabitatId())
                .orElseThrow(() -> new RuntimeException("Habitat not found"));

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        EnvironmentCondition condition = EnvironmentCondition.builder()
                .habitat(habitat)
                .survey(survey)
                .temperature(request.getTemperature())
                .humidity(request.getHumidity())
                .rainfall(request.getRainfall())
                .airQuality(request.getAirQuality())
                .windSpeed(request.getWindSpeed())
                .weatherCondition(request.getWeatherCondition())
                .recordedAt(request.getRecordedAt())
                .build();

        condition = environmentConditionRepository.save(condition);

        return mapToResponse(condition);
    }

    @Override
    public List<EnvironmentConditionResponse> getAllConditions() {

        return environmentConditionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public EnvironmentConditionResponse getConditionById(Long id) {

        EnvironmentCondition condition = environmentConditionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Environment Condition not found"));

        return mapToResponse(condition);
    }

    @Override
    public EnvironmentConditionResponse updateCondition(Long id,
                                                        EnvironmentConditionRequest request) {

        EnvironmentCondition condition = environmentConditionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Environment Condition not found"));

        Habitat habitat = habitatRepository.findById(request.getHabitatId())
                .orElseThrow(() -> new RuntimeException("Habitat not found"));

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        condition.setHabitat(habitat);
        condition.setSurvey(survey);
        condition.setTemperature(request.getTemperature());
        condition.setHumidity(request.getHumidity());
        condition.setRainfall(request.getRainfall());
        condition.setAirQuality(request.getAirQuality());
        condition.setWindSpeed(request.getWindSpeed());
        condition.setWeatherCondition(request.getWeatherCondition());
        condition.setRecordedAt(request.getRecordedAt());

        condition = environmentConditionRepository.save(condition);

        return mapToResponse(condition);
    }

    @Override
    public void deleteCondition(Long id) {

        EnvironmentCondition condition = environmentConditionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Environment Condition not found"));

        environmentConditionRepository.delete(condition);
    }

    private EnvironmentConditionResponse mapToResponse(EnvironmentCondition condition) {

        return EnvironmentConditionResponse.builder()
                .conditionId(condition.getConditionId())
                .habitatId(condition.getHabitat().getHabitatId())
                .habitatName(condition.getHabitat().getHabitatName())
                .surveyId(condition.getSurvey().getSurveyId())
                .temperature(condition.getTemperature())
                .humidity(condition.getHumidity())
                .rainfall(condition.getRainfall())
                .airQuality(condition.getAirQuality())
                .windSpeed(condition.getWindSpeed())
                .weatherCondition(condition.getWeatherCondition())
                .recordedAt(condition.getRecordedAt())
                .build();
    }
}