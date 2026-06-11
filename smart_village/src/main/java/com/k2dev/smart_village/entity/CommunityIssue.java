
package com.k2dev.smart_village.entity;

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

    private LocalDate dueDate;

    @Column(columnDefinition = "TEXT")
    private String remark;

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
}
