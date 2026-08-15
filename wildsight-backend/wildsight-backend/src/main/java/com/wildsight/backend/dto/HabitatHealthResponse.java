package com.wildsight.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitatHealthResponse {

    private Double averageHabitatHealth;

    private Long healthyHabitats;

    private Long degradedHabitats;

    private String status;

}