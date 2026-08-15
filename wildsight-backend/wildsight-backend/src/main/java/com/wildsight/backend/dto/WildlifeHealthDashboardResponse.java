package com.wildsight.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WildlifeHealthDashboardResponse {

    private WildlifeHealthResponse healthScore;

    private String overallMessage;

    private String recommendation;

}