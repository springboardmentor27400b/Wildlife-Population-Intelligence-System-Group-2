package com.wildsight.backend.dto;

import com.wildsight.backend.entity.ReportStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {

    private Long reportId;

    private Long surveyId;

    private String surveyName;

    private Long generatedBy;

    private String generatedByName;

    private String reportTitle;

    private String reportType;

    private String reportPath;

    private LocalDateTime generatedAt;

    private ReportStatus reportStatus;
}