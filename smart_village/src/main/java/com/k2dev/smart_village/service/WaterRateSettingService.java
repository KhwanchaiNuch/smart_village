package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.WaterRateSetting;
import com.k2dev.smart_village.repository.WaterRateSettingRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class WaterRateSettingService {

    @Autowired private WaterRateSettingRepository repo;

    public List<WaterRateSetting> list(Integer villageId) {
        if (villageId != null) {
            return repo.findByVillageIdOrderByEffectiveFromDesc(villageId);
        }
        return repo.findAllByOrderByEffectiveFromDesc();
    }

    /** หาอัตราค่าน้ำที่ใช้ ณ วันที่กำหนด สำหรับ village นี้โดยเฉพาะ (แต่ละหมู่บ้านต้องตั้งอัตราของตัวเอง ไม่มีอัตรากลางร่วมกันแล้ว) */
    public BigDecimal getCurrentRate(Integer villageId, LocalDate onDate) {
        // แต่ละหมู่บ้านต้องตั้งอัตราค่าน้ำของตัวเอง ไม่มี fallback ไปใช้อัตรากลางร่วมกันอีกต่อไป
        if (villageId == null) return null;
        for (WaterRateSetting r : repo.findByVillageIdOrderByEffectiveFromDesc(villageId)) {
            if (!r.getEffectiveFrom().isAfter(onDate)) return r.getRatePerUnit();
        }
        return null;
    }

    public ResponseEntity<?> add(WaterRateSetting r) {
        try {
            if (r.getRatePerUnit() == null || r.getEffectiveFrom() == null) {
                return ResponseEntity.status(400).body(Map.of("message", "กรุณาระบุอัตราค่าน้ำและวันที่มีผล"));
            }
            if (!ScopeUtil.isAdmin() && r.getVillageId() == null) {
                r.setVillageId(ScopeUtil.getScopeId());
            }
            if (r.getVillageId() == null) {
                return ResponseEntity.status(400).body(Map.of("message", "กรุณาระบุหมู่บ้าน (แต่ละหมู่บ้านต้องตั้งอัตราค่าน้ำของตัวเอง)"));
            }
            return ResponseEntity.ok(repo.save(r));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> delete(Long id) {
        try {
            if (!repo.existsById(id)) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
