package com.wildsight.backend.repository;


import com.wildsight.backend.entity.BiodiversityScore;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

import com.wildsight.backend.dto.SpeciesDiversityChartResponse;
@Repository
public interface BiodiversityScoreRepository 
        extends JpaRepository<BiodiversityScore, Long> {


    // Health status count

    long countByHealthStatus(String healthStatus);



    // Average species diversity

    @Query("""
            SELECT AVG(b.speciesDiversityScore)
            FROM BiodiversityScore b
            """)
    BigDecimal getAverageSpeciesDiversity();



    // Average habitat quality

    @Query("""
            SELECT AVG(b.habitatQualityScore)
            FROM BiodiversityScore b
            """)
    Double getAverageHabitatQuality();



    // Average overall score

    @Query("""
            SELECT AVG(b.overallScore)
            FROM BiodiversityScore b
            """)
    BigDecimal getAverageOverallScore();



    // Total observed species count

    @Query("""
            SELECT COALESCE(SUM(b.speciesCount),0)
            FROM BiodiversityScore b
            """)
    Integer getTotalSpecies();



    // Biodiversity Index calculation

    @Query("""
            SELECT AVG(
            (b.speciesDiversityScore +
             b.habitatQualityScore +
             b.ecosystemHealthScore) / 3
            )
            FROM BiodiversityScore b
            """)
    Double calculateBiodiversityIndex();



    // Species diversity analysis

    @Query("""
            SELECT AVG(b.speciesDiversityScore)
            FROM BiodiversityScore b
            """)
    Double getAverageSpeciesDiversityScore();



    @Query("""
            SELECT COALESCE(SUM(b.speciesCount),0)
            FROM BiodiversityScore b
            """)
    Integer getTotalSpeciesCount();



    // Habitat health

    @Query("""
            SELECT AVG(b.habitatQualityScore)
            FROM BiodiversityScore b
            """)
    Double getAverageHabitatHealth();



    @Query("""
            SELECT COUNT(b)
            FROM BiodiversityScore b
            WHERE b.habitatQualityScore >= 75
            """)
    Long countHealthyHabitats();



    @Query("""
            SELECT COUNT(b)
            FROM BiodiversityScore b
            WHERE b.habitatQualityScore < 75
            """)
    Long countDegradedHabitats();



    // Ecosystem health

    @Query("""
            SELECT AVG(b.ecosystemHealthScore)
            FROM BiodiversityScore b
            """)
    BigDecimal getAverageEcosystemHealth();

    @Query("""
SELECT new com.wildsight.backend.dto.SpeciesDiversityChartResponse(

    s.commonName,

    AVG(b.speciesDiversityScore)

)

FROM BiodiversityScore b

JOIN PopulationEstimate p
ON p.survey.surveyId = b.survey.surveyId

JOIN Species s
ON s.speciesId = p.species.speciesId

GROUP BY s.commonName

ORDER BY AVG(b.speciesDiversityScore) DESC

""")
List<SpeciesDiversityChartResponse> getSpeciesDiversityChart();

// ================= LOCATION BASED BIODIVERSITY =================


@Query("""
SELECT AVG(b.speciesDiversityScore)
FROM BiodiversityScore b
WHERE b.survey.location.locationId = :locationId
""")
Double getBiodiversityByLocation(
        @Param("locationId") Long locationId
);



@Query("""
SELECT AVG(b.overallScore)
FROM BiodiversityScore b
WHERE b.survey.location.locationId = :locationId
""")
Double getOverallScoreByLocation(
        @Param("locationId") Long locationId
);



@Query("""
SELECT COALESCE(SUM(b.speciesCount),0)
FROM BiodiversityScore b
WHERE b.survey.location.locationId = :locationId
""")
Integer getSpeciesCountByLocation(
        @Param("locationId") Long locationId
);

  boolean existsBySurveySurveyId(Long surveyId);

  @Query("""
SELECT b
FROM BiodiversityScore b
JOIN FETCH b.survey sv
JOIN FETCH sv.location l
WHERE l.locationId = :locationId
""")
List<BiodiversityScore> findBiodiversityByLocation(
        @Param("locationId") Long locationId
);
}