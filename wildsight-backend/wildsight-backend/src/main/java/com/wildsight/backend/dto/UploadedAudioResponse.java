package com.wildsight.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadedAudioResponse {


    private Long audioId;


    private Long observationId;


    private Long uploadedBy;


    private String uploaderName;


    private String fileName;


    private String filePath;


    private LocalDateTime capturedAt;


    private LocalDateTime uploadTime;


    private Long fileSize;


    private BigDecimal durationSeconds;

    private String environmentNoise;

    // ===== AI RESULT =====


    private String species;

    private String kingdom;

private String phylum;

private String className;

private String order;

private String family;

private String genus;


    private String scientificName;


    private Double confidence;


    private String category;


    private String soundType;


    private String conservationStatus;


    private Boolean noiseFiltered;


    private String model;


    private String status;

}