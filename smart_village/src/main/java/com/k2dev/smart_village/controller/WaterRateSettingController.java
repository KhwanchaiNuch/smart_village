package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.WaterRateSetting;
import com.k2dev.smart_village.service.WaterRateSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water-rates")
public class WaterRateSettingController {

    @Autowired private WaterRateSettingService service;

    @GetMapping
    public List<WaterRateSetting> list(@RequestParam(required = false) Integer villageId) {
        return service.list(villageId);
    }

    @GetMapping("/current")
    public Map<String, Object> current(@RequestParam(required = false) Integer villageId,
                                        @RequestParam(required = false) String onDate) {
        LocalDate date = onDate != null ? LocalDate.parse(onDate) : LocalDate.now();
        BigDecimal rate = service.getCurrentRate(villageId, date);
        return Map.of("ratePerUnit", rate == null ? BigDecimal.ZERO : rate);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody WaterRateSetting r) {
        return service.add(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return service.delete(id);
    }
}
