package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.VillageNeedSurvey;
import com.k2dev.smart_village.service.VillageNeedSurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/village-need-surveys")
public class VillageNeedSurveyController {

    @Autowired private VillageNeedSurveyService service;

    @GetMapping
    public List<VillageNeedSurvey> list(@RequestParam(required = false) Integer villageId) {
        return service.list(villageId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return service.get(id);
    }

    @GetMapping("/by-household/{householdId}")
    public List<VillageNeedSurvey> byHousehold(@PathVariable Integer householdId) {
        return service.listByHousehold(householdId);
    }

    @GetMapping("/by-person/{personId}")
    public List<VillageNeedSurvey> byPerson(@PathVariable Integer personId) {
        return service.listByPerson(personId);
    }

    @GetMapping("/by-need-type/{needType}")
    public List<VillageNeedSurvey> byNeedType(@PathVariable String needType) {
        return service.listByNeedType(needType);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody VillageNeedSurvey e) {
        return service.add(e);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody VillageNeedSurvey e) {
        return service.edit(e);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}
