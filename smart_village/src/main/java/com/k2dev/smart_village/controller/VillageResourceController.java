package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.VillageResource;
import com.k2dev.smart_village.repository.VillageResourceRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/village-resources")
public class VillageResourceController {

    @Autowired private VillageResourceRepository repo;

    @GetMapping
    public List<VillageResource> list() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        Integer vid = ScopeUtil.getScopeId();
        if (vid == null) return List.of();
        return repo.findByVillageId(vid);
    }

    @GetMapping("/{id}")
    public VillageResource get(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
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
    public VillageResource add(@RequestBody VillageResource e) {
        e.setResourceId(null);
        // auto-set villageId จาก scope ของ user
        if (e.getVillageId() == null && !ScopeUtil.isAdmin()) {
            e.setVillageId(ScopeUtil.getScopeId());
        }
        return repo.save(e);
    }

    @PostMapping("/edit")
    public VillageResource edit(@RequestBody VillageResource e) {
        return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
