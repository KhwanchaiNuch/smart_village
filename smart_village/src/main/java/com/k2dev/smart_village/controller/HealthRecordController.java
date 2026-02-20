
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.HealthRecord;
import com.k2dev.smart_village.entity.Province;
import com.k2dev.smart_village.repository.HealthRecordRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/health-records")
@RequiredArgsConstructor
public class HealthRecordController {
	
	@Autowired
	private HealthRecordRepository repo;

	@GetMapping
	public List<HealthRecord> list() {
		List<HealthRecord> list = repo.findAll();
		System.out.print("list => "+ list);
		return repo.findAll();
	}
	
	@GetMapping("/{id}")
    public HealthRecord get(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

	@PostMapping("/add")
	public HealthRecord add(@RequestBody HealthRecord h) {
		return repo.save(h);
	}

	@PostMapping("/edit")
	public HealthRecord edit(@RequestBody HealthRecord h) {
		return repo.save(h);
	}

	@PostMapping("/delete")
	public void del(@PathVariable Integer id) {
		repo.deleteById(id);
	}
}
