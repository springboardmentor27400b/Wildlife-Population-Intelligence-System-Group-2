package com.wildsight.backend.dto.ai;

import lombok.Data;

import java.util.List;

@Data
public class Detection {

    // Species Information
    private String species;

    private Double confidence;

    private List<Integer> boundingBox;

    // Individual Animal Identification
    private String animalId;

    private Boolean existingAnimal;

    private Integer similarity;

    // Animal Behavior
    private String behavior;

    private List<String> possibleBehaviors;

    // Species Status
    private Boolean endangered;

    private String speciesStatus;

    private String category;

    private String protectionLevel;

    private String scientificName;
private String kingdom;
private String phylum;
private String className;   // usually not "class"
private String order;
private String family;
private String genus;

}