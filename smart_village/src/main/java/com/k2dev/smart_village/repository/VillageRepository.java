package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.Village;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface VillageRepository extends JpaRepository<Village, Integer> {
    List<Village> findByTambonId(Integer tambonId);
    List<Village> findByTambonIdIn(List<Integer> tambonIds);

    /** สร้าง village ด้วย explicit ID ถ้ายังไม่มี (ป้องกัน JPA merge() แทน insert()) */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO village (village_id, village_name) VALUES (:id, :name) ON CONFLICT (village_id) DO NOTHING",
           nativeQuery = true)
    int ensureVillage(@Param("id") Integer id, @Param("name") String name);
}