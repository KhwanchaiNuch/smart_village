package com.k2dev.smart_village.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "household")
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

    @Column(name = "gps_lat")
    private Double gpsLat;

    @Column(name = "gps_lng")
    private Double gpsLng;

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

    public Integer getHouseholdId() { return householdId; }
    public void setHouseholdId(Integer householdId) { this.householdId = householdId; }

    public Integer getVillageId() { return villageId; }
    public void setVillageId(Integer villageId) { this.villageId = villageId; }

    public String getHouseNo() { return houseNo; }
    public void setHouseNo(String houseNo) { this.houseNo = houseNo; }

    public String getMoo() { return moo; }
    public void setMoo(String moo) { this.moo = moo; }

    public Boolean getHouseRegistrationStatus() { return houseRegistrationStatus; }
    public void setHouseRegistrationStatus(Boolean houseRegistrationStatus) { this.houseRegistrationStatus = houseRegistrationStatus; }

    public String getHouseRegistrationType() { return houseRegistrationType; }
    public void setHouseRegistrationType(String houseRegistrationType) { this.houseRegistrationType = houseRegistrationType; }

    public Double getGpsLat() { return gpsLat; }
    public void setGpsLat(Double gpsLat) { this.gpsLat = gpsLat; }

    public Double getGpsLng() { return gpsLng; }
    public void setGpsLng(Double gpsLng) { this.gpsLng = gpsLng; }

    public String getHouseCondition() { return houseCondition; }
    public void setHouseCondition(String houseCondition) { this.houseCondition = houseCondition; }

    public String getWaterSystem() { return waterSystem; }
    public void setWaterSystem(String waterSystem) { this.waterSystem = waterSystem; }

    public Boolean getInternetAccess() { return internetAccess; }
    public void setInternetAccess(Boolean internetAccess) { this.internetAccess = internetAccess; }

    public Boolean getElectricityAccess() { return electricityAccess; }
    public void setElectricityAccess(Boolean electricityAccess) { this.electricityAccess = electricityAccess; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
}
