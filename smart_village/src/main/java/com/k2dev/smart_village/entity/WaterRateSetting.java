package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_rate_setting")
@Data
public class WaterRateSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rate_id")
    private Long rateId;

    @Column(name = "village_id")
    private Integer villageId;

    @Column(name = "rate_per_unit", precision = 10, scale = 2, nullable = false)
    private BigDecimal ratePerUnit;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    private String remark;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    // ระบุ getter/setter เอง เพราะ Lombok annotation processing ไม่ทำงานในบางสภาพแวดล้อม build
    public Long getRateId() { return rateId; }
    public void setRateId(Long rateId) { this.rateId = rateId; }

    public Integer getVillageId() { return villageId; }
    public void setVillageId(Integer villageId) { this.villageId = villageId; }

    public BigDecimal getRatePerUnit() { return ratePerUnit; }
    public void setRatePerUnit(BigDecimal ratePerUnit) { this.ratePerUnit = ratePerUnit; }

    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
