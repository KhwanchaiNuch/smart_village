package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.service.RoleMenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role-menus")
public class RoleMenuController {

    @Autowired private RoleMenuService service;

    @GetMapping("/matrix")
    public ResponseEntity<?> matrix() {
        return service.matrix();
    }

    @PostMapping("/save-all")
    public ResponseEntity<?> saveAll(@RequestBody List<RoleMenuService.PermissionEntry> entries) {
        return service.saveAll(entries);
    }

    @GetMapping("/my-permissions")
    public ResponseEntity<?> myPermissions() {
        return service.myPermissions();
    }

    @GetMapping("/by-role/{roleId}")
    public List<Long> byRole(@PathVariable Long roleId) {
        return service.byRole(roleId);
    }
}
