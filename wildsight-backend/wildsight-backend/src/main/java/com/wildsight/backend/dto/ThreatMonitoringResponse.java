package com.wildsight.backend.dto;


import lombok.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreatMonitoringResponse {


    private Long totalLocations;


    private Long highRisk;


    private Long moderateRisk;


    private Long lowRisk;


    private Double averageHealthScore;


    private String criticalArea;



}