package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "biodiversity_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BiodiversityScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "biodiversity_id")
    private Long biodiversityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habitat_id")
    private Habitat habitat;

    @Column(name = "species_diversity_score", precision = 5, scale = 2)
    private BigDecimal speciesDiversityScore;

    @Column(name = "habitat_quality_score", precision = 5, scale = 2)
    private BigDecimal habitatQualityScore;

    @Column(name = "ecosystem_health_score", precision = 5, scale = 2)
    private BigDecimal ecosystemHealthScore;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "species_count")
    private Integer speciesCount;

    @Column(name = "health_status")
    private String healthStatus;

    @CreationTimestamp
    @Column(name = "calculated_at", updatable = false)
    private LocalDateTime calculatedAt;
}