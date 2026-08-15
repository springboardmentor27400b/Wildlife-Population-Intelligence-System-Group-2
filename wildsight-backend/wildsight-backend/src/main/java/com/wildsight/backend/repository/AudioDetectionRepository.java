package com.wildsight.backend.repository;

import com.wildsight.backend.entity.AudioDetection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AudioDetectionRepository
        extends JpaRepository<AudioDetection, Long> {
}