package com.wildsight.backend.service;

import com.wildsight.backend.dto.MonitoringLocationRequest;
import com.wildsight.backend.dto.MonitoringLocationResponse;

import java.util.List;

public interface MonitoringLocationService {

    MonitoringLocationResponse createLocation(MonitoringLocationRequest request);

    List<MonitoringLocationResponse> getAllLocations();

    MonitoringLocationResponse getLocationById(Long id);

    MonitoringLocationResponse updateLocation(Long id,
                                              MonitoringLocationRequest request);

    void deleteLocation(Long id);
}