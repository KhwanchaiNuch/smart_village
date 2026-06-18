
package com.k2dev.smart_village.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_issue")
@Data
public class CommunityIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long householdId;

    private Integer villageId;

    @Column(length = 200)
    private String area;

    @Column(length = 100)
    private String issueType;

    private Integer severity;

    @Column(length = 50)
    private String status;

    @Column(length = 150)
    private String owner;

    private Integer impactPeople;

    @Column(precision = 12, scale = 2)
    private BigDecimal budgetEstimate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    @Column(columnDefinition = "TEXT")
    private String remark;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHouseholdId() { return householdId; }
    public void setHouseholdId(Long householdId) { this.householdId = householdId; }

    public Integer getVillageId() { return villageId; }
    public void setVillageId(Integer villageId) { this.villageId = villageId; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }

    public Integer getSeverity() { return severity; }
    public void setSeverity(Integer severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public Integer getImpactPeople() { return impactPeople; }
    public void setImpactPeople(Integer impactPeople) { this.impactPeople = impactPeople; }

    public BigDecimal getBudgetEstimate() { return budgetEstimate; }
    public void setBudgetEstimate(BigDecimal budgetEstimate) { this.budgetEstimate = budgetEstimate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
