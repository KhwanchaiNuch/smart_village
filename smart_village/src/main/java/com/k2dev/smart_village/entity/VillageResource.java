package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "village_resource")
public class VillageResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Integer resourceId;

    @Column(name = "village_id")
    private Integer villageId;

    @Column(length = 20)
    private String villageCode;

    @Column(length = 50)
    private String resourceType;

    @Column(length = 100)
    private String resourceName;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** comma-separated issue types เช่น "สุขภาพ,สังคม/ความปลอดภัย" */
    @Column(name = "resource_categories", columnDefinition = "TEXT")
    private String resourceCategories;

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

    public Integer getResourceId() { return resourceId; }
    public void setResourceId(Integer resourceId) { this.resourceId = resourceId; }

    public Integer getVillageId() { return villageId; }
    public void setVillageId(Integer villageId) { this.villageId = villageId; }

    public String getVillageCode() { return villageCode; }
    public void setVillageCode(String villageCode) { this.villageCode = villageCode; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public java.math.BigDecimal getGpsLat() { return gpsLat; }
    public void setGpsLat(java.math.BigDecimal gpsLat) { this.gpsLat = gpsLat; }

    public java.math.BigDecimal getGpsLng() { return gpsLng; }
    public void setGpsLng(java.math.BigDecimal gpsLng) { this.gpsLng = gpsLng; }

    public String getResourceCategories() { return resourceCategories; }
    public void setResourceCategories(String resourceCategories) { this.resourceCategories = resourceCategories; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
}