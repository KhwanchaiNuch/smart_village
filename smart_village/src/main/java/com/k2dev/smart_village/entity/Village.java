
package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "village")
@Data
public class Village {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "village_id")
	private Integer villageId;

	@Column(name = "tambon_id")
	private Integer tambonId;

	@Column(name = "village_name")
	private String villageName;

	private String moo;

	public Integer getVillageId() {
		return villageId;
	}

	public void setVillageId(Integer villageId) {
		this.villageId = villageId;
	}

	public Integer getTambonId() {
		return tambonId;
	}

	public void setTambonId(Integer tambonId) {
		this.tambonId = tambonId;
	}

	public String getVillageName() {
		return villageName;
	}

	public void setVillageName(String villageName) {
		this.villageName = villageName;
	}

	public String getMoo() {
		return moo;
	}

	public void setMoo(String moo) {
		this.moo = moo;
	}
}
