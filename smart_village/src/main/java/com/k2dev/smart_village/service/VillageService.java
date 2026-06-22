package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.AmphurRepository;
import com.k2dev.smart_village.repository.TambonRepository;
import com.k2dev.smart_village.repository.VillageRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class VillageService {

    @Autowired private VillageRepository repo;
    @Autowired private TambonRepository tambonRepo;
    @Autowired private AmphurRepository amphurRepo;
    @Autowired private GeoScopeService geoScope;

    public List<Village> list(Integer tambonId) {
        if (tambonId != null) return repo.findByTambonId(tambonId);
        return repo.findAll();
    }

    public List<Village> listAll() {
        return repo.findAll();
    }

    public List<Village> listScoped() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        if (ScopeUtil.isVillageLevel()) {
            Integer vid = ScopeUtil.getScopeId();
            if (vid == null) return List.of();
            return repo.findById(vid).map(List::of).orElse(List.of());
        }
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null || vids.isEmpty()) return List.of();
        return repo.findAllById(vids);
    }

    public Village get(Integer id) {
        return repo.findById(id).orElseThrow();
    }

    public ResponseEntity<?> ensureAndGet(Integer id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(Map.of("message", "ไม่พบหมู่บ้าน กรุณาให้ admin สร้างหมู่บ้านก่อน")));
    }

    public ResponseEntity<?> add(Village v) {
        String role = ScopeUtil.currentUser() != null ? ScopeUtil.currentUser().getRole() : null;
        Integer scopeId = ScopeUtil.getScopeId();

        if ("VILLAGE".equals(role) || "VIEWER".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("message", "ผู้รับชมหรือผู้ใช้ระดับหมู่บ้านไม่สามารถเพิ่มหมู่บ้านได้"));
        }

        if (!"ADMIN".equals(role) && v.getTambonId() != null) {
            Tambon tambon = tambonRepo.findById(v.getTambonId()).orElse(null);
            if (tambon == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "ไม่พบตำบลที่ระบุ"));
            }
            if ("TAMBON".equals(role)) {
                if (!v.getTambonId().equals(scopeId))
                    return ResponseEntity.status(403).body(Map.of("message", "คุณสามารถเพิ่มหมู่บ้านได้เฉพาะในตำบลของตัวเองเท่านั้น"));
            } else if ("AMPHUR".equals(role)) {
                if (!tambon.getAmphurId().equals(scopeId))
                    return ResponseEntity.status(403).body(Map.of("message", "ตำบลที่เลือกไม่อยู่ในอำเภอของคุณ"));
            } else if ("PROVINCE".equals(role)) {
                Amphur amphur = amphurRepo.findById(tambon.getAmphurId()).orElse(null);
                if (amphur == null || !amphur.getProvinceId().equals(scopeId))
                    return ResponseEntity.status(403).body(Map.of("message", "ตำบลที่เลือกไม่อยู่ในจังหวัดของคุณ"));
            }
        }

        try {
            return ResponseEntity.ok(repo.saveAndFlush(v));
        } catch (Exception e) {
            Throwable root = e;
            while (root.getCause() != null) root = root.getCause();
            return ResponseEntity.status(500).body(Map.of("message", root.getMessage() != null ? root.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> edit(Village v) {
        try {
            if (v.getVillageId() == null)
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุ villageId"));
            if (!repo.existsById(v.getVillageId()))
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบหมู่บ้านนี้"));
            return ResponseEntity.ok(repo.saveAndFlush(v));
        } catch (Exception e) {
            Throwable root = e;
            while (root.getCause() != null) root = root.getCause();
            return ResponseEntity.status(500).body(Map.of("message", root.getMessage() != null ? root.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> delete(Integer id) {
        try {
            if (!repo.existsById(id))
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบหมู่บ้านนี้"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}