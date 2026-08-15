package com.wildsight.backend.repository;

import com.wildsight.backend.entity.EndangeredSpecies;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EndangeredSpeciesRepository
        extends JpaRepository<EndangeredSpecies, Long> {

}