package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "population_estimates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopulationEstimate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "estimate_id")
    private Long estimateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "species_id", nullable = false)
    private Species species;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @Column(name = "estimated_population")
    private Integer estimatedPopulation;

    @Column(name = "density", precision = 10, scale = 2)
    private BigDecimal density;

    @Column(name = "growth_rate", precision = 8, scale = 2)
    private BigDecimal growthRate;

    @Column(name = "migration_pattern")
    private String migrationPattern;

    @CreationTimestamp
    @Column(name = "calculated_at", updatable = false)
    private LocalDateTime calculatedAt;

   
}