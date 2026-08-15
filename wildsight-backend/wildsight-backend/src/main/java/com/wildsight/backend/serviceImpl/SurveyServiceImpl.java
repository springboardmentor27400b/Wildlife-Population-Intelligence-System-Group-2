package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.SurveyDashboardResponse;
import com.wildsight.backend.dto.SurveyRequest;
import com.wildsight.backend.dto.SurveyResponse;
import com.wildsight.backend.entity.Survey;
import com.wildsight.backend.entity.User;
import com.wildsight.backend.repository.SurveyRepository;
import com.wildsight.backend.repository.UserRepository;
import com.wildsight.backend.service.SurveyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.wildsight.backend.dto.SurveyDashboardResponse;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SurveyServiceImpl implements SurveyService {

    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;

    @Override
    public SurveyResponse createSurvey(SurveyRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Survey survey = Survey.builder()
                .user(user)
                .surveyName(request.getSurveyName())
                .description(request.getDescription())
                .habitatType(request.getHabitatType())
                .protectedArea(request.getProtectedArea())
                .surveyDate(request.getSurveyDate())
                .status(request.getStatus())
                .build();

        survey = surveyRepository.save(survey);

        return mapToResponse(survey);
    }

    @Override
    public List<SurveyResponse> getAllSurveys() {

        return surveyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public SurveyResponse getSurveyById(Long surveyId) {

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        return mapToResponse(survey);
    }

    @Override
    public SurveyResponse updateSurvey(Long surveyId, SurveyRequest request) {

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        survey.setUser(user);
        survey.setSurveyName(request.getSurveyName());
        survey.setDescription(request.getDescription());
        survey.setHabitatType(request.getHabitatType());
        survey.setProtectedArea(request.getProtectedArea());
        survey.setSurveyDate(request.getSurveyDate());
        survey.setStatus(request.getStatus());

        survey = surveyRepository.save(survey);

        return mapToResponse(survey);
    }

    @Override
    public void deleteSurvey(Long surveyId) {

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        surveyRepository.delete(survey);
    }
    @Override
public SurveyDashboardResponse getDashboard(){


    Long total =
            surveyRepository.count();


    Long active =
            surveyRepository.countByStatus("ACTIVE");


    Long completed =
            surveyRepository.countByStatus("COMPLETED");


    Long pending =
            surveyRepository.countByStatus("PENDING");



    Long forest =
            surveyRepository.countHabitat("Forest");


    Long grassland =
            surveyRepository.countHabitat("Grassland");


    Long wetland =
            surveyRepository.countHabitat("Wetland");



    String dominant="Forest";

    Long max=forest;


    if(grassland > max){

        dominant="Grassland";
        max=grassland;

    }


    if(wetland > max){

        dominant="Wetland";

    }



    return SurveyDashboardResponse.builder()

            .totalSurveys(total)

            .activeSurveys(active)

            .completedSurveys(completed)

            .pendingSurveys(pending)

            .forestSurveys(forest)

            .grasslandSurveys(grassland)

            .wetlandSurveys(wetland)

            .dominantHabitat(dominant)

            .build();

}
    private SurveyResponse mapToResponse(Survey survey) {

    return SurveyResponse.builder()

            .surveyId(
                    survey.getSurveyId()
            )

            .userId(
                    survey.getUser() != null
                    ? survey.getUser().getUserId()
                    : null
            )

            .surveyName(
                    survey.getSurveyName()
            )

            .description(
                    survey.getDescription()
            )

            .habitatType(
                    survey.getHabitatType()
            )

            .protectedArea(
                    survey.getProtectedArea()
            )

            .surveyDate(
                    survey.getSurveyDate()
            )

            .status(
                    survey.getStatus()
            )

            .createdAt(
                    survey.getCreatedAt()
            )

            .build();
}
}
