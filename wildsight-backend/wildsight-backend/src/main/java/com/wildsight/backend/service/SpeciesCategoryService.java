package com.wildsight.backend.service;

import com.wildsight.backend.dto.SpeciesCategoryRequest;
import com.wildsight.backend.dto.SpeciesCategoryResponse;

import java.util.List;

public interface SpeciesCategoryService {

    SpeciesCategoryResponse createCategory(SpeciesCategoryRequest request);

    List<SpeciesCategoryResponse> getAllCategories();

    SpeciesCategoryResponse getCategoryById(Long id);

    SpeciesCategoryResponse updateCategory(Long id,
                                           SpeciesCategoryRequest request);

    void deleteCategory(Long id);
}