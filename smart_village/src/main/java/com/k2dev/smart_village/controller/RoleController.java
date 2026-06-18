package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Role;
import com.k2dev.smart_village.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired private RoleService service;

    @GetMapping
    public List<Role> list() { return service.list(); }

    @GetMapping("/active")
    public List<Role> active() { return service.listActive(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) { return service.get(id); }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Role r) { return service.add(r); }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Role r) { return service.edit(r); }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) { return service.delete(id); }
}
