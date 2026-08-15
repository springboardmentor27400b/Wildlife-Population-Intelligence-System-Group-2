package com.wildsight.backend.dto.population;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopulationTrendResponse {

    private String month;

    private Long population;

}