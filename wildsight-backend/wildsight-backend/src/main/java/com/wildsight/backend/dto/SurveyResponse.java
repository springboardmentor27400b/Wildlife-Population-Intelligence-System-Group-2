package com.wildsight.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyResponse {

    private Long surveyId;

    private Long userId;

    private String surveyName;

    private String description;

    private String habitatType;

    private String protectedArea;

    private LocalDate surveyDate;

    private String status;

    private Timestamp createdAt;
}