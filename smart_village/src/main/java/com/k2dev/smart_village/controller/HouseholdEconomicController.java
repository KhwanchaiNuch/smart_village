package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.HouseholdEconomic;
import com.k2dev.smart_village.service.HouseholdEconomicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/household-economics")
public class HouseholdEconomicController {

    @Autowired private HouseholdEconomicService service;

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) Integer villageId) {
        return service.list(villageId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/by-household/{householdId}")
    public List<HouseholdEconomic> byHousehold(@PathVariable Long householdId) {
        return service.listByHousehold(householdId);
    }

    @GetMapping("/poor")
    public List<HouseholdEconomic> poor() {
        return service.listPoor();
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody HouseholdEconomic e) {
        return service.add(e);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody HouseholdEconomic e) {
        return service.edit(e);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return service.delete(id);
    }
}
