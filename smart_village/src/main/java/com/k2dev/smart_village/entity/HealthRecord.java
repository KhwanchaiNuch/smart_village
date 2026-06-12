
package com.k2dev.smart_village.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

<<<<<<< Updated upstream
=======
import java.math.BigDecimal;
import java.time.LocalDate;

>>>>>>> Stashed changes
@Entity
@Table(name = "health_record")
@Data
public class HealthRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
<<<<<<< Updated upstream
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
=======
	private Long id;

	private Long personId;

	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate checkDate;

	@Column(length = 20)
	private String bp;

	@Column(precision = 6, scale = 2)
	private BigDecimal sugar;

	@Column(precision = 5, scale = 2)
	private BigDecimal bmi;

	@Column(columnDefinition = "TEXT")
	private String riskGroup;

	private Boolean needHomeVisit;

	@Column(columnDefinition = "TEXT")
	private String remark;

>>>>>>> Stashed changes
}
