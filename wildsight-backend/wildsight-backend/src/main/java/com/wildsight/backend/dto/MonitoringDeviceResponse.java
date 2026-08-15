package com.wildsight.backend.dto;

import com.wildsight.backend.entity.DeviceStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringDeviceResponse {

    private Long deviceId;

    private Long surveyId;
    private String surveyName;

    private Long deviceTypeId;
    private String deviceType;

    private String serialNumber;

    private String deviceName;

    private Long locationId;
    private String locationName;

    private DeviceStatus status;
}