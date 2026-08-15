package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "conservation_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConservationRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recommendation_id")
    private Long recommendationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "biodiversity_id")
    private BiodiversityScore biodiversityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private RecommendationPriority priority;

    @Column(name = "recommendation", columnDefinition = "TEXT")
    private String recommendation;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;
}