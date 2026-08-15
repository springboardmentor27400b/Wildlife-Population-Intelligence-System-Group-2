package com.wildsight.backend.service;

import com.wildsight.backend.dto.ReportExportRequest;
import com.wildsight.backend.dto.ReportExportResponse;

import java.util.List;

public interface ReportExportService {

    ReportExportResponse createExport(
            ReportExportRequest request);

    List<ReportExportResponse> getAllExports();

    ReportExportResponse getExportById(Long id);

    ReportExportResponse updateExport(
            Long id,
            ReportExportRequest request);

    void deleteExport(Long id);

    byte[] downloadExport(Long id);

    String getDownloadFileName(Long id);

    String getContentType(Long id);
}