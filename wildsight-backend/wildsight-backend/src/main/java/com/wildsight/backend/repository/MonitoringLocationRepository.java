package com.wildsight.backend.repository;


import com.wildsight.backend.entity.MonitoringLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface MonitoringLocationRepository 
extends JpaRepository<MonitoringLocation,Long>{


    @Query("""
    SELECT m FROM MonitoringLocation m
    JOIN FETCH m.survey
    """)
    List<MonitoringLocation> findAllWithDetails();


}