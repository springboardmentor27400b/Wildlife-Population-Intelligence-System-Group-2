package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "species")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Species {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "species_id")
    private Long speciesId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "common_name")
    private String commonName;

    @Column(name = "scientific_name")
    private String scientificName;

    @Column(name = "conservation_status")
    private String conservationStatus;

    @Column(name = "iucn_status")
    private String iucnStatus;

    @Column(columnDefinition = "TEXT")
    private String description;
}