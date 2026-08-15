package com.wildsight.backend.dto;

import com.wildsight.backend.entity.RecommendationPriority;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConservationRecommendationResponse {

    private Long recommendationId;

    private Long biodiversityId;

    private Double overallScore;

    private RecommendationPriority priority;

    private String recommendation;

    private LocalDateTime generatedAt;
}