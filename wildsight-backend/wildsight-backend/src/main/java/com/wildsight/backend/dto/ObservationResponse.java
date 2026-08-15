package com.wildsight.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ObservationResponse {

    private Long observationId;

    private Long surveyId;

    private String surveyName;

    private Long speciesId;

    private String commonName;

    private Long locationId;

    private String locationName;

    private Long deviceId;

    private String deviceName;

    private LocalDateTime observationTime;

    private String observerNotes;

    private String weather;

    private BigDecimal confidenceScore;

    private Integer imageCount;

    private Integer audioCount;
}