package com.k2dev.smart_village.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "village_need_survey")
@Data
public class VillageNeedSurvey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "survey_id")
    private Integer surveyId;

    private Integer householdId;
    private Integer personId;

    @Column(length = 100)
    private String needType;

    private Integer priorityLevel;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate surveyDate;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
