
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.repository.HouseholdRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/households")
@RequiredArgsConstructor
public class HouseholdController {
	
	@Autowired
	private HouseholdRepository repo;

	@GetMapping
	public List<Household> list() {
		return repo.findAll();
	}

	@GetMapping("/{id}")
	public Household get(@PathVariable Integer id) {
		return repo.findById(id).orElseThrow();
	}

	@PostMapping("/add")
	public Household add(@RequestBody Household h) {
		return repo.save(h);
	}

	@PostMapping("/edit")
	public Household edit(@PathVariable Integer id, @RequestBody Household h) {
		return repo.save(h);
	}

	@PostMapping("/delete")
	public void del(@PathVariable Integer id) {
		repo.deleteById(id);
	}
}
