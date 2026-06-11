
package com.k2dev.smart_village.repository;
import com.k2dev.smart_village.entity.Household;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdRepository extends JpaRepository<Household,Integer>{

	// ดึงเฉพาะครัวเรือนที่ยังไม่ถูกลบ (deleted_at IS NULL)
	List<Household> findByDeletedAtIsNull();

	// ดึงรายตัวเฉพาะที่ยังไม่ถูกลบ ใช้กัน get/edit/delete รายการที่ลบไปแล้ว
	Optional<Household> findByHouseholdIdAndDeletedAtIsNull(Integer householdId);
}
