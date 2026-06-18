package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.service.VillageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/villages")
public class VillageController {

    @Autowired private VillageService service;

    @GetMapping
    public List<Village> list(@RequestParam(required = false) Integer tambonId) {
        return service.list(tambonId);
    }

    @GetMapping("/all")
    public List<Village> listAll() {
        return service.listAll();
    }

    @GetMapping("/scoped")
    public List<Village> listScoped() {
        return service.listScoped();
    }

    @GetMapping("/{id}")
    public Village get(@PathVariable Integer id) {
        return service.get(id);
    }

    @GetMapping("/ensure/{id}")
    public ResponseEntity<?> ensureAndGet(@PathVariable Integer id) {
        return service.ensureAndGet(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Village v) {
        return service.add(v);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Village v) {
        return service.edit(v);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}
