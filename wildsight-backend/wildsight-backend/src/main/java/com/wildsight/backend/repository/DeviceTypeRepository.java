package com.wildsight.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wildsight.backend.entity.DeviceType;

public interface DeviceTypeRepository
        extends JpaRepository<DeviceType, Long> {
}
