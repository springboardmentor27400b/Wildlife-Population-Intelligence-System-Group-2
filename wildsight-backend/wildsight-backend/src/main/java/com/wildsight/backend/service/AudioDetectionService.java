package com.wildsight.backend.service;

import com.wildsight.backend.dto.AudioDetectionRequest;
import com.wildsight.backend.dto.AudioDetectionResponse;

import java.util.List;

public interface AudioDetectionService {

    AudioDetectionResponse createDetection(AudioDetectionRequest request);

    List<AudioDetectionResponse> getAllDetections();

    AudioDetectionResponse getDetectionById(Long id);

    AudioDetectionResponse updateDetection(
            Long id,
            AudioDetectionRequest request);

    void deleteDetection(Long id);
}