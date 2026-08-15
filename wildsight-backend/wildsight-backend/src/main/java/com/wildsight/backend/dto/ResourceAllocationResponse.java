package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceAllocationResponse {

    private String budgetPriority;

    private Integer fieldStaffRequired;

    private Integer cameraTrapsRequired;

    private Integer dronesRequired;

    private String deploymentStrategy;

}