package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.AppUserRequest;
import com.k2dev.smart_village.service.AppUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AppUserController {

    private final AppUserService service;

    public AppUserController(AppUserService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> listAll() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Integer id) {
        return service.getOne(id);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody AppUserRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody AppUserRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return service.delete(id);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Integer id) {
        return service.toggle(id);
    }
}
