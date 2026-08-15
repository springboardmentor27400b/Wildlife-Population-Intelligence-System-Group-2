package com.wildsight.backend.repository;

import com.wildsight.backend.entity.DetectionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetectionResultRepository
        extends JpaRepository<DetectionResult, Long> {

    long countByCategory(String category);

    long countByConservationStatus(String status);

    long countBySourceType(String sourceType);

    @Query("""
            SELECT COUNT(DISTINCT d.species)
            FROM DetectionResult d
            """)
    long countTotalSpecies();

    @Query("""
            SELECT d.species, COUNT(d)
            FROM DetectionResult d
            GROUP BY d.species
            ORDER BY COUNT(d) DESC
            """)
    List<Object[]> getSpeciesDistribution();

    @Query("""
            SELECT d.category, COUNT(d)
            FROM DetectionResult d
            GROUP BY d.category
            ORDER BY COUNT(d) DESC
            """)
    List<Object[]> getCategoryDistribution();

    @Query("""
            SELECT d.conservationStatus, COUNT(d)
            FROM DetectionResult d
            GROUP BY d.conservationStatus
            """)
    List<Object[]> getConservationDistribution();

    @Query("""
            SELECT d.species, COUNT(d)
            FROM DetectionResult d
            GROUP BY d.species
            ORDER BY COUNT(d) DESC
            """)
    List<Object[]> getTopDetectedSpecies();

    @Query("""
        SELECT d.conservationStatus, COUNT(d)
        FROM DetectionResult d
        GROUP BY d.conservationStatus
        """)
List<Object[]> getConservationStatusDistribution();
}