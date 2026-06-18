
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Province;
import com.k2dev.smart_village.service.ProvinceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provinces")
public class ProvinceController {

    @Autowired private ProvinceService service;

    @GetMapping
    public List<Province> list() { return service.list(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) { return service.get(id); }

    @PostMapping("/add")
    public Province add(@RequestBody Province p) { return service.add(p); }

    @PostMapping("/edit")
    public Province edit(@RequestBody Province p) { return service.edit(p); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) { service.delete(id); }
}
