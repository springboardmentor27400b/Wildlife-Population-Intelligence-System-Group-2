package com.wildsight.backend.service;

import com.wildsight.backend.dto.MonitoringDeviceRequest;
import com.wildsight.backend.dto.MonitoringDeviceResponse;

import java.util.List;

public interface MonitoringDeviceService {

    MonitoringDeviceResponse createDevice(MonitoringDeviceRequest request);

    List<MonitoringDeviceResponse> getAllDevices();

    MonitoringDeviceResponse getDeviceById(Long id);

    MonitoringDeviceResponse updateDevice(Long id,
                                          MonitoringDeviceRequest request);

    void deleteDevice(Long id);
}