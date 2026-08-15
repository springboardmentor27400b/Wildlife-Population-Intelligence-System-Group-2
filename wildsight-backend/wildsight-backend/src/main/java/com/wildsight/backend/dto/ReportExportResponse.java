package com.wildsight.backend.dto;

import com.wildsight.backend.entity.ExportFormat;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportExportResponse {

    private Long exportId;

    private Long reportId;

    private String reportTitle;

    private ExportFormat exportFormat;

    private LocalDateTime exportedAt;

    private String exportPath;
}