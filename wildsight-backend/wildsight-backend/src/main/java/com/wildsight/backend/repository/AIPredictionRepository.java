package com.wildsight.backend.repository;


import com.wildsight.backend.entity.AIPrediction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AIPredictionRepository
extends JpaRepository<AIPrediction,Long>{


List<AIPrediction> findTop6ByOrderByCreatedAtDesc();


}