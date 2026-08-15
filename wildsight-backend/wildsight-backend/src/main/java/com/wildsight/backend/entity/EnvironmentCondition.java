package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "environment_conditions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvironmentCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "condition_id")
    private Long conditionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habitat_id", nullable = false)
    private Habitat habitat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @Column(name = "temperature", precision = 5, scale = 2)
    private BigDecimal temperature;

    @Column(name = "humidity", precision = 5, scale = 2)
    private BigDecimal humidity;

    @Column(name = "rainfall", precision = 6, scale = 2)
    private BigDecimal rainfall;

    @Column(name = "air_quality")
    private String airQuality;

    @Column(name = "wind_speed", precision = 5, scale = 2)
    private BigDecimal windSpeed;

    @Column(name = "weather_condition")
    private String weatherCondition;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}