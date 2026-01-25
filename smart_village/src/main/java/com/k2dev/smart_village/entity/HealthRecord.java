
package com.k2dev.smart_village.entity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="health_record")
@Data
public class HealthRecord {
 @Id
 @GeneratedValue(strategy=GenerationType.IDENTITY)
 private Integer id;
 private Integer personId;
 private Boolean needHomeVisit;
}
