package com.wildsight.backend.repository;

import com.wildsight.backend.entity.EnvironmentCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnvironmentConditionRepository
        extends JpaRepository<EnvironmentCondition, Long> {
}