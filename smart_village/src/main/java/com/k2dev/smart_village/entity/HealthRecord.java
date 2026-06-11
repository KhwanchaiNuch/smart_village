
package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_record")
@Data
public class HealthRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long personId;

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

	@Column(updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	protected void onCreate() {
		this.createdAt = LocalDateTime.now();
	}

}
