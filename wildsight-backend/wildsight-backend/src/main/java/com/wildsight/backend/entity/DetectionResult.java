package com.wildsight.backend.entity;


import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "detection_results")

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetectionResult {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detection_id")
    private Long id;



    @Column(name = "source_type")
    private String sourceType;



    @Column(name = "species")
    private String species;



    @Column(name = "scientific_name")
    private String scientificName;



    @Column(name = "category")
    private String category;



    @Column(name = "confidence")
    private Double confidence;



    @Column(name = "conservation_status")
    private String conservationStatus;



    // ===== TAXONOMY =====


    @Column(name = "kingdom")
    private String kingdom;


    @Column(name = "phylum")
    private String phylum;


    @Column(name = "class_name")
    private String className;


    // IMPORTANT: order is a MySQL reserved keyword
    @Column(name = "species_order")
    private String order;


    @Column(name = "family")
    private String family;


    @Column(name = "genus")
    private String genus;



    // ===== RELATION =====


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observation_id")
    private Observation observation;


}