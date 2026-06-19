package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.service.HouseholdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/households")
public class HouseholdController {

    @Autowired private HouseholdService service;

    @GetMapping
    public List<Household> list(
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) Integer tambonId,
            @RequestParam(required = false) Integer amphurId,
            @RequestParam(required = false) Integer provinceId) {
        return service.list(villageId, tambonId, amphurId, provinceId);
    }

    @GetMapping("/by-village/{villageId}")
    public List<Household> listByVillage(@PathVariable Integer villageId) {
        return service.listByVillage(villageId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return service.get(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Household h) {
        return service.add(h);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Household h) {
        return service.edit(h);
    }

    @GetMapping("/map-markers")
    public List<java.util.Map<String, Object>> mapMarkers(
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) Integer tambonId,
            @RequestParam(required = false) Integer amphurId,
            @RequestParam(required = false) Integer provinceId) {
        return service.mapMarkers(villageId, tambonId, amphurId, provinceId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}
