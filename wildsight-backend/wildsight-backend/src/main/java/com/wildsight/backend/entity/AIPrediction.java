package com.wildsight.backend.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name="ai_predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIPrediction {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String species;


    private Double confidence;


    private String location;


    private String researcher;


    private String imagePath;


    private LocalDateTime createdAt;

}