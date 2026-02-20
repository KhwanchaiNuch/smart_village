
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.repository.TambonRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tambons")
@RequiredArgsConstructor
public class TambonController {

	@Autowired
    private TambonRepository repo;

    @GetMapping
    public List<Tambon> list(@RequestParam Integer amphurId) {
        return repo.findByAmphurId(amphurId);
    }
    
    @GetMapping("/{id}")
	public Tambon get(@PathVariable Integer id) {
		return repo.findById(id).orElseThrow();
	}

    @PostMapping("/add")
    public Tambon add(@RequestBody Tambon t) {
        return repo.save(t);
    }

    @PostMapping("/edit")
    public Tambon edit(@RequestBody Tambon t) {
        return repo.save(t);
    }

    @PostMapping("/delete")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
