
package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "health_record")
@Data
public class HealthRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	private Integer personId;
	private Boolean needHomeVisit;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getPersonId() {
		return personId;
	}

	public void setPersonId(Integer personId) {
		this.personId = personId;
	}

	public Boolean getNeedHomeVisit() {
		return needHomeVisit;
	}

	public void setNeedHomeVisit(Boolean needHomeVisit) {
		this.needHomeVisit = needHomeVisit;
	}
}
