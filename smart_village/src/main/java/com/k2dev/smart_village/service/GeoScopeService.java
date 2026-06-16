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

/**
 * แปล role + scopeId ของ current user → List<villageId> ที่มีสิทธิ์เข้าถึง
 *
 * VILLAGE  : scopeId = villageId  → [scopeId]
 * TAMBON   : scopeId = tambonId   → villages ใน tambon นั้น
 * AMPHUR   : scopeId = amphurId   → tambons ใน amphur → villages ทั้งหมด
 * PROVINCE : scopeId = provinceId → amphurs → tambons → villages ทั้งหมด
 * ADMIN    : คืน null = ไม่จำกัด (caller ต้อง handle null เอง)
 */
@Service
public class GeoScopeService {

    @Autowired private VillageRepository villageRepo;
    @Autowired private TambonRepository  tambonRepo;
    @Autowired private AmphurRepository  amphurRepo;

    /**
     * คืน List ของ villageId ที่ current user เข้าถึงได้
     * null = ADMIN (ไม่จำกัด)
     * empty list = ไม่มีสิทธิ์เลย
     */
    public List<Integer> getVillageIds() {
        if (ScopeUtil.isAdmin()) return null; // no filter

        UserPrincipal u = ScopeUtil.currentUser();
        if (u == null) return List.of();

        String  role    = u.getRole();
        Integer scopeId = u.getScopeId();
        if (role == null || scopeId == null) return List.of();

        return switch (role) {
            case "VILLAGE" -> List.of(scopeId);

            case "TAMBON" -> villageRepo.findByTambonId(scopeId)
                    .stream().map(Village::getVillageId).distinct().toList();

            case "AMPHUR" -> {
                // 1 query for tambons, then 1 IN query for villages
                List<Integer> tambonIds = tambonRepo.findByAmphurId(scopeId)
                        .stream().map(Tambon::getTambonId).toList();
                if (tambonIds.isEmpty()) yield List.of();
                yield villageRepo.findByTambonIdIn(tambonIds)
                        .stream().map(Village::getVillageId).distinct().toList();
            }

            case "PROVINCE" -> {
                // 1 query for amphurs, 1 IN query for tambons, 1 IN query for villages
                List<Integer> amphurIds = amphurRepo.findByProvinceId(scopeId)
                        .stream().map(Amphur::getAmphurId).toList();
                if (amphurIds.isEmpty()) yield List.of();
                List<Integer> tambonIds = tambonRepo.findByAmphurIdIn(amphurIds)
                        .stream().map(Tambon::getTambonId).toList();
                if (tambonIds.isEmpty()) yield List.of();
                yield villageRepo.findByTambonIdIn(tambonIds)
                        .stream().map(Village::getVillageId).distinct().toList();
            }

            default -> List.of();
        };
    }

    public <T> boolean inScope(List<Integer> villageIds, Integer villageId) {
        if (villageIds == null) return true; // ADMIN: all
        return villageIds.contains(villageId);
    }

    /**
     * ตรวจว่า villageId นี้อยู่ใน scope ของ current user
     * ใช้แทน ScopeUtil.getScopeId().equals(villageId) ใน write operations
     * รองรับทุก role: VILLAGE, TAMBON, AMPHUR, PROVINCE, ADMIN
     */
    public boolean inScopeByVillage(Integer villageId) {
        List<Integer> vids = getVillageIds();
        return inScope(vids, villageId);
    }
}
