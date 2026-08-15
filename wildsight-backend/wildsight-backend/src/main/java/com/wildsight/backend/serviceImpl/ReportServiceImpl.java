package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.ReportRequest;
import com.wildsight.backend.dto.ReportResponse;
import com.wildsight.backend.entity.Report;
import com.wildsight.backend.entity.ReportStatus;
import com.wildsight.backend.entity.Survey;
import com.wildsight.backend.entity.User;
import com.wildsight.backend.repository.BiodiversityScoreRepository;
import com.wildsight.backend.repository.HabitatRepository;
import com.wildsight.backend.repository.PopulationEstimateRepository;
import com.wildsight.backend.repository.ReportRepository;
import com.wildsight.backend.repository.SurveyRepository;
import com.wildsight.backend.repository.UserRepository;
import com.wildsight.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;
    private final PopulationEstimateRepository populationRepository;

private final BiodiversityScoreRepository biodiversityRepository;

private final HabitatRepository habitatRepository;

    @Override
    public ReportResponse createReport(ReportRequest request) {

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        User user = userRepository.findById(request.getGeneratedBy())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Report report = Report.builder()
                .survey(survey)
                .generatedBy(user)
                .reportTitle(request.getReportTitle())
                .reportType(request.getReportType())
                .reportPath(request.getReportPath())
                .reportStatus(request.getReportStatus())
                .build();

        report = reportRepository.save(report);

        return mapToResponse(report);
    }

    @Override
    public List<ReportResponse> getAllReports() {

        return reportRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ReportResponse getReportById(Long id) {

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        return mapToResponse(report);
    }

    @Override
    public ReportResponse updateReport(Long id,
                                       ReportRequest request) {

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        User user = userRepository.findById(request.getGeneratedBy())
                .orElseThrow(() -> new RuntimeException("User not found"));

        report.setSurvey(survey);
        report.setGeneratedBy(user);
        report.setReportTitle(request.getReportTitle());
        report.setReportType(request.getReportType());
        report.setReportPath(request.getReportPath());
        report.setReportStatus(request.getReportStatus());

        report = reportRepository.save(report);

        return mapToResponse(report);
    }

    @Override
    public void deleteReport(Long id) {

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        reportRepository.delete(report);
    }

    private ReportResponse mapToResponse(Report report) {

        return ReportResponse.builder()
                .reportId(report.getReportId())
                .surveyId(report.getSurvey().getSurveyId())
                .surveyName(report.getSurvey().getSurveyName())
                .generatedBy(report.getGeneratedBy().getUserId())
                .generatedByName(report.getGeneratedBy().getFullName())
                .reportTitle(report.getReportTitle())
                .reportType(report.getReportType())
                .reportPath(report.getReportPath())
                .generatedAt(report.getGeneratedAt())
                .reportStatus(report.getReportStatus())
                .build();
    }
    @Override
public ReportResponse generateSystemReport(
        String type,
        Long surveyId,
        Long userId
){


Survey survey =
surveyRepository.findById(surveyId)
.orElseThrow(
()->new RuntimeException("Survey not found")
);



User user =
userRepository.findById(userId)
.orElseThrow(
()->new RuntimeException("User not found")
);



String title;


switch(type.toUpperCase()){


case "POPULATION":

title="Wildlife Population Intelligence Report";

break;



case "BIODIVERSITY":

title="Biodiversity Assessment Report";

break;



case "HABITAT":

title="Habitat Health Analysis Report";

break;



case "CONSERVATION":

title="Conservation Recommendation Report";

break;



default:

throw new RuntimeException(
"Invalid report type"
);

}




Report report =
Report.builder()

.survey(survey)

.generatedBy(user)

.reportTitle(title)

.reportType(type)

.reportPath(
"/reports/"+type.toLowerCase()
)

.reportStatus(
ReportStatus.COMPLETED
)

.build();



return mapToResponse(
reportRepository.save(report)
);


}
}