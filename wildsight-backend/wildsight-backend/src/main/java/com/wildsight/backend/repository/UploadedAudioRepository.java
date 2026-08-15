package com.wildsight.backend.repository;

import com.wildsight.backend.entity.UploadedAudio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadedAudioRepository
        extends JpaRepository<UploadedAudio, Long> {
}