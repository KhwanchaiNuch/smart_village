
package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tambon")
@Data
public class Tambon {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "tambon_id")
	private Integer tambonId;

	@Column(name = "amphur_id")
	private Integer amphurId;

	@Column(name = "name_th")
	private String nameTh;

	@Column(name = "zipcode", length = 5)
	private String zipcode;

	public String getZipcode() {
		return zipcode;
	}

	public void setZipcode(String zipcode) {
		this.zipcode = zipcode;
	}

	public Integer getTambonId() {
		return tambonId;
	}

	public void setTambonId(Integer tambonId) {
		this.tambonId = tambonId;
	}

	public Integer getAmphurId() {
		return amphurId;
	}

	public void setAmphurId(Integer amphurId) {
		this.amphurId = amphurId;
	}

	public String getNameTh() {
		return nameTh;
	}

	public void setNameTh(String nameTh) {
		this.nameTh = nameTh;
	}
}
