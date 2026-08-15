package com.wildsight.backend.dto.ai;

import lombok.Data;

@Data
public class AudioPredictionResult {


    private String status;


    private String species;


    private String speciesCode;


    private String scientificName;


    private Double confidence;


    private String category;


    private String soundType;


    private String conservationStatus;


    private Boolean noiseFiltered;


    private String environmentNoise;



    // TAXONOMY

    private String kingdom;


    private String phylum;


    private String className;


    private String order;


    private String family;


    private String genus;


    private String model;

}