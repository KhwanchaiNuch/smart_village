
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.HouseholdEconomic;
import com.k2dev.smart_village.repository.HouseholdEconomicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/household-economics")
public class HouseholdEconomicController {

    @Autowired
    private HouseholdEconomicRepository repo;

    @GetMapping
    public List<HouseholdEconomic> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public HouseholdEconomic get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @GetMapping("/by-household/{householdId}")
    public List<HouseholdEconomic> byHousehold(@PathVariable Long householdId) {
        return repo.findByHouseholdId(householdId);
    }

    @GetMapping("/poor")
    public List<HouseholdEconomic> poor() {
        return repo.findByPoorFlag(true);
    }

    @PostMapping("/add")
    public HouseholdEconomic add(@RequestBody HouseholdEconomic e) {
        return repo.save(e);
    }

    @PostMapping("/edit")
    public HouseholdEconomic edit(@RequestBody HouseholdEconomic e) {
        return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
