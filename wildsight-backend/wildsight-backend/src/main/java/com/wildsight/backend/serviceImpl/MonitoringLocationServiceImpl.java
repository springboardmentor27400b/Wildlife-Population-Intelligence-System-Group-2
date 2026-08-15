package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.MonitoringLocationRequest;
import com.wildsight.backend.dto.MonitoringLocationResponse;
import com.wildsight.backend.entity.MonitoringLocation;
import com.wildsight.backend.entity.Survey;
import com.wildsight.backend.repository.MonitoringLocationRepository;
import com.wildsight.backend.repository.SurveyRepository;
import com.wildsight.backend.service.MonitoringLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MonitoringLocationServiceImpl implements MonitoringLocationService {

    private final MonitoringLocationRepository monitoringLocationRepository;
    private final SurveyRepository surveyRepository;

    @Override
    public MonitoringLocationResponse createLocation(MonitoringLocationRequest request) {

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        MonitoringLocation location = MonitoringLocation.builder()
                .survey(survey)
                .locationName(request.getLocationName())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .district(request.getDistrict())
                .state(request.getState())
                .country(request.getCountry())
                .build();

        location = monitoringLocationRepository.save(location);

        return mapToResponse(location);
    }

    @Override
public List<MonitoringLocationResponse> getAllLocations(){

    return monitoringLocationRepository
            .findAllWithDetails()
            .stream()
            .map(this::mapToResponse)
            .toList();
}

    @Override
    public MonitoringLocationResponse getLocationById(Long id) {

        MonitoringLocation location = monitoringLocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        return mapToResponse(location);
    }

    @Override
    public MonitoringLocationResponse updateLocation(Long id,
                                                     MonitoringLocationRequest request) {

        MonitoringLocation location = monitoringLocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        location.setSurvey(survey);
        location.setLocationName(request.getLocationName());
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setDistrict(request.getDistrict());
        location.setState(request.getState());
        location.setCountry(request.getCountry());

        location = monitoringLocationRepository.save(location);

        return mapToResponse(location);
    }

    @Override
    public void deleteLocation(Long id) {

        MonitoringLocation location = monitoringLocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        monitoringLocationRepository.delete(location);
    }

    private MonitoringLocationResponse mapToResponse(
        MonitoringLocation location){


    return MonitoringLocationResponse.builder()

            .locationId(
                    location.getLocationId()
            )

            .surveyId(
                    location.getSurvey()!=null
                    ?
                    location.getSurvey().getSurveyId()
                    :
                    null
            )


            .surveyName(
                    location.getSurvey()!=null
                    ?
                    location.getSurvey().getSurveyName()
                    :
                    "No Survey"
            )


            .locationName(
                    location.getLocationName()
            )


            .latitude(
                    location.getLatitude()
            )


            .longitude(
                    location.getLongitude()
            )


            .district(
                    location.getDistrict()
            )


            .state(
                    location.getState()
            )


            .country(
                    location.getCountry()
            )

            .build();

}
}