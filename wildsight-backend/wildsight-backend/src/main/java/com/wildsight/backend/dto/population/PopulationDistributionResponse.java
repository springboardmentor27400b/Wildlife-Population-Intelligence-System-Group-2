package com.wildsight.backend.dto.population;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopulationDistributionResponse {

    private String species;

    private String location;

    private Long population;

}