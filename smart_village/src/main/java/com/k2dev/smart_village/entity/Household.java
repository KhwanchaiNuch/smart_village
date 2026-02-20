
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

	private String houseNo;
	private String houseCondition;
	private String waterSystem;
	private Boolean internetAccess;
	private String remark;

	public Integer getHouseholdId() {
		return householdId;
	}

	public void setHouseholdId(Integer householdId) {
		this.householdId = householdId;
	}

	public Integer getVillageId() {
		return villageId;
	}

	public void setVillageId(Integer villageId) {
		this.villageId = villageId;
	}

	public String getHouseNo() {
		return houseNo;
	}

	public void setHouseNo(String houseNo) {
		this.houseNo = houseNo;
	}

	public String getHouseCondition() {
		return houseCondition;
	}

	public void setHouseCondition(String houseCondition) {
		this.houseCondition = houseCondition;
	}

	public String getWaterSystem() {
		return waterSystem;
	}

	public void setWaterSystem(String waterSystem) {
		this.waterSystem = waterSystem;
	}

	public Boolean getInternetAccess() {
		return internetAccess;
	}

	public void setInternetAccess(Boolean internetAccess) {
		this.internetAccess = internetAccess;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}
}
