package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.WaterBill;
import com.k2dev.smart_village.service.WaterBillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water-bills")
public class WaterBillController {

    @Autowired private WaterBillService service;

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) Integer villageId,
                                           @RequestParam(required = false) String period) {
        return service.list(villageId, period);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/last-reading/{householdId}")
    public ResponseEntity<?> lastReading(@PathVariable Integer householdId) {
        return service.getLastReading(householdId);
    }

    @GetMapping("/pending")
    public List<Map<String, Object>> pending(@RequestParam(required = false) Integer villageId,
                                              @RequestParam String period) {
        return service.pendingHouseholds(villageId, period);
    }

    @GetMapping("/by-household/{householdId}")
    public ResponseEntity<?> byHousehold(@PathVariable Integer householdId) {
        return service.byHousehold(householdId);
    }

    @GetMapping("/summary")
    public Map<String, Object> summary(@RequestParam(required = false) Integer villageId,
                                        @RequestParam(required = false) String period) {
        return service.summary(villageId, period);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody WaterBill b) {
        return service.add(b);
    }

    @PostMapping("/add-bulk")
    public List<Map<String, Object>> addBulk(@RequestBody List<WaterBill> items) {
        return service.addBulk(items);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody WaterBill b) {
        return service.edit(b);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return service.delete(id);
    }
}
