package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "village_resource")
@Data
public class VillageResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Integer resourceId;

    @Column(length = 20)
    private String villageCode;

    @Column(length = 50)
    private String resourceType;

    @Column(length = 100)
    private String resourceName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 10, scale = 6)
    private BigDecimal gpsLat;

    @Column(precision = 10, scale = 6)
    private BigDecimal gpsLng;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
