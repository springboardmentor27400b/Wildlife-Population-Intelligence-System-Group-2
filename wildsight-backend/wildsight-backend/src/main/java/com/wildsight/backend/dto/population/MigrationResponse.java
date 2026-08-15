package com.wildsight.backend.dto.population;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MigrationResponse {

    private String species;

    private String fromLocation;

    private String toLocation;

}