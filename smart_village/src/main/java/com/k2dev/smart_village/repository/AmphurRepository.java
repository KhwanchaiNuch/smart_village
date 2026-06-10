
package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.Amphur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AmphurRepository extends JpaRepository<Amphur, Integer> {
    List<Amphur> findByProvinceId(Integer provinceId);
}
