package com.k2dev.smart_village.security;

import com.k2dev.smart_village.entity.Menu;
import com.k2dev.smart_village.entity.Role;
import com.k2dev.smart_village.entity.RoleMenu;
import com.k2dev.smart_village.entity.RoleMenuId;
import com.k2dev.smart_village.repository.MenuRepository;
import com.k2dev.smart_village.repository.RoleMenuRepository;
import com.k2dev.smart_village.repository.RoleRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;
import java.util.Optional;

/**
 * PermissionInterceptor — ตรวจสิทธิ์ก่อนเข้า API endpoint
 *
 * ตรรกะ:
 * 1. Path ที่ขึ้น bypass list → allow ทันที
 * 2. ADMIN role → allow ทันที (bypass ทุก permission)
 * 3. หา Menu ที่ตรง path → ถ้าไม่มี menu ตรง → allow (path ที่ไม่ได้ map)
 * 4. หา role_menu record → ถ้าไม่มี row → deny 403
 * 5. ตรวจ HTTP method vs permission flag → deny ถ้าไม่ผ่าน
 */
@Component
public class PermissionInterceptor implements HandlerInterceptor {

    @Autowired private RoleRepository roleRepo;
    @Autowired private MenuRepository menuRepo;
    @Autowired private RoleMenuRepository roleMenuRepo;

    /** Prefix ที่ข้าม permission check เสมอ */
    private static final List<String> BYPASS_PREFIXES = List.of(
        "/api/auth/",
        "/api/role-menus/",
        "/api/roles/",
        "/api/menus/",
        "/swagger-ui",
        "/v3/api-docs",
        "/error"
    );

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        // ตัด context-path ออก: /smart_village/api/training/1 → /api/training/1
        String fullPath    = request.getRequestURI();
        String contextPath = request.getContextPath();
        String path = fullPath.startsWith(contextPath)
            ? fullPath.substring(contextPath.length())
            : fullPath;

        // 1. bypass list
        for (String prefix : BYPASS_PREFIXES) {
            if (path.startsWith(prefix)) return true;
        }

        // ตรวจเฉพาะ /api/** path
        if (!path.startsWith("/api/")) return true;

        // 2. ดึง user ปัจจุบัน
        UserPrincipal user = ScopeUtil.currentUser();
        if (user == null) return true; // JWT filter จัดการ 401 แล้ว

        // ADMIN ข้ามทุก permission
        if (ScopeUtil.isAdmin()) return true;

        // 3. หา Menu ที่ตรงกับ path
        //    Menu.url = "/training" → API prefix = "/api/training"
        //    ตรวจว่า path == "/api/training" หรือ path.startsWith("/api/training/")
        List<Menu> allMenus = menuRepo.findAll();
        Menu matchedMenu = null;
        for (Menu m : allMenus) {
            if (m.getUrl() == null || m.getUrl().isBlank()) continue;
            String apiPrefix = "/api" + m.getUrl();
            if (path.equals(apiPrefix) || path.startsWith(apiPrefix + "/")) {
                matchedMenu = m;
                break;
            }
        }

        // ไม่มี menu ตรง → allow (path ที่ไม่ได้ declare ใน menu)
        if (matchedMenu == null) return true;

        // 4. หา Role
        Optional<Role> roleOpt = roleRepo.findByName(user.getRole());
        if (roleOpt.isEmpty()) {
            response.sendError(403, "ไม่พบ Role ในระบบ");
            return false;
        }

        // 5. หา permission record
        Optional<RoleMenu> permOpt = roleMenuRepo.findById(
            new RoleMenuId(roleOpt.get().getId(), matchedMenu.getId())
        );
        if (permOpt.isEmpty()) {
            response.sendError(403, "ไม่มีสิทธิ์เข้าถึงเมนูนี้");
            return false;
        }

        RoleMenu perm   = permOpt.get();
        String   method = request.getMethod().toUpperCase();

        boolean allowed = switch (method) {
            case "GET"               -> Boolean.TRUE.equals(perm.getCanView());
            case "POST"              -> Boolean.TRUE.equals(perm.getCanAdd());
            case "PUT", "PATCH"      -> Boolean.TRUE.equals(perm.getCanEdit());
            case "DELETE"            -> Boolean.TRUE.equals(perm.getCanDelete());
            default                  -> true;
        };

        if (!allowed) {
            response.sendError(403, "ไม่มีสิทธิ์ดำเนินการนี้");
            return false;
        }
        return true;
    }
}
