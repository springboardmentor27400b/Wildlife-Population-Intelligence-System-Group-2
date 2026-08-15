package com.wildsight.backend.dto;

import com.wildsight.backend.dto.ai.Detection;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadedImageResponse {

    private Long imageId;

    private Long observationId;

    private Long uploadedBy;

    private String uploaderName;

    private String fileName;

    private String filePath;

    private LocalDateTime capturedAt;

    private LocalDateTime uploadTime;

    private Long fileSize;

    private BigDecimal imageQuality;

    // ---------- AI RESULT ----------

    private String predictedSpecies;

    private Integer animalCount;

    private String annotatedImage;

    private String model;

    private List<Detection> detections;
}