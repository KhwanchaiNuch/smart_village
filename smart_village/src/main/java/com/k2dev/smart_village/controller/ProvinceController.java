
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Province;
import com.k2dev.smart_village.repository.ProvinceRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provinces")
@RequiredArgsConstructor
public class ProvinceController {

	@Autowired
    private ProvinceRepository repo;

    @GetMapping
    public List<Province> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Province get(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping("/add")
    public Province add(@RequestBody Province p) {
        return repo.save(p);
    }

    @PostMapping("/edit")
    public Province edit(@RequestBody Province p) {
        return repo.save(p);
    }

    @PostMapping("/delete")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
