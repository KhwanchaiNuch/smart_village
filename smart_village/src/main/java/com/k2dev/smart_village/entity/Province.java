
package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "province")
@Data
public class Province {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "province_id")
    private Integer provinceId;

    @Column(name = "name_th")
    private String nameTh;
}
