package com.wildsight.backend.repository;

import com.wildsight.backend.entity.PopulationEstimate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;


@Repository
public interface PopulationEstimateRepository
        extends JpaRepository<PopulationEstimate, Long> {


    // ============================================================
    // TOTAL POPULATION
    // ============================================================

    @Query("""
            SELECT COALESCE(SUM(p.estimatedPopulation),0)
            FROM PopulationEstimate p
            """)
    Long getTotalEstimatedPopulation();


    // ============================================================
    // AVERAGE DENSITY
    // ============================================================

    @Query("""
            SELECT COALESCE(AVG(p.density),0)
            FROM PopulationEstimate p
            """)
    BigDecimal getAverageDensity();


    // ============================================================
    // AVERAGE GROWTH RATE
    // ============================================================

    @Query("""
            SELECT COALESCE(AVG(p.growthRate),0)
            FROM PopulationEstimate p
            """)
    BigDecimal getAverageGrowthRate();


    // ============================================================
    // SPECIES RICHNESS
    // ============================================================

    @Query("""
            SELECT COUNT(DISTINCT p.species.speciesId)
            FROM PopulationEstimate p
            """)
    Long getSpeciesCount();


    // ============================================================
    // SPECIES DISTRIBUTION
    // ============================================================

    @Query("""
            SELECT p
            FROM PopulationEstimate p
            JOIN FETCH p.species
            JOIN FETCH p.survey
            ORDER BY p.estimatedPopulation DESC
            """)
    List<PopulationEstimate> getSpeciesDistribution();


    // ============================================================
    // MIGRATION ANALYSIS
    // ============================================================

    @Query("""
            SELECT p
            FROM PopulationEstimate p
            JOIN FETCH p.species
            JOIN FETCH p.survey
            WHERE p.migrationPattern IS NOT NULL
            """)
    List<PopulationEstimate> getMigrationPatterns();


    // ============================================================
    // SURVEY-SPECIFIC POPULATION DATA
    // ============================================================
    // Used by the detailed PDF report.
    //
    // This retrieves only the population estimates
    // belonging to the selected survey.
    // ============================================================

    @Query("""
            SELECT p
            FROM PopulationEstimate p
            JOIN FETCH p.species
            JOIN FETCH p.survey
            WHERE p.survey.surveyId = :surveyId
            ORDER BY p.estimatedPopulation DESC
            """)
    List<PopulationEstimate> findBySurveyId(
            @Param("surveyId") Long surveyId
    );


    // ============================================================
    // LOCATION BASED POPULATION
    // ============================================================

    @Query("""
            SELECT COALESCE(SUM(p.estimatedPopulation),0)
            FROM PopulationEstimate p
            WHERE p.survey.location.locationId = :locationId
            """)
    Long getPopulationByLocation(
            @Param("locationId") Long locationId
    );


    // ============================================================
    // LOCATION BASED SPECIES COUNT
    // ============================================================

    @Query("""
            SELECT COUNT(DISTINCT p.species.speciesId)
            FROM PopulationEstimate p
            WHERE p.survey.location.locationId = :locationId
            """)
    Long getSpeciesCountByLocation(
            @Param("locationId") Long locationId
    );


    // ============================================================
    // LOCATION BASED SPECIES DISTRIBUTION
    // ============================================================

    @Query("""
            SELECT p
            FROM PopulationEstimate p
            JOIN FETCH p.species
            JOIN FETCH p.survey
            WHERE p.survey.location.locationId = :locationId
            ORDER BY p.estimatedPopulation DESC
            """)
    List<PopulationEstimate> getSpeciesDistributionByLocation(
            @Param("locationId") Long locationId
    );


    // ============================================================
    // LOCATION BASED AVERAGE DENSITY
    // ============================================================

    @Query("""
            SELECT AVG(p.density)
            FROM PopulationEstimate p
            WHERE p.survey.location.locationId = :locationId
            """)
    BigDecimal getAverageDensityByLocation(
            @Param("locationId") Long locationId
    );


    // ============================================================
    // LOCATION BASED GROWTH RATE
    // ============================================================

    @Query("""
            SELECT AVG(p.growthRate)
            FROM PopulationEstimate p
            WHERE p.survey.location.locationId = :locationId
            """)
    BigDecimal getGrowthRateByLocation(
            @Param("locationId") Long locationId
    );


    // ============================================================
    // CHECK SURVEY POPULATION EXISTS
    // ============================================================

    boolean existsBySurveySurveyId(
            Long surveyId
    );


    // ============================================================
    // FIND POPULATION BY LOCATION
    // ============================================================

    @Query("""
            SELECT p
            FROM PopulationEstimate p
            JOIN FETCH p.species s
            JOIN FETCH p.survey sv
            JOIN FETCH sv.location l
            WHERE l.locationId = :locationId
            """)
    List<PopulationEstimate> findPopulationByLocation(
            @Param("locationId") Long locationId
    );


    // ============================================================
    // INCREASING SPECIES
    // ============================================================

    @Query("""
            SELECT COUNT(p)
            FROM PopulationEstimate p
            WHERE p.growthRate > 5
            """)
    Long countIncreasingSpecies();


    // ============================================================
    // STABLE SPECIES
    // ============================================================

    @Query("""
            SELECT COUNT(p)
            FROM PopulationEstimate p
            WHERE p.growthRate BETWEEN 1 AND 5
            """)
    Long countStableSpecies();


    // ============================================================
    // DECREASING SPECIES
    // ============================================================

    @Query("""
            SELECT COUNT(p)
            FROM PopulationEstimate p
            WHERE p.growthRate < 1
            """)
    Long countDecreasingSpecies();

}