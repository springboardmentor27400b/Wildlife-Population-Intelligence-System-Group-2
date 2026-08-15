package com.wildsight.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "monitoring_devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "device_id")
    private Long deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_type_id", nullable = false)
    private DeviceType deviceType;

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(name = "device_name")
    private String deviceName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private MonitoringLocation location;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private DeviceStatus status;
}