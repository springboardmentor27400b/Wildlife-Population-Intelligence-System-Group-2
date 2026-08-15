package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "device_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "device_type_id")
    private Long deviceTypeId;

    @Column(name = "type_name")
    private String typeName;

    private String description;
}