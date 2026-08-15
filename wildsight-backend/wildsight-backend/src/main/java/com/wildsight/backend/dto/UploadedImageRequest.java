package com.wildsight.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadedImageRequest {


    @NotNull(message = "Observation is required")
    private Long observationId;



    @NotBlank(message = "File name is required")
    @Size(
        max = 255,
        message = "File name cannot exceed 255 characters"
    )
    private String fileName;



    @NotBlank(message = "File path is required")
    @Size(
        max = 500,
        message = "File path cannot exceed 500 characters"
    )
    private String filePath;



    @NotNull(message = "Captured date and time is required")
    private LocalDateTime capturedAt;



    @NotNull(message = "File size is required")
    @Positive(
        message = "File size must be greater than 0"
    )
    private Long fileSize;



    @NotNull(message = "Uploader is required")
    private Long uploadedBy;



    @NotNull(message = "Image quality is required")
    @DecimalMin(
        value = "0.0",
        message = "Image quality cannot be less than 0"
    )
    @DecimalMax(
        value = "100.0",
        message = "Image quality cannot exceed 100"
    )
    private BigDecimal imageQuality;

}