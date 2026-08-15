package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.MonitoringDeviceRequest;
import com.wildsight.backend.dto.MonitoringDeviceResponse;
import com.wildsight.backend.entity.DeviceType;
import com.wildsight.backend.entity.MonitoringDevice;
import com.wildsight.backend.entity.MonitoringLocation;
import com.wildsight.backend.entity.Survey;
import com.wildsight.backend.repository.DeviceTypeRepository;
import com.wildsight.backend.repository.MonitoringDeviceRepository;
import com.wildsight.backend.repository.MonitoringLocationRepository;
import com.wildsight.backend.repository.SurveyRepository;
import com.wildsight.backend.service.MonitoringDeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MonitoringDeviceServiceImpl implements MonitoringDeviceService {

    private final MonitoringDeviceRepository monitoringDeviceRepository;
    private final SurveyRepository surveyRepository;
    private final MonitoringLocationRepository monitoringLocationRepository;
    private final DeviceTypeRepository deviceTypeRepository;

    @Override
    public MonitoringDeviceResponse createDevice(MonitoringDeviceRequest request) {

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        MonitoringLocation location = monitoringLocationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        DeviceType deviceType = deviceTypeRepository.findById(request.getDeviceTypeId())
                .orElseThrow(() -> new RuntimeException("Device Type not found"));

        MonitoringDevice device = MonitoringDevice.builder()
                .survey(survey)
                .location(location)
                .deviceType(deviceType)
                .serialNumber(request.getSerialNumber())
                .deviceName(request.getDeviceName())
                .status(request.getStatus())
                .build();

        device = monitoringDeviceRepository.save(device);

        return mapToResponse(device);
    }

    @Override
public List<MonitoringDeviceResponse> getAllDevices(){

    return monitoringDeviceRepository
            .findAllWithDetails()
            .stream()
            .map(this::mapToResponse)
            .toList();
}

    @Override
    public MonitoringDeviceResponse getDeviceById(Long id) {

        MonitoringDevice device = monitoringDeviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        return mapToResponse(device);
    }

    @Override
    public MonitoringDeviceResponse updateDevice(Long id,
                                                 MonitoringDeviceRequest request) {

        MonitoringDevice device = monitoringDeviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        MonitoringLocation location = monitoringLocationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        DeviceType deviceType = deviceTypeRepository.findById(request.getDeviceTypeId())
                .orElseThrow(() -> new RuntimeException("Device Type not found"));

        device.setSurvey(survey);
        device.setLocation(location);
        device.setDeviceType(deviceType);
        device.setSerialNumber(request.getSerialNumber());
        device.setDeviceName(request.getDeviceName());
        device.setStatus(request.getStatus());

        device = monitoringDeviceRepository.save(device);

        return mapToResponse(device);
    }

    @Override
    public void deleteDevice(Long id) {

        MonitoringDevice device = monitoringDeviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        monitoringDeviceRepository.delete(device);
    }


    private MonitoringDeviceResponse mapToResponse(
        MonitoringDevice device) {


    return MonitoringDeviceResponse.builder()

            .deviceId(
                    device.getDeviceId()
            )


            .surveyId(
                    device.getSurvey() != null
                    ?
                    device.getSurvey().getSurveyId()
                    :
                    null
            )


            .surveyName(
                    device.getSurvey() != null
                    ?
                    device.getSurvey().getSurveyName()
                    :
                    "No Survey"
            )


            .deviceTypeId(
                    device.getDeviceType() != null
                    ?
                    device.getDeviceType().getDeviceTypeId()
                    :
                    null
            )


            .deviceType(
                    device.getDeviceType() != null
                    ?
                    device.getDeviceType().getTypeName()
                    :
                    "Unknown"
            )


            .serialNumber(
                    device.getSerialNumber()
            )


            .deviceName(
                    device.getDeviceName()
            )


            .locationId(
                    device.getLocation() != null
                    ?
                    device.getLocation().getLocationId()
                    :
                    null
            )


            .locationName(
                    device.getLocation() != null
                    ?
                    device.getLocation().getLocationName()
                    :
                    "Unknown"
            )


            .status(
                    device.getStatus()
            )


            .build();
}


}