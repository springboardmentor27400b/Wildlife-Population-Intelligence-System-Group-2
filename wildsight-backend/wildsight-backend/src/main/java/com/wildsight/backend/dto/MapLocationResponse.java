package com.wildsight.backend.dto;


import lombok.*;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MapLocationResponse {


private Long id;


private String name;


private Double latitude;


private Double longitude;


private String type;


private String state;


private Double healthScore;


private Long speciesCount;


private Long population;


private Double biodiversityScore;

private Double habitatScore;

private String conservationStatus;

private String threatLevel;

private String recommendation;
}