
package com.k2dev.smart_village.entity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="person")
@Data
public class Person {
 @Id
 @GeneratedValue(strategy=GenerationType.IDENTITY)
 @Column(name="person_id")
 private Integer personId;

 private Integer householdId;
 private String firstName;
 private String lastName;
 private String occupation;
 private Boolean isSick;
 private Boolean isBedridden;
}
