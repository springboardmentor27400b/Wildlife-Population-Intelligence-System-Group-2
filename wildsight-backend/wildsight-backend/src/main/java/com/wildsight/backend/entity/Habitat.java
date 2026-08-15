package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "habitats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habitat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "habitat_id")
    private Long habitatId;

    @Column(name = "habitat_name", nullable = false)
    private String habitatName;

    @Column(name = "habitat_type")
    private String habitatType;

    @Column(name = "vegetation_type")
    private String vegetationType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "habitat_quality_score")
private Double habitatQualityScore;

@Column(name = "degradation_level")
private Double degradationLevel;

@Column(name = "vegetation_density")
private Double vegetationDensity;

@Column(name = "temperature")
private Double temperature;

@Column(name = "humidity")
private Double humidity;

@Column(name = "rainfall")
private Double rainfall;

@Column(name = "water_quality")
private Double waterQuality;

@Column(name = "air_quality")
private Double airQuality;

@Column(name = "suitability_score")
private Double suitabilityScore;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name="survey_id")
private Survey survey;
}