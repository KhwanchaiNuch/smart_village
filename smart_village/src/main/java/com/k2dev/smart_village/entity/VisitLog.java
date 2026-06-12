
package com.k2dev.smart_village.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "visit_log")
@Data
public class VisitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long personId;

    private Long householdId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate visitDate;

    @Column(length = 150)
    private String visitor;

    @Column(length = 200)
    private String visitReason;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String nextAction;
}
