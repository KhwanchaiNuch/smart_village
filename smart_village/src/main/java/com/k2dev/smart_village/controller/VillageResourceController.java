package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.VillageResource;
import com.k2dev.smart_village.service.VillageResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/village-resources")
public class VillageResourceController {

    @Autowired private VillageResourceService service;

    @GetMapping
    public List<VillageResource> list(@RequestParam(required = false) Integer villageId) {
        return service.list(villageId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return service.get(id);
    }

    @GetMapping("/by-village/{villageCode}")
    public List<VillageResource> byVillage(@PathVariable String villageCode) {
        return service.listByVillageCode(villageCode);
    }

    @GetMapping("/by-type/{resourceType}")
    public List<VillageResource> byType(@PathVariable String resourceType) {
        return service.listByType(resourceType);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody VillageResource e) {
        return service.add(e);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody VillageResource e) {
        return service.edit(e);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}
