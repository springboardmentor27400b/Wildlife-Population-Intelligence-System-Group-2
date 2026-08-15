package com.wildsight.backend.dto;

import com.wildsight.backend.entity.DeviceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringDeviceRequest {

    @NotNull(message = "Survey is required")
    private Long surveyId;

    @NotNull(message = "Device type is required")
    private Long deviceTypeId;

    @NotBlank(message = "Serial number is required")
    @Size(min = 3, max = 100,
            message = "Serial number must be between 3 and 100 characters")
    private String serialNumber;

    @NotBlank(message = "Device name is required")
    @Size(min = 3, max = 100,
            message = "Device name must be between 3 and 100 characters")
    private String deviceName;

    @NotNull(message = "Monitoring location is required")
    private Long locationId;

    @NotNull(message = "Device status is required")
    private DeviceStatus status;
}