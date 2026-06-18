package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Menu;
import com.k2dev.smart_village.entity.Role;
import com.k2dev.smart_village.entity.RoleMenu;
import com.k2dev.smart_village.repository.MenuRepository;
import com.k2dev.smart_village.repository.RoleMenuRepository;
import com.k2dev.smart_village.repository.RoleRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoleMenuService {

    @Autowired private RoleRepository roleRepo;
    @Autowired private MenuRepository menuRepo;
    @Autowired private RoleMenuRepository roleMenuRepo;

    public ResponseEntity<?> matrix() {
        List<Role> roles = roleRepo.findAll();
        List<Menu> menus = menuRepo.findAll();
        List<RoleMenu> all = roleMenuRepo.findAll();

        List<Map<String, Object>> permissions = all.stream().map(rm -> {
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("roleId",    rm.getRoleId());
            p.put("menuId",    rm.getMenuId());
            p.put("canView",   Boolean.TRUE.equals(rm.getCanView()));
            p.put("canAdd",    Boolean.TRUE.equals(rm.getCanAdd()));
            p.put("canEdit",   Boolean.TRUE.equals(rm.getCanEdit()));
            p.put("canDelete", Boolean.TRUE.equals(rm.getCanDelete()));
            return p;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("roles", roles);
        result.put("menus", menus);
        result.put("permissions", permissions);
        return ResponseEntity.ok(result);
    }

    @Transactional
    public ResponseEntity<?> saveAll(List<PermissionEntry> entries) {
        try {
            roleMenuRepo.deleteAll();
            List<RoleMenu> toSave = entries.stream()
                    .map(e -> new RoleMenu(e.getRoleId(), e.getMenuId(),
                            e.getCanView(), e.getCanAdd(), e.getCanEdit(), e.getCanDelete()))
                    .toList();
            roleMenuRepo.saveAll(toSave);
            return ResponseEntity.ok(Map.of("message", "บันทึกสิทธิ์ทั้งหมดสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> myPermissions() {
        UserPrincipal user = ScopeUtil.currentUser();
        if (user == null) return ResponseEntity.status(401).build();

        if (ScopeUtil.isAdmin()) {
            List<Map<String, Object>> result = menuRepo.findAll().stream().map(m -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("menuUrl",   m.getUrl());
                entry.put("menuName",  m.getName());
                entry.put("canView",   true);
                entry.put("canAdd",    true);
                entry.put("canEdit",   true);
                entry.put("canDelete", true);
                return entry;
            }).toList();
            return ResponseEntity.ok(result);
        }

        Optional<Role> roleOpt = roleRepo.findByName(user.getRole());
        if (roleOpt.isEmpty()) return ResponseEntity.ok(List.of());

        List<RoleMenu> perms = roleMenuRepo.findByIdRoleId(roleOpt.get().getId());
        Map<Long, Menu> menuMap = menuRepo.findAll().stream()
                .collect(Collectors.toMap(Menu::getId, m -> m));

        List<Map<String, Object>> result = perms.stream()
                .filter(rm -> menuMap.containsKey(rm.getMenuId()))
                .map(rm -> {
                    Menu m = menuMap.get(rm.getMenuId());
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("menuUrl",   m.getUrl());
                    entry.put("menuName",  m.getName());
                    entry.put("canView",   Boolean.TRUE.equals(rm.getCanView()));
                    entry.put("canAdd",    Boolean.TRUE.equals(rm.getCanAdd()));
                    entry.put("canEdit",   Boolean.TRUE.equals(rm.getCanEdit()));
                    entry.put("canDelete", Boolean.TRUE.equals(rm.getCanDelete()));
                    return entry;
                }).toList();

        return ResponseEntity.ok(result);
    }

    public List<Long> byRole(Long roleId) {
        return roleMenuRepo.findByIdRoleId(roleId).stream()
                .map(RoleMenu::getMenuId)
                .toList();
    }

    public static class PermissionEntry {
        private Long roleId;
        private Long menuId;
        private Boolean canView;
        private Boolean canAdd;
        private Boolean canEdit;
        private Boolean canDelete;

        public Long getRoleId()       { return roleId;    }
        public Long getMenuId()       { return menuId;    }
        public Boolean getCanView()   { return canView;   }
        public Boolean getCanAdd()    { return canAdd;    }
        public Boolean getCanEdit()   { return canEdit;   }
        public Boolean getCanDelete() { return canDelete; }

        public void setRoleId(Long roleId)          { this.roleId    = roleId;    }
        public void setMenuId(Long menuId)          { this.menuId    = menuId;    }
        public void setCanView(Boolean canView)     { this.canView   = canView;   }
        public void setCanAdd(Boolean canAdd)       { this.canAdd    = canAdd;    }
        public void setCanEdit(Boolean canEdit)     { this.canEdit   = canEdit;   }
        public void setCanDelete(Boolean canDelete) { this.canDelete = canDelete; }
    }
}
