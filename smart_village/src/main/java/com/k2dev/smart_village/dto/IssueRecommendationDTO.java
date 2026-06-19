package com.k2dev.smart_village.dto;

import java.util.List;

public class IssueRecommendationDTO {

    // ── บุคคลที่มีทักษะตรงกัน ────────────────────────────────────────────────
    public static class MatchedPerson {
        private Integer personId;
        private String fullName;
        private Integer age;
        private String occupation;
        private String matchedSkill;
        private String skillLevel;
        private Integer householdId;
        private String houseNo;

        public MatchedPerson(Integer personId, String fullName, Integer age,
                             String occupation, String matchedSkill, String skillLevel,
                             Integer householdId, String houseNo) {
            this.personId    = personId;
            this.fullName    = fullName;
            this.age         = age;
            this.occupation  = occupation;
            this.matchedSkill = matchedSkill;
            this.skillLevel  = skillLevel;
            this.householdId = householdId;
            this.houseNo     = houseNo;
        }

        public Integer getPersonId()    { return personId; }
        public String  getFullName()    { return fullName; }
        public Integer getAge()         { return age; }
        public String  getOccupation()  { return occupation; }
        public String  getMatchedSkill(){ return matchedSkill; }
        public String  getSkillLevel()  { return skillLevel; }
        public Integer getHouseholdId() { return householdId; }
        public String  getHouseNo()     { return houseNo; }
    }

    // ── ทรัพยากรชุมชนที่ตรงกัน ────────────────────────────────────────────────
    public static class MatchedResource {
        private Integer resourceId;
        private String  resourceName;
        private String  resourceType;
        private String  description;

        public MatchedResource(Integer resourceId, String resourceName,
                               String resourceType, String description) {
            this.resourceId   = resourceId;
            this.resourceName = resourceName;
            this.resourceType = resourceType;
            this.description  = description;
        }

        public Integer getResourceId()   { return resourceId; }
        public String  getResourceName() { return resourceName; }
        public String  getResourceType() { return resourceType; }
        public String  getDescription()  { return description; }
    }

    // ── fields ────────────────────────────────────────────────────────────────
    private List<MatchedPerson>   matchedPeople;
    private List<MatchedResource> matchedResources;

    public IssueRecommendationDTO(List<MatchedPerson> matchedPeople,
                                  List<MatchedResource> matchedResources) {
        this.matchedPeople    = matchedPeople;
        this.matchedResources = matchedResources;
    }

    public List<MatchedPerson>   getMatchedPeople()    { return matchedPeople; }
    public List<MatchedResource> getMatchedResources() { return matchedResources; }
}
