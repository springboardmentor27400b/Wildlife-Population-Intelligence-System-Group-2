package com.wildsight.backend.repository;

import com.wildsight.backend.entity.ReportExport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportExportRepository
        extends JpaRepository<ReportExport, Long> {

}