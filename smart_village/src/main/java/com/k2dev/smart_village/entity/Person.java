package com.k2dev.smart_village.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "person")
@Data
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "person_id")
    private Integer personId;

    private Integer householdId;

    @Column(length = 13)
    private String cid;

    @Column(length = 50)
    private String title;

    private String firstName;
    private String lastName;

    @Column(length = 10)
    private String gender;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;

    private Integer age;

    @Column(length = 50)
    private String maritalStatus;

    @Column(length = 100)
    private String educationLevel;

    private Boolean isRegisteredInVillage;
    private Boolean isLivingInVillage;

    @Column(length = 100)
    private String occupation;

    @Column(length = 100)
    private String secondaryOccupation;

    private Integer incomePerMonth;

    private Boolean isSick;

    @Column(columnDefinition = "TEXT")
    private String diseaseList;

    private Boolean isBedridden;
    private Boolean isDisabled;

    @Column(length = 100)
    private String disabilityType;

    private Boolean isElderly;
    private Boolean livingAlone;

    @Column(length = 100)
    private String welfareCard;

    @Column(columnDefinition = "TEXT")
    private String otherWelfare;

    @Column(length = 50)
    private String status;
}
