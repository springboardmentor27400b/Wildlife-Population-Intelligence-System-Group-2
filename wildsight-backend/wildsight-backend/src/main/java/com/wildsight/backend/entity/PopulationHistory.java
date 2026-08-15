package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "population_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopulationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estimate_id", nullable = false)
    private PopulationEstimate estimate;

    @Column(name = "previous_population")
    private Integer previousPopulation;

    @Column(name = "current_population")
    private Integer currentPopulation;

    @Enumerated(EnumType.STRING)
    private PopulationTrend trend;

    @CreationTimestamp
    @Column(name = "recorded_at", updatable = false)
    private LocalDateTime recordedAt;
}