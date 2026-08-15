package com.wildsight.backend.dto;

import com.wildsight.backend.entity.RecommendationPriority;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConservationRecommendationRequest {

    @NotNull(message = "Biodiversity score is required")
    private Long biodiversityId;

    @NotNull(message = "Recommendation priority is required")
    private RecommendationPriority priority;

    @NotBlank(message = "Recommendation is required")
    @Size(max = 2000,
            message = "Recommendation cannot exceed 2000 characters")
    private String recommendation;
}