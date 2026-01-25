
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.repository.AmphurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amphurs")
@RequiredArgsConstructor
public class AmphurController {

    private final AmphurRepository repo;

    @GetMapping
    public List<Amphur> list(@RequestParam Integer provinceId) {
        return repo.findByProvinceId(provinceId);
    }

    @PostMapping
    public Amphur add(@RequestBody Amphur a) {
        return repo.save(a);
    }

    @PutMapping("/{id}")
    public Amphur edit(@PathVariable Integer id, @RequestBody Amphur a) {
        a.setAmphurId(id);
        return repo.save(a);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
