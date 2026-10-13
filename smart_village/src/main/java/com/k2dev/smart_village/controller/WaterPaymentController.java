package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.WaterPayment;
import com.k2dev.smart_village.service.WaterPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water-payments")
public class WaterPaymentController {

    @Autowired private WaterPaymentService service;

    @GetMapping("/by-bill/{billId}")
    public List<Map<String, Object>> byBill(@PathVariable Long billId) {
        return service.listByBill(billId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody WaterPayment p) {
        return service.pay(p);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return service.voidPayment(id);
    }
}
