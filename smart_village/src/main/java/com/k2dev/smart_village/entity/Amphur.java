
package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "amphur")
@Data
public class Amphur {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "amphur_id")
	private Integer amphurId;

	@Column(name = "province_id")
	private Integer provinceId;

	@Column(name = "name_th")
	private String nameTh;

	public Integer getAmphurId() {
		return amphurId;
	}

	public void setAmphurId(Integer amphurId) {
		this.amphurId = amphurId;
	}

	public Integer getProvinceId() {
		return provinceId;
	}

	public void setProvinceId(Integer provinceId) {
		this.provinceId = provinceId;
	}

	public String getNameTh() {
		return nameTh;
	}

	public void setNameTh(String nameTh) {
		this.nameTh = nameTh;
	}
}
