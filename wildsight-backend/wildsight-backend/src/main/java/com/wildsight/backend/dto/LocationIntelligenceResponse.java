package com.wildsight.backend.dto;


import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationIntelligenceResponse {


    private Long id;

    private String name;

    private String state;

    private String type;


    private Double latitude;

    private Double longitude;



    // Population Module

    private Long population;

    private Long speciesCount;



    // Biodiversity Module

    private Double biodiversityScore;



    // Habitat Module

    private Double habitatScore;



    // Health Module

    private Double healthScore;



    private String conservationStatus;


    private String threatLevel;


    private String recommendation;

}