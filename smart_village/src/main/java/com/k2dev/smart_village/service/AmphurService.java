package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.AmphurRepository;
import com.k2dev.smart_village.repository.TambonRepository;
import com.k2dev.smart_village.repository.VillageRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AmphurService {

    @Autowired private AmphurRepository repo;
    @Autowired private TambonRepository tambonRepo;
    @Autowired private VillageRepository villageRepo;

    public List<Amphur> list(Integer provinceId) {
        if (provinceId == null) return repo.findAll();
        return repo.findByProvinceId(provinceId);
    }

    public ResponseEntity<?> get(Integer id) {
        Amphur a = repo.findById(id).orElse(null);
        if (a == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        return ResponseEntity.ok(a);
    }

    public List<Tambon> listTambons(Integer amphurId) {
        return tambonRepo.findByAmphurId(amphurId);
    }

    public List<Village> listVillages(Integer amphurId) {
        List<Integer> tambonIds = tambonRepo.findByAmphurId(amphurId).stream()
                .map(Tambon::getTambonId).toList();
        return tambonIds.isEmpty() ? List.of() : villageRepo.findByTambonIdIn(tambonIds);
    }

    public List<Amphur> listScoped() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        UserPrincipal u = ScopeUtil.currentUser();
        if (u == null) return List.of();
        String role = u.getRole();
        Integer scopeId = u.getScopeId();
        if (scopeId == null) return List.of();

        return switch (role) {
            case "PROVINCE" -> repo.findByProvinceId(scopeId);
            case "AMPHUR"   -> repo.findById(scopeId).map(List::of).orElse(List.of());
            case "TAMBON"   -> {
                Tambon t = tambonRepo.findById(scopeId).orElse(null);
                if (t == null) yield List.of();
                yield repo.findById(t.getAmphurId()).map(List::of).orElse(List.of());
            }
            case "VILLAGE"  -> {
                Village v = villageRepo.findById(scopeId).orElse(null);
                if (v == null || v.getTambonId() == null) yield List.of();
                Tambon t = tambonRepo.findById(v.getTambonId()).orElse(null);
                if (t == null) yield List.of();
                yield repo.findById(t.getAmphurId()).map(List::of).orElse(List.of());
            }
            default -> List.of();
        };
    }

    public Amphur add(Amphur a) {
        return repo.save(a);
    }

    public Amphur edit(Amphur a) {
        return repo.save(a);
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }
}