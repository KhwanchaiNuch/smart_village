
package com.k2dev.smart_village.entity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="household")
@Data
public class Household {
 @Id
 @GeneratedValue(strategy=GenerationType.IDENTITY)
 @Column(name="household_id")
 private Integer householdId;

 @Column(name="village_id")
 private Integer villageId;

 private String houseNo;
 private String houseCondition;
 private String waterSystem;
 private Boolean internetAccess;
 private String remark;
}
