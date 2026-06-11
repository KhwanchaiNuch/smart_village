
package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "training_participant")
@Data
public class TrainingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long trainingId;

    private Long personId;

    @Column(length = 50)
    private String attendStatus;

    @Column(length = 50)
    private String afterStatus;

    @Column(columnDefinition = "TEXT")
    private String afterProblem;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
