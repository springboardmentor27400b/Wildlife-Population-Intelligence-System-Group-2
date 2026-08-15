package com.wildsight.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitatClassificationResponse {

    private Long totalHabitats;

    private Long forestHabitats;

    private Long grasslandHabitats;

    private Long wetlandHabitats;

    private Long mountainHabitats;

    private Long riverHabitats;

    private String dominantHabitat;

}