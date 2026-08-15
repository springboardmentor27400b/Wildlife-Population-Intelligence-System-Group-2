package com.wildsight.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioDetectionResponse {

    private Long audioDetectionId;

    private Long audioId;

    private Long speciesId;

    private String speciesName;

    private BigDecimal confidence;

    private String detectedCall;

    private BigDecimal noiseLevel;

    private LocalDateTime processedAt;
}