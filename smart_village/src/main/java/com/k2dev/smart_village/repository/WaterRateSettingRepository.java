package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.WaterRateSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaterRateSettingRepository extends JpaRepository<WaterRateSetting, Long> {
    List<WaterRateSetting> findByVillageIdOrderByEffectiveFromDesc(Integer villageId);
    List<WaterRateSetting> findAllByOrderByEffectiveFromDesc();
}
