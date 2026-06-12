
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/persons")
@RequiredArgsConstructor
public class PersonController {

    @Autowired
    private PersonRepository repo;

    @Autowired
    private HouseholdRepository householdRepo;

    /**
     * ดึงบุคคลทั้งหมดในระบบ (สำหรับ Admin)
     */
    @GetMapping
    public List<Person> list() {
        return repo.findAll();
    }

    /**
     * ดึงบุคคลทั้งหมดในหมู่บ้านที่กำหนด (สำหรับผู้ใช้ระดับหมู่บ้าน role = VILLAGE)
     * วิธีการ: หา householdId ทั้งหมดในหมู่บ้านก่อน แล้วค่อย query บุคคล
     * ตัวอย่าง: GET /api/persons/by-village/3
     */
    @GetMapping("/by-village/{villageId}")
    public List<Person> listByVillage(@PathVariable Integer villageId) {
        List<Integer> householdIds = householdRepo.findByVillageId(villageId)
                .stream()
                .map(h -> h.getHouseholdId())
                .collect(Collectors.toList());
        return repo.findByHouseholdIdIn(householdIds);
    }

    /**
     * ดึงบุคคลทั้งหมดในครัวเรือนที่กำหนด
     * ตัวอย่าง: GET /api/persons/by-household/5
     */
    @GetMapping("/by-household/{householdId}")
    public List<Person> listByHousehold(@PathVariable Integer householdId) {
        return repo.findByHouseholdId(householdId);
    }

    /**
     * ดึงบุคคลตาม id
     */
    @GetMapping("/{id}")
    public Person get(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    /**
     * เพิ่มบุคคลใหม่
     */
    @PostMapping("/add")
    public Person add(@RequestBody Person p) {
        return repo.save(p);
    }

    /**
     * แก้ไขข้อมูลบุคคล (ส่ง personId มาใน body)
     */
    @PostMapping("/edit")
    public Person edit(@RequestBody Person p) {
        return repo.save(p);
    }

    /**
     * ลบบุคคลตาม id
     */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
