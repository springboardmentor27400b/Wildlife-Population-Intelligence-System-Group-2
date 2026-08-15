package com.wildsight.backend.dto;


import lombok.*;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AIPredictionDashboardResponse {


private Long id;

private String species;

private Double confidence;

private String location;

private String researcher;

private String date;


}