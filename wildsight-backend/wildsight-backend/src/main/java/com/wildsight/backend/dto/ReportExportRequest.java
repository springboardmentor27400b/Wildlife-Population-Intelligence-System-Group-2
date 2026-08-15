package com.wildsight.backend.dto;

import com.wildsight.backend.entity.ExportFormat;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportExportRequest {

    @NotNull(message = "Report is required")
    private Long reportId;

    @NotNull(message = "Export format is required")
    private ExportFormat exportFormat;

    @Size(max = 500,
            message = "Export path cannot exceed 500 characters")
    private String exportPath;
}