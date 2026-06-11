
package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "household")
public class Household {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "household_id")
	private Integer householdId;
	@Column(name = "village_id")
	@JsonProperty("villageId") //แมปกับ JSON หน้าบ้าน
	private Integer villageId;

	@Column(name = "house_no")
	private String houseNo;

	// หมู่ที่ของบ้าน ใช้แสดงใน dropdown ตอนเพิ่มข้อมูลบุคคล
	@Column(name = "moo")
	private String moo;

	@Column(name = "house_condition")
	private String houseCondition;

	@Column(name = "water_system")
	private String waterSystem;

	@Column(name = "internet_access")
	private Boolean internetAccess;

	@Column(name = "remark")
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

	public String getMoo() {
		return moo;
	}

	public void setMoo(String moo) {
		this.moo = moo;
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
