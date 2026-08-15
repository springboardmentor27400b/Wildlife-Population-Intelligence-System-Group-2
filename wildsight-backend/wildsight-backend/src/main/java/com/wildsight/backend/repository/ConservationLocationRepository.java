package com.wildsight.backend.repository;


import com.wildsight.backend.entity.ConservationLocation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface ConservationLocationRepository 
        extends JpaRepository<ConservationLocation, Long> {


    Optional<ConservationLocation> findByLocationName(
            String locationName
    );


}