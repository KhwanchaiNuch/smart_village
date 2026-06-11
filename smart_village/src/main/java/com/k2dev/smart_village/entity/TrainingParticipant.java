
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTrainingId() { return trainingId; }
    public void setTrainingId(Long trainingId) { this.trainingId = trainingId; }

    public Long getPersonId() { return personId; }
    public void setPersonId(Long personId) { this.personId = personId; }

    public String getAttendStatus() { return attendStatus; }
    public void setAttendStatus(String attendStatus) { this.attendStatus = attendStatus; }

    public String getAfterStatus() { return afterStatus; }
    public void setAfterStatus(String afterStatus) { this.afterStatus = afterStatus; }

    public String getAfterProblem() { return afterProblem; }
    public void setAfterProblem(String afterProblem) { this.afterProblem = afterProblem; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
