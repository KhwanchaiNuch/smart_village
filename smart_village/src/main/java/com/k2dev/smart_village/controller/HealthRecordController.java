
package com.k2dev.smart_village.controller;
import com.k2dev.smart_village.entity.HealthRecord;
import com.k2dev.smart_village.repository.HealthRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/health-records")
@RequiredArgsConstructor
public class HealthRecordController {
 private final HealthRecordRepository repo;
 @GetMapping public List<HealthRecord> list(){ return repo.findAll(); }
 @PostMapping public HealthRecord add(@RequestBody HealthRecord h){ return repo.save(h); }
 @PutMapping("/{id}") public HealthRecord edit(@PathVariable Integer id,@RequestBody HealthRecord h){ h.setId(id); return repo.save(h); }
 @DeleteMapping("/{id}") public void del(@PathVariable Integer id){ repo.deleteById(id); }
}
