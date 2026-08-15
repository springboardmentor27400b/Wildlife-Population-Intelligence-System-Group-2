package com.wildsight.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BiodiversityScoreResponse {

    private Long biodiversityId;

    private Long surveyId;

    private String surveyName;

    private Long habitatId;

    private String habitatName;

    private BigDecimal speciesDiversityScore;

    private BigDecimal habitatQualityScore;

    private BigDecimal ecosystemHealthScore;

    private BigDecimal overallScore;

    private Integer speciesCount;

    private String healthStatus;

    private LocalDateTime calculatedAt;
}