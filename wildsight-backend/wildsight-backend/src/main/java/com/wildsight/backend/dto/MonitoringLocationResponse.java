package com.wildsight.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringLocationResponse {

    private Long locationId;

    private Long surveyId;

    private String surveyName;

    private String locationName;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String district;

    private String state;

    private String country;
}