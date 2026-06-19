package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "person_skill")
public class PersonSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "skill_id")
    private Integer skillId;

    private Integer personId;

    @Column(length = 100)
    private String skillName;

    @Column(length = 20)
    private String skillLevel;

    private Boolean certificateFlag;

    /** comma-separated issue types ที่ทักษะนี้ช่วยได้ เช่น "สุขภาพ,สังคม/ความปลอดภัย" */
    @Column(name = "skill_categories", columnDefinition = "TEXT")
    private String skillCategories;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Integer getSkillId() { return skillId; }
    public void setSkillId(Integer skillId) { this.skillId = skillId; }

    public Integer getPersonId() { return personId; }
    public void setPersonId(Integer personId) { this.personId = personId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getSkillLevel() { return skillLevel; }
    public void setSkillLevel(String skillLevel) { this.skillLevel = skillLevel; }

    public Boolean getCertificateFlag() { return certificateFlag; }
    public void setCertificateFlag(Boolean certificateFlag) { this.certificateFlag = certificateFlag; }

    public String getSkillCategories() { return skillCategories; }
    public void setSkillCategories(String skillCategories) { this.skillCategories = skillCategories; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
}