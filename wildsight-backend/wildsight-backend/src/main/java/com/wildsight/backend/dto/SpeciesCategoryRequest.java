package com.wildsight.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeciesCategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 3, max = 100,
            message = "Category name must be between 3 and 100 characters")
    private String categoryName;

    @Size(max = 500,
            message = "Description cannot exceed 500 characters")
    private String description;
}