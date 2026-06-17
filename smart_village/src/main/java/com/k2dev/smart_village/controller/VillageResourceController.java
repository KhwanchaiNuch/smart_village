package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.VillageResource;
import com.k2dev.smart_village.repository.VillageResourceRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.service.GeoScopeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/village-resources")
public class VillageResourceController {

    @Autowired private VillageResourceRepository repo;
    @Autowired private GeoScopeService geoScope;

    private boolean villageOwned(Integer villageId) {
        Integer scopeId = ScopeUtil.getScopeId();
        return scopeId != null && scopeId.equals(villageId);
    }

    @GetMapping
    public List<VillageResource> list(@RequestParam(required = false) Integer villageId) {
        if (villageId != null) {
            return repo.findByVillageIdIn(java.util.List.of(villageId));
        }
        if (ScopeUtil.isAdmin()) return repo.findAll();
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        return repo.findByVillageIdIn(vids);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        VillageResource r = repo.findById(id).orElse(null);
        if (r == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (ScopeUtil.isVillageLevel() && !villageOwned(r.getVillageId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(r);
    }

    @GetMapping("/by-village/{villageCode}")
    public List<VillageResource> byVillage(@PathVariable String villageCode) {
        return repo.findByVillageCode(villageCode);
    }

    @GetMapping("/by-type/{resourceType}")
    public List<VillageResource> byType(@PathVariable String resourceType) {
        return repo.findByResourceType(resourceType);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody VillageResource e) {
        try {
            if (ScopeUtil.isVillageLevel()) {
                e.setVillageId(ScopeUtil.getScopeId());
            }
            e.setResourceId(null);
            return ResponseEntity.ok(repo.save(e));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody VillageResource e) {
        try {
            if (ScopeUtil.isVillageLevel()) {
                VillageResource existing = repo.findById(e.getResourceId()).orElse(null);
                if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
                if (!villageOwned(existing.getVillageId()))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
                e.setVillageId(ScopeUtil.getScopeId());
            }
            return ResponseEntity.ok(repo.save(e));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            VillageResource existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (ScopeUtil.isVillageLevel() && !villageOwned(existing.getVillageId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
