
package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PersonRepository extends JpaRepository<Person, Integer> {

    /**
     * ดึงบุคคลทั้งหมดที่อยู่ในครัวเรือนที่กำหนด
     * ใช้สำหรับแสดงสมาชิกในบ้านหลังนั้น ๆ
     */
    List<Person> findByHouseholdId(Integer householdId);

    /**
     * ดึงบุคคลทั้งหมดที่ householdId ตรงกับ list ที่ส่งมา
     * ใช้คู่กับ HouseholdRepository.findByVillageId เพื่อกรองคนตามหมู่บ้าน
     * (แทน @Query เพื่อให้สอดคล้องกับ pattern derived query ของโปรเจค)
     */
    List<Person> findByHouseholdIdIn(List<Integer> householdIds);
}
