package com.wildsight.backend.service;

import com.wildsight.backend.dto.ObservationRequest;
import com.wildsight.backend.dto.ObservationResponse;

import java.util.List;

public interface ObservationService {

    ObservationResponse createObservation(ObservationRequest request);

    List<ObservationResponse> getAllObservations();

    ObservationResponse getObservationById(Long id);

    ObservationResponse updateObservation(Long id, ObservationRequest request);

    void deleteObservation(Long id);
}