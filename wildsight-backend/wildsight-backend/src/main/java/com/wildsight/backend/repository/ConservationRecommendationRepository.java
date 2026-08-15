package com.wildsight.backend.repository;

import com.wildsight.backend.entity.ConservationRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConservationRecommendationRepository
        extends JpaRepository<ConservationRecommendation, Long> {

}