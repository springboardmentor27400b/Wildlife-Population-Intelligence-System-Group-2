
package com.wildsight.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EcosystemMonitoringResponse {

    private Double averageEcosystemHealth;

    private String monitoringStatus;

    private String riskLevel;

}