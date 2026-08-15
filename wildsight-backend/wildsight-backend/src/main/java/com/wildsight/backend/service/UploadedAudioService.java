package com.wildsight.backend.service;

import com.wildsight.backend.dto.UploadedAudioRequest;
import com.wildsight.backend.dto.UploadedAudioResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface UploadedAudioService {

    UploadedAudioResponse uploadAudio(UploadedAudioRequest request);

    List<UploadedAudioResponse> getAllAudio();

    UploadedAudioResponse getAudioById(Long id);

    UploadedAudioResponse updateAudio(Long id,
                                      UploadedAudioRequest request);

    void deleteAudio(Long id);

    UploadedAudioResponse uploadAudio(
            MultipartFile file,
            Long observationId,
            Long uploadedBy,
            LocalDateTime capturedAt,
            BigDecimal durationSeconds
    ) throws IOException;
}