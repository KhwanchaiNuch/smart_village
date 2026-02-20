
package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "person")
@Data
public class Person {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "person_id")
	private Integer personId;
	private Integer householdId;
	private String firstName;
	private String lastName;
	private String occupation;
	private Boolean isSick;
	private Boolean isBedridden;

	public Integer getPersonId() {
		return personId;
	}

	public void setPersonId(Integer personId) {
		this.personId = personId;
	}

	public Integer getHouseholdId() {
		return householdId;
	}

	public void setHouseholdId(Integer householdId) {
		this.householdId = householdId;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getOccupation() {
		return occupation;
	}

	public void setOccupation(String occupation) {
		this.occupation = occupation;
	}

	public Boolean getIsSick() {
		return isSick;
	}

	public void setIsSick(Boolean isSick) {
		this.isSick = isSick;
	}

	public Boolean getIsBedridden() {
		return isBedridden;
	}

	public void setIsBedridden(Boolean isBedridden) {
		this.isBedridden = isBedridden;
	}
}
