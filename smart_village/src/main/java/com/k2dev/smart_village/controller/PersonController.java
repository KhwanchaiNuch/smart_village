
package com.k2dev.smart_village.controller;
import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/persons")
@RequiredArgsConstructor
public class PersonController {
 private final PersonRepository repo;

 @GetMapping public List<Person> list(){ return repo.findAll(); }
 @GetMapping("/{id}") public Person get(@PathVariable Integer id){ return repo.findById(id).orElseThrow(); }
 @PostMapping public Person add(@RequestBody Person p){ return repo.save(p); }
 @PutMapping("/{id}") public Person edit(@PathVariable Integer id,@RequestBody Person p){ p.setPersonId(id); return repo.save(p); }
 @DeleteMapping("/{id}") public void del(@PathVariable Integer id){ repo.deleteById(id); }
}
