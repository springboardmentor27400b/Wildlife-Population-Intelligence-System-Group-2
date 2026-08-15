package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.ReportExportRequest;
import com.wildsight.backend.dto.ReportExportResponse;

import com.wildsight.backend.entity.Habitat;
import com.wildsight.backend.entity.PopulationEstimate;
import com.wildsight.backend.entity.Report;
import com.wildsight.backend.entity.ReportExport;

import com.wildsight.backend.repository.HabitatRepository;
import com.wildsight.backend.repository.PopulationEstimateRepository;
import com.wildsight.backend.repository.ReportExportRepository;
import com.wildsight.backend.repository.ReportRepository;

import com.wildsight.backend.service.ReportExportService;

import java.awt.Color;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;

import lombok.RequiredArgsConstructor;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportExportServiceImpl
        implements ReportExportService {

    private final ReportExportRepository reportExportRepository;

    private final ReportRepository reportRepository;

    private final PopulationEstimateRepository
            populationEstimateRepository;

    private final HabitatRepository habitatRepository;


    // ============================================================
    // CREATE EXPORT
    // ============================================================

    @Override
    public ReportExportResponse createExport(
            ReportExportRequest request) {

        Report report =
                reportRepository.findById(
                        request.getReportId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Report not found"
                        )
                );

        ReportExport export =
                ReportExport.builder()
                        .report(report)
                        .exportFormat(
                                request.getExportFormat()
                        )
                        .exportPath(
                                request.getExportPath()
                        )
                        .build();

        export =
                reportExportRepository.save(export);

        return mapToResponse(export);
    }


    // ============================================================
    // GET ALL
    // ============================================================

    @Override
    public List<ReportExportResponse> getAllExports() {

        return reportExportRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    @Override
    public ReportExportResponse getExportById(
            Long id) {

        ReportExport export =
                reportExportRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Report Export not found"
                                )
                        );

        return mapToResponse(export);
    }


    // ============================================================
    // UPDATE
    // ============================================================

    @Override
    public ReportExportResponse updateExport(
            Long id,
            ReportExportRequest request) {

        ReportExport export =
                reportExportRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Report Export not found"
                                )
                        );

        Report report =
                reportRepository.findById(
                        request.getReportId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Report not found"
                        )
                );

        export.setReport(report);

        export.setExportFormat(
                request.getExportFormat()
        );

        export.setExportPath(
                request.getExportPath()
        );

        export =
                reportExportRepository.save(export);

        return mapToResponse(export);
    }


    // ============================================================
    // DELETE
    // ============================================================

    @Override
    public void deleteExport(Long id) {

        ReportExport export =
                reportExportRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Report Export not found"
                                )
                        );

        reportExportRepository.delete(export);
    }


    // ============================================================
    // DOWNLOAD
    // ============================================================

    @Override
    public byte[] downloadExport(Long id) {

        ReportExport export =
                reportExportRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Report Export not found"
                                )
                        );

        if (export.getExportFormat() == null) {

            throw new RuntimeException(
                    "Export format is not defined"
            );
        }

        if (export.getExportFormat()
                .name()
                .equalsIgnoreCase("PDF")) {

            return generatePdf(
                    export.getReport()
            );
        }

        if (export.getExportFormat()
                .name()
                .equalsIgnoreCase("EXCEL")) {

            return generateExcel(
                    export.getReport()
            );
        }

        if (export.getExportFormat()
                .name()
                .equalsIgnoreCase("CSV")) {

            return generateCsv(
                    export.getReport()
            );
        }

        throw new RuntimeException(
                "Unsupported export format: "
                        + export.getExportFormat()
        );
    }


    // ============================================================
    // FILE NAME
    // ============================================================

    @Override
    public String getDownloadFileName(Long id) {

        ReportExport export =
                reportExportRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Report Export not found"
                                )
                        );

        String title =
                export.getReport()
                        .getReportTitle();

        if (title == null ||
                title.isBlank()) {

            title = "WildSight_Report";
        }

        title =
                title.replaceAll(
                        "[^a-zA-Z0-9-_ ]",
                        ""
                )
                .replaceAll(
                        "\\s+",
                        "_"
                );

        if (export.getExportFormat()
                .name()
                .equalsIgnoreCase("EXCEL")) {

            return title + ".xlsx";
        }

        if (export.getExportFormat()
                .name()
                .equalsIgnoreCase("CSV")) {

            return title + ".csv";
        }

        return title + ".pdf";
    }


    // ============================================================
    // CONTENT TYPE
    // ============================================================

    @Override
    public String getContentType(Long id) {

        ReportExport export =
                reportExportRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Report Export not found"
                                )
                        );

        if (export.getExportFormat()
                .name()
                .equalsIgnoreCase("EXCEL")) {

            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }

        if (export.getExportFormat()
                .name()
                .equalsIgnoreCase("CSV")) {

            return "text/csv; charset=UTF-8";
        }

        return "application/pdf";
    }


    // ============================================================
    // PDF GENERATION
    // ============================================================

    private byte[] generatePdf(
            Report report) {

        try {

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            Document document =
                    new Document(
                            PageSize.A4,
                            36,
                            36,
                            55,
                            45
                    );

            PdfWriter writer =
                    PdfWriter.getInstance(
                            document,
                            output
                    );

            writer.setPageEvent(
                    new ReportPageEvent()
            );

            document.open();


            // ====================================================
            // COLORS
            // ====================================================

            Color DARK_GREEN =
                    new Color(
                            22,
                            101,
                            52
                    );

            Color GREEN =
                    new Color(
                            34,
                            139,
                            74
                    );

            Color LIGHT_GREEN =
                    new Color(
                            232,
                            247,
                            237
                    );

            Color BLUE =
                    new Color(
                            30,
                            100,
                            180
                    );

            Color LIGHT_BLUE =
                    new Color(
                            235,
                            244,
                            255
                    );

            Color ORANGE =
                    new Color(
                            230,
                            126,
                            34
                    );

            Color LIGHT_ORANGE =
                    new Color(
                            255,
                            244,
                            230
                    );

            Color RED =
                    new Color(
                            190,
                            45,
                            45
                    );

            Color LIGHT_RED =
                    new Color(
                            255,
                            235,
                            235
                    );

            Color GREY =
                    new Color(
                            90,
                            90,
                            90
                    );


            // ====================================================
            // FONTS
            // ====================================================

            Font coverTitle =
                    new Font(
                            Font.HELVETICA,
                            26,
                            Font.BOLD,
                            DARK_GREEN
                    );

            Font subtitleFont =
                    new Font(
                            Font.HELVETICA,
                            12,
                            Font.NORMAL,
                            GREY
                    );

            Font reportTitleFont =
                    new Font(
                            Font.HELVETICA,
                            18,
                            Font.BOLD,
                            BLUE
                    );

            Font sectionFont =
                    new Font(
                            Font.HELVETICA,
                            14,
                            Font.BOLD,
                            DARK_GREEN
                    );

            Font headingFont =
                    new Font(
                            Font.HELVETICA,
                            11,
                            Font.BOLD,
                            DARK_GREEN
                    );

            Font normalFont =
                    new Font(
                            Font.HELVETICA,
                            9.5f,
                            Font.NORMAL
                    );

            Font smallFont =
                    new Font(
                            Font.HELVETICA,
                            8,
                            Font.NORMAL,
                            GREY
                    );


            // ====================================================
            // COVER HEADER
            // ====================================================

            PdfPTable banner =
                    new PdfPTable(1);

            banner.setWidthPercentage(100);

            PdfPCell bannerCell =
                    new PdfPCell();

            bannerCell.setBackgroundColor(
                    LIGHT_GREEN
            );

            bannerCell.setBorder(
                    Rectangle.NO_BORDER
            );

            bannerCell.setPadding(18);

            Paragraph brand =
                    new Paragraph(
                            "WILDSIGHT AI",
                            coverTitle
                    );

            brand.setAlignment(
                    Paragraph.ALIGN_CENTER
            );

            bannerCell.addElement(brand);

            Paragraph system =
                    new Paragraph(
                            "WILDLIFE POPULATION INTELLIGENCE SYSTEM",
                            subtitleFont
                    );

            system.setAlignment(
                    Paragraph.ALIGN_CENTER
            );

            bannerCell.addElement(system);

            banner.addCell(bannerCell);

            document.add(banner);

            document.add(
                    new Paragraph(" ")
            );


            // ====================================================
            // REPORT TITLE
            // ====================================================

            Paragraph reportHeading =
                    new Paragraph(
                            safe(
                                    report.getReportTitle(),
                                    "Wildlife Intelligence Report"
                            ),
                            reportTitleFont
                    );

            reportHeading.setAlignment(
                    Paragraph.ALIGN_CENTER
            );

            document.add(reportHeading);

            Paragraph generated =
                    new Paragraph(
                            "Comprehensive Wildlife Survey & Intelligence Report",
                            subtitleFont
                    );

            generated.setAlignment(
                    Paragraph.ALIGN_CENTER
            );

            document.add(generated);

            document.add(
                    new Paragraph(" ")
            );


            // ====================================================
            // EXECUTIVE SUMMARY
            // ====================================================

            addSection(
                    document,
                    "EXECUTIVE SUMMARY",
                    sectionFont,
                    DARK_GREEN
            );

            String reportType =
                    safe(
                            report.getReportType(),
                            "WILDLIFE"
                    );

            String summary;

            switch (
                    reportType.toUpperCase()
            ) {

                case "HABITAT":

                    summary =
                            "This habitat intelligence report evaluates "
                            + "the ecological condition, environmental "
                            + "quality, vegetation status, degradation "
                            + "and habitat suitability associated with "
                            + "the selected wildlife survey.";

                    break;

                case "POPULATION":

                    summary =
                            "This population intelligence report "
                            + "summarizes species observations, "
                            + "estimated population, density, growth "
                            + "and migration information associated "
                            + "with the selected wildlife survey.";

                    break;

                case "BIODIVERSITY":

                    summary =
                            "This biodiversity assessment summarizes "
                            + "species richness, species distribution "
                            + "and ecological indicators useful for "
                            + "wildlife conservation planning.";

                    break;

                case "CONSERVATION":

                    summary =
                            "This conservation intelligence report "
                            + "combines population, habitat and "
                            + "environmental indicators to support "
                            + "conservation prioritization and "
                            + "management decisions.";

                    break;

                default:

                    summary =
                            "This report provides a comprehensive "
                            + "overview of wildlife monitoring "
                            + "information collected through the "
                            + "WildSight AI platform.";
            }

            addTextBox(
                    document,
                    summary,
                    LIGHT_BLUE,
                    normalFont
            );


            // ====================================================
            // SURVEY INFORMATION
            // ====================================================

            addSection(
                    document,
                    "1. SURVEY INFORMATION",
                    sectionFont,
                    DARK_GREEN
            );

            PdfPTable info =
                    new PdfPTable(2);

            info.setWidthPercentage(100);

            addTableRow(
                    info,
                    "Report ID",
                    value(
                            report.getReportId()
                    ),
                    LIGHT_GREEN,
                    normalFont
            );

            addTableRow(
                    info,
                    "Report Type",
                    reportType,
                    LIGHT_GREEN,
                    normalFont
            );

            if (report.getSurvey() != null) {

                addTableRow(
                        info,
                        "Survey ID",
                        value(
                                report.getSurvey()
                                        .getSurveyId()
                        ),
                        LIGHT_GREEN,
                        normalFont
                );

                addTableRow(
                        info,
                        "Survey Name",
                        safe(
                                report.getSurvey()
                                        .getSurveyName(),
                                "N/A"
                        ),
                        LIGHT_GREEN,
                        normalFont
                );

                addTableRow(
                        info,
                        "Protected Area",
                        safe(
                                report.getSurvey()
                                        .getProtectedArea(),
                                "N/A"
                        ),
                        LIGHT_GREEN,
                        normalFont
                );
            }

            addTableRow(
                    info,
                    "Generated By",
                    report.getGeneratedBy() != null
                            ?
                            safe(
                                    report.getGeneratedBy()
                                            .getFullName(),
                                    "N/A"
                            )
                            :
                            "N/A",
                    LIGHT_GREEN,
                    normalFont
            );

            addTableRow(
                    info,
                    "Report Status",
                    report.getReportStatus() != null
                            ?
                            report.getReportStatus()
                                    .name()
                            :
                            "N/A",
                    LIGHT_GREEN,
                    normalFont
            );

            addTableRow(
                    info,
                    "Generated At",
                    report.getGeneratedAt() != null
                            ?
                            report.getGeneratedAt()
                                    .toString()
                            :
                            "N/A",
                    LIGHT_GREEN,
                    normalFont
            );

            document.add(info);


            // ====================================================
            // HABITAT INFORMATION
            // ====================================================

            if (report.getSurvey() != null) {

                Long surveyId =
                        report.getSurvey()
                                .getSurveyId();

                List<Habitat> habitats =
                        habitatRepository
                                .findBySurveySurveyId(
                                        surveyId
                                );

                addSection(
                        document,
                        "2. HABITAT ASSESSMENT",
                        sectionFont,
                        DARK_GREEN
                );

                if (habitats.isEmpty()) {

                    addTextBox(
                            document,
                            "No habitat assessment records "
                            + "are currently available for "
                            + "this survey.",
                            LIGHT_ORANGE,
                            normalFont
                    );

                } else {

                    for (Habitat habitat :
                            habitats) {

                        PdfPTable habitatTable =
                                new PdfPTable(2);

                        habitatTable
                                .setWidthPercentage(100);

                        addTableRow(
                                habitatTable,
                                "Habitat Name",
                                safe(
                                        habitat.getHabitatName(),
                                        "N/A"
                                ),
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Habitat Type",
                                safe(
                                        habitat.getHabitatType(),
                                        "N/A"
                                ),
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Vegetation Type",
                                safe(
                                        habitat.getVegetationType(),
                                        "N/A"
                                ),
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Habitat Quality",
                                percentage(
                                        habitat
                                                .getHabitatQualityScore()
                                ),
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Degradation Level",
                                percentage(
                                        habitat
                                                .getDegradationLevel()
                                ),
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Vegetation Density",
                                percentage(
                                        habitat
                                                .getVegetationDensity()
                                ),
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Suitability Score",
                                percentage(
                                        habitat
                                                .getSuitabilityScore()
                                ),
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Temperature",
                                number(
                                        habitat
                                                .getTemperature()
                                )
                                        + " °C",
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Humidity",
                                number(
                                        habitat
                                                .getHumidity()
                                )
                                        + " %",
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Rainfall",
                                number(
                                        habitat
                                                .getRainfall()
                                ),
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Water Quality",
                                percentage(
                                        habitat
                                                .getWaterQuality()
                                ),
                                LIGHT_GREEN,
                                normalFont
                        );

                        addTableRow(
                                habitatTable,
                                "Air Quality",
                                percentage(
                                        habitat
                                                .getAirQuality()
                                ),
                                LIGHT_GREEN,
                                normalFont
                        );

                        document.add(
                                habitatTable
                        );

                        document.add(
                                new Paragraph(" ")
                        );
                    }
                }


                // =================================================
                // HABITAT INTERPRETATION
                // =================================================

                addSection(
                        document,
                        "3. HABITAT HEALTH INTERPRETATION",
                        sectionFont,
                        DARK_GREEN
                );

                addTextBox(
                        document,
                        buildHabitatInterpretation(
                                habitats
                        ),
                        LIGHT_BLUE,
                        normalFont
                );


                // =================================================
                // ENVIRONMENT
                // =================================================

                addSection(
                        document,
                        "4. ENVIRONMENTAL MONITORING",
                        sectionFont,
                        DARK_GREEN
                );

                addTextBox(
                        document,
                        buildEnvironmentalSummary(
                                habitats
                        ),
                        LIGHT_BLUE,
                        normalFont
                );


                // =================================================
                // POPULATION
                // =================================================

                List<PopulationEstimate>
                        populations =
                        populationEstimateRepository
                                .findBySurveyId(
                                        surveyId
                                );

                addSection(
                        document,
                        "5. POPULATION INTELLIGENCE",
                        sectionFont,
                        DARK_GREEN
                );

                addPopulationSummary(
                        document,
                        populations,
                        normalFont,
                        LIGHT_GREEN
                );


                // =================================================
                // SPECIES DISTRIBUTION
                // =================================================

                addSection(
                        document,
                        "6. SPECIES DISTRIBUTION",
                        sectionFont,
                        DARK_GREEN
                );

                addSpeciesTable(
                        document,
                        populations,
                        normalFont,
                        LIGHT_GREEN
                );


                // =================================================
                // MIGRATION
                // =================================================

                addSection(
                        document,
                        "7. WILDLIFE MOVEMENT & MIGRATION",
                        sectionFont,
                        DARK_GREEN
                );

                addMigrationSection(
                        document,
                        populations,
                        normalFont,
                        LIGHT_BLUE
                );


                // =================================================
                // CONSERVATION RECOMMENDATIONS
                // =================================================

                addSection(
                        document,
                        "8. CONSERVATION RECOMMENDATIONS",
                        sectionFont,
                        DARK_GREEN
                );

                addTextBox(
                        document,
                        buildRecommendations(
                                habitats,
                                populations
                        ),
                        LIGHT_GREEN,
                        normalFont
                );
            }


            // ====================================================
            // FINAL CONCLUSION
            // ====================================================

            addSection(
                    document,
                    "9. CONCLUSION",
                    sectionFont,
                    DARK_GREEN
            );

            addTextBox(
                    document,
                    "The WildSight AI platform integrates "
                    + "wildlife population intelligence, habitat "
                    + "assessment and environmental monitoring "
                    + "to support evidence-based conservation "
                    + "decision making. The indicators included "
                    + "in this report can be used by wildlife "
                    + "researchers, conservation officers and "
                    + "forest department personnel for monitoring "
                    + "and management activities.",
                    LIGHT_BLUE,
                    normalFont
            );


            document.add(
                    new Paragraph(" ")
            );

            Paragraph finalText =
                    new Paragraph(
                            "Generated by WildSight AI — "
                            + "Wildlife Population Intelligence System",
                            smallFont
                    );

            finalText.setAlignment(
                    Paragraph.ALIGN_CENTER
            );

            document.add(finalText);


            document.close();

            return output.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate detailed PDF report",
                    e
            );
        }
    }


    // ============================================================
    // POPULATION SUMMARY
    // ============================================================

    private void addPopulationSummary(
            Document document,
            List<PopulationEstimate> populations,
            Font font,
            Color color) {

        if (populations == null ||
                populations.isEmpty()) {

            addTextBox(
                    document,
                    "No population intelligence "
                    + "records are available for "
                    + "this survey.",
                    color,
                    font
            );

            return;
        }

        long totalPopulation = 0;

        double densityTotal = 0;

        double growthTotal = 0;

        int densityCount = 0;

        int growthCount = 0;

        for (
                PopulationEstimate p :
                populations
        ) {

            if (p.getEstimatedPopulation() != null) {

                totalPopulation +=
                        p.getEstimatedPopulation();
            }

            if (p.getDensity() != null) {

                densityTotal +=
                        p.getDensity()
                                .doubleValue();

                densityCount++;
            }

            if (p.getGrowthRate() != null) {

                growthTotal +=
                        p.getGrowthRate()
                                .doubleValue();

                growthCount++;
            }
        }

        double avgDensity =
                densityCount > 0
                        ?
                        densityTotal / densityCount
                        :
                        0;

        double avgGrowth =
                growthCount > 0
                        ?
                        growthTotal / growthCount
                        :
                        0;

        PdfPTable table =
                new PdfPTable(2);

        table.setWidthPercentage(100);

        addTableRow(
                table,
                "Total Estimated Population",
                String.valueOf(
                        totalPopulation
                ),
                color,
                font
        );

        addTableRow(
                table,
                "Species Richness",
                String.valueOf(
                        populations.stream()
                                .filter(
                                        p ->
                                                p.getSpecies()
                                                        != null
                                )
                                .map(
                                        p ->
                                                p.getSpecies()
                                                        .getSpeciesId()
                                )
                                .distinct()
                                .count()
                ),
                color,
                font
        );

        addTableRow(
                table,
                "Average Population Density",
                format(avgDensity),
                color,
                font
        );

        addTableRow(
                table,
                "Average Growth Rate",
                format(avgGrowth) + " %",
                color,
                font
        );

        document.add(table);
    }


    // ============================================================
    // SPECIES TABLE
    // ============================================================

    private void addSpeciesTable(
            Document document,
            List<PopulationEstimate> populations,
            Font font,
            Color color) {

        if (populations == null ||
                populations.isEmpty()) {

            addTextBox(
                    document,
                    "No species distribution data "
                    + "is currently available.",
                    color,
                    font
            );

            return;
        }

        PdfPTable table =
                new PdfPTable(4);

        table.setWidthPercentage(100);

        addHeaderCell(
                table,
                "Species",
                font
        );

        addHeaderCell(
                table,
                "Population",
                font
        );

        addHeaderCell(
                table,
                "Density",
                font
        );

        addHeaderCell(
                table,
                "Growth",
                font
        );

        for (
                PopulationEstimate p :
                populations
        ) {

            String species =
                    p.getSpecies() != null
                            ?
                            safe(
                                    p.getSpecies()
                                            .getCommonName(),
                                    "Unknown"
                            )
                            :
                            "Unknown";

            addDataCell(
                    table,
                    species,
                    font
            );

            addDataCell(
                    table,
                    value(
                            p.getEstimatedPopulation()
                    ),
                    font
            );

            addDataCell(
                    table,
                    p.getDensity() != null
                            ?
                            format(
                                    p.getDensity()
                                            .doubleValue()
                            )
                            :
                            "N/A",
                    font
            );

            addDataCell(
                    table,
                    p.getGrowthRate() != null
                            ?
                            format(
                                    p.getGrowthRate()
                                            .doubleValue()
                            )
                                    + " %"
                            :
                            "N/A",
                    font
            );
        }

        document.add(table);
    }


    // ============================================================
    // MIGRATION
    // ============================================================

    private void addMigrationSection(
            Document document,
            List<PopulationEstimate> populations,
            Font font,
            Color color) {

        if (populations == null) {

            return;
        }

        boolean found = false;

        StringBuilder text =
                new StringBuilder();

        for (
                PopulationEstimate p :
                populations
        ) {

            if (
                    p.getMigrationPattern() != null
                            &&
                    !p.getMigrationPattern()
                            .isBlank()
            ) {

                found = true;

                text.append("• ");

                if (p.getSpecies() != null) {

                    text.append(
                            safe(
                                    p.getSpecies()
                                            .getCommonName(),
                                    "Unknown species"
                            )
                    );

                    text.append(": ");
                }

                text.append(
                        p.getMigrationPattern()
                );

                text.append("\n");
            }
        }

        if (!found) {

            text.append(
                    "No migration or movement pattern "
                    + "has been recorded for this survey."
            );
        }

        addTextBox(
                document,
                text.toString(),
                color,
                font
        );
    }


    // ============================================================
    // HABITAT INTERPRETATION
    // ============================================================

    private String buildHabitatInterpretation(
            List<Habitat> habitats) {

        if (habitats == null ||
                habitats.isEmpty()) {

            return "No habitat records are available "
                    + "for interpretation.";
        }

        double quality = average(
                habitats,
                "quality"
        );

        double degradation = average(
                habitats,
                "degradation"
        );

        double vegetation = average(
                habitats,
                "vegetation"
        );

        double suitability = average(
                habitats,
                "suitability"
        );

        StringBuilder result =
                new StringBuilder();

        result.append(
                "The survey contains "
        );

        result.append(
                habitats.size()
        );

        result.append(
                " habitat assessment record(s). "
        );

        result.append(
                "Average habitat quality is "
        );

        result.append(
                format(quality)
        );

        result.append(
                "%. Average degradation is "
        );

        result.append(
                format(degradation)
        );

        result.append(
                "%. Average vegetation density is "
        );

        result.append(
                format(vegetation)
        );

        result.append(
                "% and average habitat suitability "
                + "is "
        );

        result.append(
                format(suitability)
        );

        result.append(
                "%."
        );

        result.append("\n\n");

        if (quality >= 75) {

            result.append(
                    "Overall habitat quality is strong "
                    + "and indicates favourable ecological "
                    + "conditions."
            );

        } else if (quality >= 50) {

            result.append(
                    "Habitat quality is moderate and "
                    + "should be monitored for early signs "
                    + "of ecological stress."
            );

        } else {

            result.append(
                    "Habitat quality is low and should "
                    + "receive priority conservation "
                    + "attention."
            );
        }

        return result.toString();
    }


    // ============================================================
    // ENVIRONMENT SUMMARY
    // ============================================================

    private String buildEnvironmentalSummary(
            List<Habitat> habitats) {

        if (habitats == null ||
                habitats.isEmpty()) {

            return "Environmental information is "
                    + "not available for this survey.";
        }

        double temperature =
                averageTemperature(
                        habitats
                );

        double humidity =
                averageHumidity(
                        habitats
                );

        double rainfall =
                averageRainfall(
                        habitats
                );

        double water =
                averageWaterQuality(
                        habitats
                );

        double air =
                averageAirQuality(
                        habitats
                );

        return
                "Average environmental conditions recorded "
                + "for the survey include a temperature of "
                + format(temperature)
                + " °C, humidity of "
                + format(humidity)
                + "%, rainfall of "
                + format(rainfall)
                + ", water quality of "
                + format(water)
                + "% and air quality of "
                + format(air)
                + "%. These indicators provide a combined "
                + "view of environmental conditions affecting "
                + "the monitored habitat.";
    }


    // ============================================================
    // RECOMMENDATIONS
    // ============================================================

    private String buildRecommendations(
            List<Habitat> habitats,
            List<PopulationEstimate> populations) {

        StringBuilder result =
                new StringBuilder();

        double quality =
                average(
                        habitats,
                        "quality"
                );

        double degradation =
                average(
                        habitats,
                        "degradation"
                );

        double vegetation =
                average(
                        habitats,
                        "vegetation"
                );

        double suitability =
                average(
                        habitats,
                        "suitability"
                );

        if (quality < 50) {

            result.append(
                    "• Prioritize habitat restoration "
                    + "and ecological recovery measures.\n"
            );

        } else if (quality < 75) {

            result.append(
                    "• Increase habitat monitoring and "
                    + "identify sources of ecological stress.\n"
            );

        } else {

            result.append(
                    "• Maintain current habitat protection "
                    + "and monitoring practices.\n"
            );
        }

        if (degradation >= 50) {

            result.append(
                    "• Immediate action is recommended "
                    + "to address habitat degradation.\n"
            );
        }

        if (vegetation < 50) {

            result.append(
                    "• Consider vegetation restoration "
                    + "and native flora regeneration.\n"
            );
        }

        if (suitability < 50) {

            result.append(
                    "• Investigate factors limiting "
                    + "habitat suitability for wildlife.\n"
            );
        }

        if (
                populations != null
                        &&
                !populations.isEmpty()
        ) {

            boolean declining =
                    populations.stream()
                            .anyMatch(
                                    p ->
                                            p.getGrowthRate()
                                                    != null
                                                    &&
                                            p.getGrowthRate()
                                                    .doubleValue()
                                                    < 0
                            );

            if (declining) {

                result.append(
                        "• Species showing population "
                        + "decline should receive focused "
                        + "monitoring and conservation "
                        + "attention.\n"
                );
            }
        }

        result.append(
                "• Continue periodic wildlife surveys "
                + "to maintain reliable longitudinal "
                + "intelligence."
        );

        return result.toString();
    }


    // ============================================================
    // PDF HELPERS
    // ============================================================

    private void addSection(
            Document document,
            String title,
            Font font,
            Color color) {

        Paragraph paragraph =
                new Paragraph(
                        title,
                        font
                );

        paragraph.setSpacingBefore(10);

        paragraph.setSpacingAfter(7);

        document.add(paragraph);
    }


    private void addTextBox(
            Document document,
            String text,
            Color color,
            Font font) {

        PdfPTable table =
                new PdfPTable(1);

        table.setWidthPercentage(100);

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                safe(text, "N/A"),
                                font
                        )
                );

        cell.setBackgroundColor(color);

        cell.setBorder(
                Rectangle.NO_BORDER
        );

        cell.setPadding(10);

        table.addCell(cell);

        document.add(table);

        document.add(
                new Paragraph(" ")
        );
    }


    private void addTableRow(
            PdfPTable table,
            String key,
            String value,
            Color color,
            Font font) {

        PdfPCell keyCell =
                new PdfPCell(
                        new Phrase(
                                safe(key, ""),
                                new Font(
                                        Font.HELVETICA,
                                        9,
                                        Font.BOLD,
                                        new Color(
                                                22,
                                                101,
                                                52
                                        )
                                )
                        )
                );

        keyCell.setBackgroundColor(color);

        keyCell.setPadding(7);

        PdfPCell valueCell =
                new PdfPCell(
                        new Phrase(
                                safe(value, "N/A"),
                                font
                        )
                );

        valueCell.setPadding(7);

        table.addCell(keyCell);

        table.addCell(valueCell);
    }


    private void addHeaderCell(
            PdfPTable table,
            String value,
            Font font) {

        Font headerFont =
                new Font(
                        Font.HELVETICA,
                        9,
                        Font.BOLD,
                        Color.WHITE
                );

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                value,
                                headerFont
                        )
                );

        cell.setBackgroundColor(
                new Color(
                        22,
                        101,
                        52
                )
        );

        cell.setPadding(7);

        cell.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );

        table.addCell(cell);
    }


    private void addDataCell(
            PdfPTable table,
            String value,
            Font font) {

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                safe(value, "N/A"),
                                font
                        )
                );

        cell.setPadding(6);

        table.addCell(cell);
    }


    // ============================================================
    // CALCULATIONS
    // ============================================================

    private double average(
            List<Habitat> habitats,
            String type) {

        if (habitats == null ||
                habitats.isEmpty()) {

            return 0;
        }

        double total = 0;

        int count = 0;

        for (Habitat h : habitats) {

            Double value = null;

            if ("quality".equals(type)) {

                value =
                        h.getHabitatQualityScore();

            } else if (
                    "degradation".equals(type)
            ) {

                value =
                        h.getDegradationLevel();

            } else if (
                    "vegetation".equals(type)
            ) {

                value =
                        h.getVegetationDensity();

            } else if (
                    "suitability".equals(type)
            ) {

                value =
                        h.getSuitabilityScore();
            }

            if (value != null) {

                total += value;

                count++;
            }
        }

        return count == 0
                ?
                0
                :
                total / count;
    }


    private double averageTemperature(
            List<Habitat> habitats) {

        return averageField(
                habitats,
                1
        );
    }


    private double averageHumidity(
            List<Habitat> habitats) {

        return averageField(
                habitats,
                2
        );
    }


    private double averageRainfall(
            List<Habitat> habitats) {

        return averageField(
                habitats,
                3
        );
    }


    private double averageWaterQuality(
            List<Habitat> habitats) {

        return averageField(
                habitats,
                4
        );
    }


    private double averageAirQuality(
            List<Habitat> habitats) {

        return averageField(
                habitats,
                5
        );
    }


    private double averageField(
            List<Habitat> habitats,
            int field) {

        if (habitats == null ||
                habitats.isEmpty()) {

            return 0;
        }

        double total = 0;

        int count = 0;

        for (Habitat h : habitats) {

            Double value = null;

            switch (field) {

                case 1:
                    value =
                            h.getTemperature();
                    break;

                case 2:
                    value =
                            h.getHumidity();
                    break;

                case 3:
                    value =
                            h.getRainfall();
                    break;

                case 4:
                    value =
                            h.getWaterQuality();
                    break;

                case 5:
                    value =
                            h.getAirQuality();
                    break;
            }

            if (value != null) {

                total += value;

                count++;
            }
        }

        return count == 0
                ?
                0
                :
                total / count;
    }


    // ============================================================
    // UTILITY
    // ============================================================

    private String safe(
            String value,
            String fallback) {

        return value == null ||
                value.isBlank()
                ?
                fallback
                :
                value;
    }


    private String value(
            Object value) {

        return value == null
                ?
                "N/A"
                :
                String.valueOf(value);
    }


    private String number(
            Double value) {

        return value == null
                ?
                "N/A"
                :
                format(value);
    }


    private String percentage(
            Double value) {

        return value == null
                ?
                "N/A"
                :
                format(value) + " %";
    }


    private String format(
            double value) {

        return String.format(
                "%.2f",
                value
        );
    }


    // ============================================================
    // PAGE FOOTER
    // ============================================================

    private static class ReportPageEvent
            extends PdfPageEventHelper {

        @Override
        public void onEndPage(
                PdfWriter writer,
                Document document) {

            PdfPTable footer =
                    new PdfPTable(2);

            try {

                footer.setWidths(
                        new float[]{
                                1,
                                1
                        }
                );

                footer.setTotalWidth(
                        document
                                .right()
                                -
                        document.left()
                );

                footer.setLockedWidth(
                        true
                );

                Font footerFont =
                        new Font(
                                Font.HELVETICA,
                                7,
                                Font.NORMAL,
                                new Color(
                                        100,
                                        100,
                                        100
                                )
                        );

                PdfPCell left =
                        new PdfPCell(
                                new Phrase(
                                        "WildSight AI | "
                                        + "Wildlife Population "
                                        + "Intelligence System",
                                        footerFont
                                )
                        );

                left.setBorder(
                        Rectangle.NO_BORDER
                );

                PdfPCell right =
                        new PdfPCell(
                                new Phrase(
                                        "Page "
                                        +
                                        writer
                                                .getPageNumber(),
                                        footerFont
                                )
                        );

                right.setBorder(
                        Rectangle.NO_BORDER
                );

                right.setHorizontalAlignment(
                        Element.ALIGN_RIGHT
                );

                footer.addCell(left);

                footer.addCell(right);

                footer.writeSelectedRows(
                        0,
                        -1,
                        document.left(),
                        document.bottom()
                                - 15,
                        writer.getDirectContent()
                );

            } catch (Exception ignored) {
            }
        }
    }


    // ============================================================
    // EXCEL
    // ============================================================

    private byte[] generateExcel(
            Report report) {

        try (
                Workbook workbook =
                        new XSSFWorkbook()
        ) {

            Sheet sheet =
                    workbook.createSheet(
                            "WildSight Report"
                    );

            int rowNumber = 0;

            Row title =
                    sheet.createRow(
                            rowNumber++
                    );

            title.createCell(0)
                    .setCellValue(
                            "WILDSIGHT AI - "
                            + "WILDLIFE INTELLIGENCE REPORT"
                    );

            rowNumber++;

            addExcelRow(
                    sheet,
                    rowNumber++,
                    "Report ID",
                    value(
                            report.getReportId()
                    )
            );

            addExcelRow(
                    sheet,
                    rowNumber++,
                    "Report Title",
                    safe(
                            report.getReportTitle(),
                            "N/A"
                    )
            );

            addExcelRow(
                    sheet,
                    rowNumber++,
                    "Report Type",
                    safe(
                            report.getReportType(),
                            "N/A"
                    )
            );

            if (report.getSurvey() != null) {

                addExcelRow(
                        sheet,
                        rowNumber++,
                        "Survey",
                        safe(
                                report.getSurvey()
                                        .getSurveyName(),
                                "N/A"
                        )
                );

                addExcelRow(
                        sheet,
                        rowNumber++,
                        "Protected Area",
                        safe(
                                report.getSurvey()
                                        .getProtectedArea(),
                                "N/A"
                        )
                );
            }

            addExcelRow(
                    sheet,
                    rowNumber++,
                    "Generated By",
                    report.getGeneratedBy() != null
                            ?
                            safe(
                                    report.getGeneratedBy()
                                            .getFullName(),
                                    "N/A"
                            )
                            :
                            "N/A"
            );

            addExcelRow(
                    sheet,
                    rowNumber++,
                    "Status",
                    report.getReportStatus() != null
                            ?
                            report.getReportStatus()
                                    .name()
                            :
                            "N/A"
            );

            if (report.getSurvey() != null) {

                Long surveyId =
                        report.getSurvey()
                                .getSurveyId();

                List<PopulationEstimate>
                        populations =
                        populationEstimateRepository
                                .findBySurveyId(
                                        surveyId
                                );

                rowNumber += 2;

                Row speciesTitle =
                        sheet.createRow(
                                rowNumber++
                        );

                speciesTitle
                        .createCell(0)
                        .setCellValue(
                                "SPECIES DISTRIBUTION"
                        );

                Row headers =
                        sheet.createRow(
                                rowNumber++
                        );

                headers.createCell(0)
                        .setCellValue(
                                "Species"
                        );

                headers.createCell(1)
                        .setCellValue(
                                "Population"
                        );

                headers.createCell(2)
                        .setCellValue(
                                "Density"
                        );

                headers.createCell(3)
                        .setCellValue(
                                "Growth Rate"
                        );

                for (
                        PopulationEstimate p :
                        populations
                ) {

                    Row row =
                            sheet.createRow(
                                    rowNumber++
                            );

                    row.createCell(0)
                            .setCellValue(
                                    p.getSpecies() != null
                                            ?
                                            safe(
                                                    p.getSpecies()
                                                            .getCommonName(),
                                                    "Unknown"
                                            )
                                            :
                                            "Unknown"
                            );

                    row.createCell(1)
                            .setCellValue(
                                    p.getEstimatedPopulation() != null
                                            ?
                                            p.getEstimatedPopulation()
                                                    .doubleValue()
                                            :
                                            0
                            );

                    row.createCell(2)
                            .setCellValue(
                                    p.getDensity() != null
                                            ?
                                            p.getDensity()
                                                    .doubleValue()
                                            :
                                            0
                            );

                    row.createCell(3)
                            .setCellValue(
                                    p.getGrowthRate() != null
                                            ?
                                            p.getGrowthRate()
                                                    .doubleValue()
                                            :
                                            0
                            );
                }
            }

            for (
                    int i = 0;
                    i < 4;
                    i++
            ) {

                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            workbook.write(output);

            return output.toByteArray();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to generate Excel report",
                    e
            );
        }
    }


    private void addExcelRow(
            Sheet sheet,
            int rowNumber,
            String key,
            String value) {

        Row row =
                sheet.createRow(
                        rowNumber
                );

        row.createCell(0)
                .setCellValue(key);

        row.createCell(1)
                .setCellValue(
                        safe(
                                value,
                                "N/A"
                        )
                );
    }



    // ============================================================
    // CSV GENERATION
    // ============================================================

    private byte[] generateCsv(
            Report report) {

        try {

            StringBuilder csv =
                    new StringBuilder();

            // UTF-8 BOM helps Excel open the CSV correctly.
            csv.append('\uFEFF');

            csv.append(
                    "WILDSIGHT AI - WILDLIFE INTELLIGENCE REPORT"
            );
            csv.append("\n\n");

            csv.append("Field,Value\n");

            addCsvRow(
                    csv,
                    "Report ID",
                    value(report.getReportId())
            );

            addCsvRow(
                    csv,
                    "Report Title",
                    safe(
                            report.getReportTitle(),
                            "N/A"
                    )
            );

            addCsvRow(
                    csv,
                    "Report Type",
                    safe(
                            report.getReportType(),
                            "N/A"
                    )
            );

            if (report.getSurvey() != null) {

                addCsvRow(
                        csv,
                        "Survey ID",
                        value(
                                report.getSurvey()
                                        .getSurveyId()
                        )
                );

                addCsvRow(
                        csv,
                        "Survey Name",
                        safe(
                                report.getSurvey()
                                        .getSurveyName(),
                                "N/A"
                        )
                );

                addCsvRow(
                        csv,
                        "Protected Area",
                        safe(
                                report.getSurvey()
                                        .getProtectedArea(),
                                "N/A"
                        )
                );
            }

            addCsvRow(
                    csv,
                    "Generated By",
                    report.getGeneratedBy() != null
                            ?
                            safe(
                                    report.getGeneratedBy()
                                            .getFullName(),
                                    "N/A"
                            )
                            :
                            "N/A"
            );

            addCsvRow(
                    csv,
                    "Status",
                    report.getReportStatus() != null
                            ?
                            report.getReportStatus()
                                    .name()
                            :
                            "N/A"
            );

            addCsvRow(
                    csv,
                    "Generated At",
                    report.getGeneratedAt() != null
                            ?
                            report.getGeneratedAt()
                                    .toString()
                            :
                            "N/A"
            );


            // ====================================================
            // HABITAT ASSESSMENT
            // ====================================================

            csv.append("\n");
            csv.append("HABITAT ASSESSMENT\n");

            csv.append(
                    "Habitat Name,Habitat Type,"
                    + "Vegetation Type,Habitat Quality,"
                    + "Degradation Level,Vegetation Density,"
                    + "Suitability Score,Temperature,"
                    + "Humidity,Rainfall,Water Quality,"
                    + "Air Quality\n"
            );

            if (report.getSurvey() != null) {

                Long surveyId =
                        report.getSurvey()
                                .getSurveyId();

                List<Habitat> habitats =
                        habitatRepository
                                .findBySurveySurveyId(
                                        surveyId
                                );

                if (habitats != null &&
                        !habitats.isEmpty()) {

                    for (Habitat habitat :
                            habitats) {

                        addCsvLine(
                                csv,
                                safe(
                                        habitat.getHabitatName(),
                                        "N/A"
                                ),
                                safe(
                                        habitat.getHabitatType(),
                                        "N/A"
                                ),
                                safe(
                                        habitat.getVegetationType(),
                                        "N/A"
                                ),
                                percentageCsv(
                                        habitat
                                                .getHabitatQualityScore()
                                ),
                                percentageCsv(
                                        habitat
                                                .getDegradationLevel()
                                ),
                                percentageCsv(
                                        habitat
                                                .getVegetationDensity()
                                ),
                                percentageCsv(
                                        habitat
                                                .getSuitabilityScore()
                                ),
                                numberCsv(
                                        habitat.getTemperature()
                                ),
                                numberCsv(
                                        habitat.getHumidity()
                                ),
                                numberCsv(
                                        habitat.getRainfall()
                                ),
                                percentageCsv(
                                        habitat.getWaterQuality()
                                ),
                                percentageCsv(
                                        habitat.getAirQuality()
                                )
                        );
                    }

                } else {

                    csv.append(
                            "\"No habitat records available\"\n"
                    );
                }


                // =================================================
                // SPECIES / POPULATION
                // =================================================

                csv.append("\n");
                csv.append("SPECIES DISTRIBUTION\n");

                csv.append(
                        "Species,Population,Density,Growth Rate,"
                        + "Migration Pattern\n"
                );

                List<PopulationEstimate>
                        populations =
                        populationEstimateRepository
                                .findBySurveyId(
                                        surveyId
                                );

                if (populations != null &&
                        !populations.isEmpty()) {

                    for (
                            PopulationEstimate p :
                            populations
                    ) {

                        addCsvLine(
                                csv,
                                p.getSpecies() != null
                                        ?
                                        safe(
                                                p.getSpecies()
                                                        .getCommonName(),
                                                "Unknown"
                                        )
                                        :
                                        "Unknown",
                                p.getEstimatedPopulation() != null
                                        ?
                                        String.valueOf(
                                                p.getEstimatedPopulation()
                                        )
                                        :
                                        "0",
                                p.getDensity() != null
                                        ?
                                        format(
                                                p.getDensity()
                                                        .doubleValue()
                                        )
                                        :
                                        "N/A",
                                p.getGrowthRate() != null
                                        ?
                                        format(
                                                p.getGrowthRate()
                                                        .doubleValue()
                                        )
                                        :
                                        "N/A",
                                p.getMigrationPattern() != null
                                        ?
                                        safe(
                                                p.getMigrationPattern(),
                                                "N/A"
                                        )
                                        :
                                        "N/A"
                        );
                    }

                } else {

                    csv.append(
                            "\"No population records available\"\n"
                    );
                }

            } else {

                csv.append(
                        "\"No survey information available\"\n"
                );
            }

            return csv.toString()
                    .getBytes(
                            StandardCharsets.UTF_8
                    );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate CSV report",
                    e
            );
        }
    }


    private void addCsvRow(
            StringBuilder csv,
            String key,
            String value) {

        csv.append(
                csvValue(key)
        );

        csv.append(",");

        csv.append(
                csvValue(value)
        );

        csv.append("\n");
    }


    private void addCsvLine(
            StringBuilder csv,
            String... values) {

        for (
                int i = 0;
                i < values.length;
                i++
        ) {

            if (i > 0) {

                csv.append(",");
            }

            csv.append(
                    csvValue(values[i])
            );
        }

        csv.append("\n");
    }


    private String csvValue(
            String value) {

        if (value == null) {

            return "\"\"";
        }

        String escaped =
                value.replace(
                        "\"",
                        "\"\""
                );

        return "\"" +
                escaped +
                "\"";
    }


    private String numberCsv(
            Double value) {

        return value == null
                ?
                "N/A"
                :
                format(value);
    }


    private String percentageCsv(
            Double value) {

        return value == null
                ?
                "N/A"
                :
                format(value);
    }


    // ============================================================
    // RESPONSE MAPPING
    // ============================================================

    private ReportExportResponse mapToResponse(
            ReportExport export) {

        return ReportExportResponse.builder()

                .exportId(
                        export.getExportId()
                )

                .reportId(
                        export.getReport()
                                .getReportId()
                )

                .reportTitle(
                        export.getReport()
                                .getReportTitle()
                )

                .exportFormat(
                        export.getExportFormat()
                )

                .exportedAt(
                        export.getExportedAt()
                )

                .exportPath(
                        export.getExportPath()
                )

                .build();
    }
}