
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.repository.HouseholdRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/households")
@RequiredArgsConstructor
public class HouseholdController {

    @Autowired
    private HouseholdRepository repo;

    /**
     * ดึงครัวเรือนทั้งหมดในระบบ (สำหรับ Admin)
     */
    @GetMapping
    public List<Household> list() {
        return repo.findAll();
    }

    /**
     * ดึงครัวเรือนตาม villageId (สำหรับผู้ใช้ระดับหมู่บ้าน role = VILLAGE)
     * ตัวอย่าง: GET /api/households/by-village/3
     */
    @GetMapping("/by-village/{villageId}")
    public List<Household> listByVillage(@PathVariable Integer villageId) {
        return repo.findByVillageId(villageId);
    }

    /**
     * ดึงครัวเรือนตาม id
     */
    @GetMapping("/{id}")
    public Household get(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    /**
     * เพิ่มครัวเรือนใหม่
     */
    @PostMapping("/add")
    public Household add(@RequestBody Household h) {
        return repo.save(h);
    }

    /**
     * แก้ไขข้อมูลครัวเรือน (ส่ง householdId มาใน body)
     */
    @PostMapping("/edit")
    public Household edit(@RequestBody Household h) {
        return repo.save(h);
    }

    /**
     * ลบครัวเรือนตาม id
     */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
