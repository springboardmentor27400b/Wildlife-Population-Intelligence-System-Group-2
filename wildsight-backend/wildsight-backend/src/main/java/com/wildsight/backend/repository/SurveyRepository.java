package com.wildsight.backend.repository;


import com.wildsight.backend.entity.Survey;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface SurveyRepository 
        extends JpaRepository<Survey, Long> {


    Long countByStatus(String status);


    Long countByHabitatType(String habitatType);


    @Query("""
        SELECT COUNT(s) 
        FROM Survey s 
        WHERE LOWER(s.habitatType)=LOWER(:habitat)
    """)
    Long countHabitat(
            @Param("habitat") String habitat
    );


    Optional<Survey> findBySurveyName(
            String surveyName
    );


    boolean existsBySurveyName(
            String surveyName
    );

}