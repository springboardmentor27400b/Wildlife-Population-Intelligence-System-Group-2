package com.wildsight.backend.repository;


import com.wildsight.backend.entity.Species;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface SpeciesRepository
        extends JpaRepository<Species, Long> {


    Optional<Species> findByCommonName(String commonName);


    boolean existsByCommonNameIgnoreCase(String commonName);



    // ==============================
    // Conservation Intelligence
    // ==============================


    @Query("""
            SELECT COUNT(s)
            FROM Species s
            WHERE LOWER(s.iucnStatus)
            IN ('endangered','critically endangered')
            """)
    Long countEndangeredSpecies();



    @Query("""
            SELECT COUNT(s)
            FROM Species s
            WHERE LOWER(s.iucnStatus)
            IN ('vulnerable','near threatened')
            """)
    Long countVulnerableSpecies();



    @Query("""
            SELECT COUNT(s)
            FROM Species s
            WHERE LOWER(s.iucnStatus)
            IN ('least concern','stable')
            """)
    Long countStableSpecies();

}