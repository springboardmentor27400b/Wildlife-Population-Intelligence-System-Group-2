package com.wildsight.backend.repository;

import com.wildsight.backend.entity.Observation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObservationRepository
        extends JpaRepository<Observation, Long> {

    List<Observation> findAllByOrderByObservationIdDesc();
}