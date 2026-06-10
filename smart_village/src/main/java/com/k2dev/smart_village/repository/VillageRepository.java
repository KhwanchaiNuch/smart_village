
package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.Village;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VillageRepository extends JpaRepository<Village, Integer> {
    List<Village> findByTambonId(Integer tambonId);
}
