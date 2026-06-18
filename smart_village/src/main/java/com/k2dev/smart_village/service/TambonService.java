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
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TambonService {

    @Autowired private TambonRepository repo;
    @Autowired private AmphurRepository amphurRepo;
    @Autowired private VillageRepository villageRepo;

    public List<Tambon> list(Integer amphurId) {
        return repo.findByAmphurId(amphurId);
    }

    public List<Tambon> listAll() {
        return repo.findAll();
    }

    public List<Tambon> listScoped() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        UserPrincipal u = ScopeUtil.currentUser();
        if (u == null) return List.of();
        String role = u.getRole();
        Integer scopeId = u.getScopeId();
        if (scopeId == null) return List.of();

        return switch (role) {
            case "PROVINCE" -> {
                List<Integer> amphurIds = amphurRepo.findByProvinceId(scopeId)
                        .stream().map(Amphur::getAmphurId).toList();
                if (amphurIds.isEmpty()) yield List.of();
                yield repo.findByAmphurIdIn(amphurIds);
            }
            case "AMPHUR"  -> repo.findByAmphurId(scopeId);
            case "TAMBON"  -> repo.findById(scopeId).map(List::of).orElse(List.of());
            case "VILLAGE" -> {
                Village v = villageRepo.findById(scopeId).orElse(null);
                if (v == null || v.getTambonId() == null) yield List.of();
                yield repo.findById(v.getTambonId()).map(List::of).orElse(List.of());
            }
            default -> List.of();
        };
    }

    public Tambon get(Integer id) {
        return repo.findById(id).orElseThrow();
    }

    public Tambon add(Tambon t) {
        return repo.save(t);
    }

    public Tambon edit(Tambon t) {
        return repo.save(t);
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }
}