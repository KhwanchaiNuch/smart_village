
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.repository.HouseholdRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/households")
@RequiredArgsConstructor
public class HouseholdController {

	@Autowired
	private HouseholdRepository repo;

	// แสดงเฉพาะครัวเรือนที่ยังไม่ถูกลบ (deleted_at IS NULL)
	@GetMapping
	public List<Household> list() {
		return repo.findByDeletedAtIsNull();
	}

	// ดึงรายตัว: ถ้าไม่เจอ หรือถูกลบไปแล้ว -> 404 (กันข้อมูลที่ลบแล้วรั่วออกไป)
	@GetMapping("/{id}")
	public Household get(@PathVariable Integer id) {
		return repo.findByHouseholdIdAndDeletedAtIsNull(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบครัวเรือน"));
	}

	@PostMapping("/add")
	public Household add(@RequestBody Household h) {
		// บังคับให้ของใหม่อยู่ในสถานะ "ยังไม่ลบ" เสมอ
		// กันกรณีฝั่งหน้าบ้าน (หรือผู้ไม่หวังดี) ส่ง deletedAt/deletedBy แนบมาเอง
		h.setDeletedAt(null);
		h.setDeletedBy(null);
		return repo.save(h);
	}

	@PostMapping("/edit")
	public Household edit(@RequestBody Household h) {
		// แก้ไขได้เฉพาะรายการที่ยังไม่ถูกลบเท่านั้น
		Household existing = repo.findByHouseholdIdAndDeletedAtIsNull(h.getHouseholdId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบครัวเรือนที่จะแก้ไข หรือถูกลบไปแล้ว"));

		// คงสถานะ soft delete เดิมไว้ (= ยังไม่ลบ) กันการ "ปลุกคืนชีพ" ผ่าน endpoint แก้ไข
		h.setDeletedAt(existing.getDeletedAt());
		h.setDeletedBy(existing.getDeletedBy());
		return repo.save(h);
	}

	// Soft delete: ไม่ได้ลบแถวออกจากฐานข้อมูลจริง
	// แค่ประทับเวลาที่ลบ + ชื่อผู้ลบ เพื่อให้ตามสอบย้อนหลังและกู้คืนได้
	@DeleteMapping("/{id}")
	public void delete(@PathVariable Integer id) {
		Household h = repo.findByHouseholdIdAndDeletedAtIsNull(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบครัวเรือน หรือถูกลบไปแล้ว"));

		h.setDeletedAt(LocalDateTime.now());
		h.setDeletedBy(currentUsername());
		repo.save(h);
	}

	// ดึง username จาก JWT (ผ่าน JwtFilter -> SecurityContext) ไว้บันทึกว่าใครเป็นคนลบ
	private String currentUsername() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return (auth != null && auth.getName() != null) ? auth.getName() : "unknown";
	}
}
