package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "audio_detections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioDetection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audio_detection_id")
    private Long audioDetectionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audio_id", nullable = false)
    private UploadedAudio audio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "species_id")
    private Species species;

    @Column(name = "confidence", precision = 5, scale = 2)
    private BigDecimal confidence;

    @Column(name = "detected_call")
    private String detectedCall;

    @Column(name = "noise_level", precision = 5, scale = 2)
    private BigDecimal noiseLevel;

    @Column(name = "processed_at", insertable = false, updatable = false)
    private LocalDateTime processedAt;
}