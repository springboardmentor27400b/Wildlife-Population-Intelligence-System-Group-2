package com.wildsight.backend.entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name="conservation_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConservationLocation {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="location_id")
    private Long locationId;



    @Column(nullable = false)
    private String locationName;


    private String state;


    private String country;


    private Double latitude;


    private Double longitude;


    private String locationType;


    private String protectedArea;


    @Column(columnDefinition = "TEXT")
    private String description;



    @OneToMany(
            mappedBy = "location",
            cascade = CascadeType.ALL
    )
    private List<Survey> surveys;


}