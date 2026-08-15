package com.wildsight.backend.dto;

import com.wildsight.backend.entity.PopulationTrend;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopulationHistoryResponse {

    private Long historyId;

    private Long estimateId;

    private Long speciesId;

    private String speciesName;

    private Integer previousPopulation;

    private Integer currentPopulation;

    private PopulationTrend trend;

    private LocalDateTime recordedAt;
}