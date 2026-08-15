package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.SpeciesCategoryRequest;
import com.wildsight.backend.dto.SpeciesCategoryResponse;
import com.wildsight.backend.entity.SpeciesCategory;
import com.wildsight.backend.repository.SpeciesCategoryRepository;
import com.wildsight.backend.service.SpeciesCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpeciesCategoryServiceImpl implements SpeciesCategoryService {

    private final SpeciesCategoryRepository repository;

    @Override
    public SpeciesCategoryResponse createCategory(SpeciesCategoryRequest request) {

        if (repository.findByCategoryName(request.getCategoryName()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Category already exists"
            );
        }

        SpeciesCategory category = SpeciesCategory.builder()
                .categoryName(request.getCategoryName())
                .description(request.getDescription())
                .build();

        category = repository.save(category);

        return mapToResponse(category);
    }

    @Override
    public List<SpeciesCategoryResponse> getAllCategories() {

        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public SpeciesCategoryResponse getCategoryById(Long id) {

        SpeciesCategory category = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Category not found"
                ));

        return mapToResponse(category);
    }

    @Override
    public SpeciesCategoryResponse updateCategory(Long id,
                                                  SpeciesCategoryRequest request) {

        SpeciesCategory category = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Category not found"
                ));

        repository.findByCategoryName(request.getCategoryName())
                .ifPresent(existing -> {
                    if (!existing.getCategoryId().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Category name already exists"
                        );
                    }
                });

        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());

        category = repository.save(category);

        return mapToResponse(category);
    }

    @Override
    public void deleteCategory(Long id) {

        SpeciesCategory category = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Category not found"
                ));

        repository.delete(category);
    }

    private SpeciesCategoryResponse mapToResponse(SpeciesCategory category) {

        return SpeciesCategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .build();
    }
}