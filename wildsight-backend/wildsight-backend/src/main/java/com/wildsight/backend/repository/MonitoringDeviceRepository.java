package com.wildsight.backend.repository;


import com.wildsight.backend.entity.MonitoringDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface MonitoringDeviceRepository 
extends JpaRepository<MonitoringDevice,Long>{


@Query("""
SELECT d FROM MonitoringDevice d
JOIN FETCH d.survey
JOIN FETCH d.location
JOIN FETCH d.deviceType
""")
List<MonitoringDevice> findAllWithDetails();


}