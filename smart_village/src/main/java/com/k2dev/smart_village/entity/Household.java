package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "household")
@Data
public class Household {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "household_id")
    private Integer householdId;

    @Column(name = "village_id")
    private Integer villageId;

    @Column(name = "house_no")
    private String houseNo;

    @Column(name = "moo")
    private String moo;

    @Column(name = "house_registration_status")
    private Boolean houseRegistrationStatus;

    @Column(name = "house_registration_type", length = 100)
    private String houseRegistrationType;

    @Column(name = "gps_lat", length = 50)
    private String gpsLat;

    @Column(name = "gps_lng", length = 50)
    private String gpsLng;

    @Column(name = "house_condition")
    private String houseCondition;

    @Column(name = "water_system")
    private String waterSystem;

    @Column(name = "internet_access")
    private Boolean internetAccess;

    @Column(name = "electricity_access")
    private Boolean electricityAccess;

    @Column(name = "remark")
    private String remark;
}
