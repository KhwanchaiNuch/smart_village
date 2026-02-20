
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.repository.AmphurRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amphurs")
@RequiredArgsConstructor
public class AmphurController {

	@Autowired
    private AmphurRepository repo;

    @GetMapping
    public List<Amphur> list(@RequestParam Integer provinceId) {
        return repo.findByProvinceId(provinceId);
    }

    @PostMapping("/add")
    public Amphur add(@RequestBody Amphur a) {
        return repo.save(a);
    }

    @PostMapping("/edit")
    public Amphur edit(@RequestBody Amphur a) {
        return repo.save(a);
    }

    @PostMapping("/delete")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
