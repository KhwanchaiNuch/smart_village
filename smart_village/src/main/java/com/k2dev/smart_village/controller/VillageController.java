
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.VillageRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/villages")
@RequiredArgsConstructor
public class VillageController {

	@Autowired
    private VillageRepository repo;

    @GetMapping
    public List<Village> list(@RequestParam Integer tambonId) {
        return repo.findByTambonId(tambonId);
    }
    
    @GetMapping("/{id}")
	public Village get(@PathVariable Integer id) {
		return repo.findById(id).orElseThrow();
	}

    @PostMapping("/add")
    public Village add(@RequestBody Village v) {
        return repo.save(v);
    }

    @PostMapping("/edit")
    public Village edit(@PathVariable Integer id, @RequestBody Village v) {
        v.setVillageId(id);
        return repo.save(v);
    }

    @PostMapping("/delete")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
