package com.wildsight.backend.dto;

import lombok.Data;

@Data
public class AIPredictionResponse {

    private String status;
    private String predictedSpecies;
    private Double confidence;
    private String model;

}