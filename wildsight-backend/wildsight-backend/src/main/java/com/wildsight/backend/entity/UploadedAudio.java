package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "uploaded_audio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadedAudio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audio_id")
    private Long audioId;

    @ManyToOne
    @JoinColumn(name = "observation_id", nullable = false)
    private Observation observation;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "captured_at")
    private LocalDateTime capturedAt;

    @Column(name = "file_size")
    private Long fileSize;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "duration_seconds", precision = 8, scale = 2)
    private BigDecimal durationSeconds;

    @Column(name = "upload_time", insertable = false, updatable = false)
    private LocalDateTime uploadTime;
}