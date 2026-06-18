package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.service.AmphurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amphurs")
public class AmphurController {

    @Autowired private AmphurService service;

    @GetMapping
    public List<Amphur> list(@RequestParam Integer provinceId) { return service.list(provinceId); }

    @GetMapping("/all")
    public List<Amphur> listAll() { return service.list(null); }

    @GetMapping("/scoped")
    public List<Amphur> listScoped() { return service.listScoped(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) { return service.get(id); }

    @GetMapping("/{id}/tambons")
    public List<Tambon> listTambons(@PathVariable Integer id) { return service.listTambons(id); }

    @GetMapping("/{id}/villages")
    public List<Village> listVillages(@PathVariable Integer id) { return service.listVillages(id); }

    @PostMapping("/add")
    public Amphur add(@RequestBody Amphur a) { return service.add(a); }

    @PostMapping("/edit")
    public Amphur edit(@RequestBody Amphur a) { return service.edit(a); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) { service.delete(id); }
}
