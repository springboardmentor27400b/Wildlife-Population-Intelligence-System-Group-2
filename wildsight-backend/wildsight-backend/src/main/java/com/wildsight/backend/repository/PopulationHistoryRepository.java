package com.wildsight.backend.repository;

import com.wildsight.backend.entity.PopulationHistory;
import com.wildsight.backend.entity.PopulationTrend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface PopulationHistoryRepository
        extends JpaRepository<PopulationHistory, Long> {


    Long countByTrend(PopulationTrend trend);


}