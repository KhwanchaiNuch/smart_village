
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Province;
import com.k2dev.smart_village.repository.ProvinceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provinces")
@RequiredArgsConstructor
public class ProvinceController {

    private final ProvinceRepository repo;

    @GetMapping
    public List<Province> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Province get(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping
    public Province add(@RequestBody Province p) {
        return repo.save(p);
    }

    @PutMapping("/{id}")
    public Province edit(@PathVariable Integer id, @RequestBody Province p) {
        p.setProvinceId(id);
        return repo.save(p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
