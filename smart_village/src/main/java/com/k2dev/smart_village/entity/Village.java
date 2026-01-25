
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
}
