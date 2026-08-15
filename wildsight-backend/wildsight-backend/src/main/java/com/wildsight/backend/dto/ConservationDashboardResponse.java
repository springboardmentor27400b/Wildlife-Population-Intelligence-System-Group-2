package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConservationDashboardResponse {

    private ConservationPriorityResponse priority;

    private HabitatRestorationResponse restoration;

    private ProtectionStrategyResponse protection;

    private MonitoringOptimizationResponse monitoring;

    private ResourceAllocationResponse resources;

}