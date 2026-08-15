package com.wildsight.backend.repository;

import com.wildsight.backend.entity.SpeciesCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpeciesCategoryRepository
        extends JpaRepository<SpeciesCategory, Long> {

    Optional<SpeciesCategory> findByCategoryName(String categoryName);

}