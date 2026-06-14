package com.k2dev.smart_village.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "person")
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

    private Boolean welfareCard;

    @Column(columnDefinition = "TEXT")
    private String otherWelfare;

    @Column(length = 50)
    private String status;

    public Integer getPersonId() { return personId; }
    public void setPersonId(Integer personId) { this.personId = personId; }

    public Integer getHouseholdId() { return householdId; }
    public void setHouseholdId(Integer householdId) { this.householdId = householdId; }

    public String getCid() { return cid; }
    public void setCid(String cid) { this.cid = cid; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public java.time.LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(java.time.LocalDate birthDate) { this.birthDate = birthDate; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getEducationLevel() { return educationLevel; }
    public void setEducationLevel(String educationLevel) { this.educationLevel = educationLevel; }

    public Boolean getIsRegisteredInVillage() { return isRegisteredInVillage; }
    public void setIsRegisteredInVillage(Boolean v) { this.isRegisteredInVillage = v; }

    public Boolean getIsLivingInVillage() { return isLivingInVillage; }
    public void setIsLivingInVillage(Boolean v) { this.isLivingInVillage = v; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getSecondaryOccupation() { return secondaryOccupation; }
    public void setSecondaryOccupation(String v) { this.secondaryOccupation = v; }

    public Integer getIncomePerMonth() { return incomePerMonth; }
    public void setIncomePerMonth(Integer v) { this.incomePerMonth = v; }

    public Boolean getIsSick() { return isSick; }
    public void setIsSick(Boolean isSick) { this.isSick = isSick; }

    public String getDiseaseList() { return diseaseList; }
    public void setDiseaseList(String diseaseList) { this.diseaseList = diseaseList; }

    public Boolean getIsBedridden() { return isBedridden; }
    public void setIsBedridden(Boolean isBedridden) { this.isBedridden = isBedridden; }

    public Boolean getIsDisabled() { return isDisabled; }
    public void setIsDisabled(Boolean isDisabled) { this.isDisabled = isDisabled; }

    public String getDisabilityType() { return disabilityType; }
    public void setDisabilityType(String v) { this.disabilityType = v; }

    public Boolean getIsElderly() { return isElderly; }
    public void setIsElderly(Boolean isElderly) { this.isElderly = isElderly; }

    public Boolean getLivingAlone() { return livingAlone; }
    public void setLivingAlone(Boolean livingAlone) { this.livingAlone = livingAlone; }

    public Boolean getWelfareCard() { return welfareCard; }
    public void setWelfareCard(Boolean welfareCard) { this.welfareCard = welfareCard; }

    public String getOtherWelfare() { return otherWelfare; }
    public void setOtherWelfare(String otherWelfare) { this.otherWelfare = otherWelfare; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}