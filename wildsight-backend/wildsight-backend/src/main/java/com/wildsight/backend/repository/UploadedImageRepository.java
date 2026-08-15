package com.wildsight.backend.repository;

import com.wildsight.backend.entity.UploadedImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UploadedImageRepository
        extends JpaRepository<UploadedImage, Long> {
}