package com.wildsight.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitatResponse {

    private Long habitatId;

    private String habitatName;

    private String habitatType;

    private String vegetationType;

    private String description;
}