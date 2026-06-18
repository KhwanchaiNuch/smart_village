package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Menu;
import com.k2dev.smart_village.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
public class MenuController {

    @Autowired private MenuService service;

    @GetMapping
    public List<Menu> list() { return service.list(); }

    @GetMapping("/active")
    public List<Menu> active() { return service.listActive(); }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) { return service.get(id); }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Menu m) { return service.add(m); }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Menu m) { return service.edit(m); }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) { return service.delete(id); }
}
