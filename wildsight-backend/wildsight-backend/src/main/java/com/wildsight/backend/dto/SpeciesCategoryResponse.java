package com.wildsight.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeciesCategoryResponse {

    private Long categoryId;

    private String categoryName;

    private String description;
}