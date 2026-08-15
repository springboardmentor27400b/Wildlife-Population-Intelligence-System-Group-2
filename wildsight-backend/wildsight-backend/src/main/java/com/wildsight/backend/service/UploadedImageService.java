package com.wildsight.backend.service;

import com.wildsight.backend.dto.UploadedImageRequest;
import com.wildsight.backend.dto.UploadedImageResponse;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.io.IOException;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


public interface UploadedImageService {

    UploadedImageResponse uploadImage(UploadedImageRequest request);

    List<UploadedImageResponse> getAllImages();

    UploadedImageResponse getImageById(Long id);

    UploadedImageResponse updateImage(Long id,
                                      UploadedImageRequest request);

    void deleteImage(Long id);

    UploadedImageResponse uploadImage(
        MultipartFile file,
        Long observationId,
        Long uploadedBy,
        LocalDateTime capturedAt,
        BigDecimal imageQuality) throws IOException;
}