package com.wildsight.backend.dto;

import com.wildsight.backend.entity.RiskLevel;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EndangeredSpeciesResponse {

    private Long endangeredId;

    private Long speciesId;

    private String speciesName;

    private RiskLevel riskLevel;

    private String remarks;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}