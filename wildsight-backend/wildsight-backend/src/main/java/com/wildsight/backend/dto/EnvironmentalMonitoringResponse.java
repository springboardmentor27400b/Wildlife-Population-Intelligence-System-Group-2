package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentalMonitoringResponse {

    private Double averageTemperature;

    private Double averageHumidity;

    private Double averageRainfall;

    private Double averageWaterQuality;

    private Double averageAirQuality;

    private String environmentalStatus;

}