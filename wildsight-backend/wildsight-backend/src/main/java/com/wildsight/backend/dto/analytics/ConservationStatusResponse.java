package com.wildsight.backend.dto.analytics;


import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class ConservationStatusResponse {


    private String status;

    private Long count;

}