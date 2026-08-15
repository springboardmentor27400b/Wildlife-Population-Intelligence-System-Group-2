package com.wildsight.backend.dto.ai;

import lombok.Data;

import java.util.List;

@Data
public class AnimalDetection {

    private int animalCount;

    private String annotatedImage;

    private List<Detection> detections;

}