
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
}
