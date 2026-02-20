
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.repository.PersonRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/persons")
@RequiredArgsConstructor
public class PersonController {
	
	@Autowired
	private PersonRepository repo;
	
	@GetMapping
	public List<Person> list() {
		return repo.findAll();
	}

	@GetMapping("/{id}")
	public Person get(@PathVariable Integer id) {
		return repo.findById(id).orElseThrow();
	}

	@PostMapping("/add")
	public Person add(@RequestBody Person p) {
		return repo.save(p);
	}

	@PostMapping("/edit")
	public Person edit(@RequestBody Person p) {
		return repo.save(p);
	}

	@PostMapping("/delete")
	public void del(@PathVariable Integer id) {
		repo.deleteById(id);
	}
}
