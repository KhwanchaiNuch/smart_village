
package com.k2dev.smart_village.controller;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.service.TambonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tambons")
public class TambonController {

    @Autowired private TambonService service;

    @GetMapping
    public List<Tambon> list(@RequestParam Integer amphurId) { return service.list(amphurId); }

    @GetMapping("/all")
    public List<Tambon> listAll() { return service.listAll(); }

    @GetMapping("/scoped")
    public List<Tambon> listScoped() { return service.listScoped(); }


    @GetMapping("/{id}")
    public Tambon get(@PathVariable Integer id) { return service.get(id); }

    @PostMapping("/add")
    public Tambon add(@RequestBody Tambon t) { return service.add(t); }

    @PostMapping("/edit")
    public Tambon edit(@RequestBody Tambon t) { return service.edit(t); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) { service.delete(id); }
}
