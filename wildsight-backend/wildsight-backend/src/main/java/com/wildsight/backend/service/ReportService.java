package com.wildsight.backend.service;

import com.wildsight.backend.dto.ReportRequest;
import com.wildsight.backend.dto.ReportResponse;

import java.util.List;

public interface ReportService {

    ReportResponse createReport(ReportRequest request);

    List<ReportResponse> getAllReports();

    ReportResponse getReportById(Long id);

    ReportResponse updateReport(
            Long id,
            ReportRequest request);

    void deleteReport(Long id);

    ReportResponse generateSystemReport(
        String type,
        Long surveyId,
        Long userId
);
}