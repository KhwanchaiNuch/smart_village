package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "person_skill")
@Data
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

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
