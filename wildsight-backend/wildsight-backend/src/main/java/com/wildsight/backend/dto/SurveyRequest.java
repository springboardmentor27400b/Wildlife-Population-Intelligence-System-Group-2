package com.wildsight.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SurveyRequest{

    @NotNull(message = "User Id is required")
    private Long userId;

    @NotBlank(message = "Survey name is required")
    @Size(min = 3, max = 100,
            message = "Survey name must be between 3 and 100 characters")
    private String surveyName;

    @Size(max = 500,
            message = "Description cannot exceed 500 characters")
    private String description;

    @Size(max = 100,
            message = "Habitat type cannot exceed 100 characters")
    private String habitatType;

    @Size(max = 100,
            message = "Protected area cannot exceed 100 characters")
    private String protectedArea;

    @NotNull(message = "Survey date is required")
    private LocalDate surveyDate;

    @NotBlank(message = "Status is required")
    @Size(max = 30,
            message = "Status cannot exceed 30 characters")
    private String status;
}