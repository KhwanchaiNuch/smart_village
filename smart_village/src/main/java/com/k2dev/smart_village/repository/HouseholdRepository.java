
package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.Household;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HouseholdRepository extends JpaRepository<Household, Integer> {

    /**
     * ดึงครัวเรือนทั้งหมดที่อยู่ในหมู่บ้านที่กำหนด
     * ใช้สำหรับกรองข้อมูลตามสิทธิ์ของผู้ใช้ระดับหมู่บ้าน (role = VILLAGE)
     */
    List<Household> findByVillageId(Integer villageId);
    List<Household> findByVillageIdIn(List<Integer> villageIds);
}
