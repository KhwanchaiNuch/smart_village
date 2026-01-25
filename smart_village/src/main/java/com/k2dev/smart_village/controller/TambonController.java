
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.repository.TambonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tambons")
@RequiredArgsConstructor
public class TambonController {

    private final TambonRepository repo;

    @GetMapping
    public List<Tambon> list(@RequestParam Integer amphurId) {
        return repo.findByAmphurId(amphurId);
    }

    @PostMapping
    public Tambon add(@RequestBody Tambon t) {
        return repo.save(t);
    }

    @PutMapping("/{id}")
    public Tambon edit(@PathVariable Integer id, @RequestBody Tambon t) {
        t.setTambonId(id);
        return repo.save(t);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
