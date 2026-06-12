
package com.k2dev.smart_village.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_record")
@Data
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long personId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkDate;

    @Column(length = 20)
    private String bp;

    @Column(precision = 6, scale = 2)
    private BigDecimal sugar;

    @Column(precision = 5, scale = 2)
    private BigDecimal bmi;

    @Column(columnDefinition = "TEXT")
    private String riskGroup;

    private Boolean needHomeVisit;

    @Column(columnDefinition = "TEXT")
    private String remark;
<<<<<<< HEAD
=======

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPersonId() { return personId; }
    public void setPersonId(Long personId) { this.personId = personId; }

    public LocalDate getCheckDate() { return checkDate; }
    public void setCheckDate(LocalDate checkDate) { this.checkDate = checkDate; }

    public String getBp() { return bp; }
    public void setBp(String bp) { this.bp = bp; }

    public BigDecimal getSugar() { return sugar; }
    public void setSugar(BigDecimal sugar) { this.sugar = sugar; }

    public BigDecimal getBmi() { return bmi; }
    public void setBmi(BigDecimal bmi) { this.bmi = bmi; }

    public String getRiskGroup() { return riskGroup; }
    public void setRiskGroup(String riskGroup) { this.riskGroup = riskGroup; }

    public Boolean getNeedHomeVisit() { return needHomeVisit; }
    public void setNeedHomeVisit(Boolean needHomeVisit) { this.needHomeVisit = needHomeVisit; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
>>>>>>> 835415e5285edcaf9ca4cc9291b03da0437af819
}
