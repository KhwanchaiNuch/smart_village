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
 * 4. หา role_menu record → ถ้าไม่มี row → allow (ยังไม่ได้ตั้งค่า = เข้าได้ทั้งหมด)
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
        "/api/villages/ensure/",   // VillageContext auto-init — ต้องให้ทุก user เข้าได้
        "/api/villages/all",       // VILLAGE role auto-load ตอน login
        "/api/villages",           // village list by tambonId
        "/api/provinces",
        "/api/amphurs",
        "/api/tambons",
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
        List<Menu> allMenus = menuRepo.findAll();
        Menu matchedMenu = null;
        for (Menu m : allMenus) {
            if (isPathMatchingMenu(path, m.getUrl())) {
                matchedMenu = m;
                break;
            }
        }

        // ไม่มี menu ตรง → allow (path ที่ไม่ได้ declare ใน menu)
        if (matchedMenu == null) return true;

        // 4. หา Role — ถ้าไม่มี role ใน system → allow (role ที่ยังไม่ได้ลงทะเบียน)
        Optional<Role> roleOpt = roleRepo.findByName(user.getRole());
        if (roleOpt.isEmpty()) return true;

        // 5. หา permission record — ถ้าไม่มี entry → allow (ยังไม่ได้ตั้งค่า = เปิดหมด)
        Optional<RoleMenu> permOpt = roleMenuRepo.findById(
            new RoleMenuId(roleOpt.get().getId(), matchedMenu.getId())
        );
        if (permOpt.isEmpty()) return true;

        RoleMenu perm   = permOpt.get();
        String   method = request.getMethod().toUpperCase();

        boolean allowed;
        if ("POST".equals(method) && path.endsWith("/edit")) {
            allowed = Boolean.TRUE.equals(perm.getCanEdit());
        } else {
            allowed = switch (method) {
                case "GET"               -> Boolean.TRUE.equals(perm.getCanView());
                case "POST"              -> Boolean.TRUE.equals(perm.getCanAdd());
                case "PUT", "PATCH"      -> Boolean.TRUE.equals(perm.getCanEdit());
                case "DELETE"            -> Boolean.TRUE.equals(perm.getCanDelete());
                default                  -> true;
            };
        }

        if (!allowed) {
            String msg = "VIEWER".equals(user.getRole())
                ? "คุณอยู่ในโหมดผู้รับชม ไม่สามารถเพิ่ม แก้ไข หรือลบข้อมูลได้"
                : "ไม่มีสิทธิ์ดำเนินการนี้";
            response.sendError(403, msg);
            return false;
        }
        return true;
    }

    private boolean isPathMatchingMenu(String path, String menuUrl) {
        if (menuUrl == null || menuUrl.isBlank()) return false;

        String menu = menuUrl.toLowerCase().replaceAll("[/-]", "");
        String normalizedPath = path.toLowerCase().replaceAll("/api/", "").replaceAll("[/-]", "");

        if ("household".equals(menu)) {
            return normalizedPath.startsWith("household") && !normalizedPath.startsWith("householdeconomic");
        }
        if ("person".equals(menu)) {
            return normalizedPath.startsWith("person") && !normalizedPath.startsWith("personskill");
        }
        if ("healthrecord".equals(menu)) {
            return normalizedPath.startsWith("healthrecord");
        }
        if ("visitlog".equals(menu)) {
            return normalizedPath.startsWith("visitlog");
        }
        if ("training".equals(menu)) {
            return normalizedPath.startsWith("trainingevent") || normalizedPath.startsWith("trainingparticipant") || normalizedPath.startsWith("training");
        }
        if ("communityissue".equals(menu)) {
            return normalizedPath.startsWith("communityissue") || normalizedPath.startsWith("communityissuelog");
        }
        if ("householdeconomic".equals(menu)) {
            return normalizedPath.startsWith("householdeconomic");
        }
        if ("personskill".equals(menu)) {
            return normalizedPath.startsWith("personskill");
        }
        if ("villagesurvey".equals(menu)) {
            return normalizedPath.startsWith("villageneedsurvey") || normalizedPath.startsWith("villagesurvey");
        }
        if ("villageresource".equals(menu)) {
            return normalizedPath.startsWith("villageresource");
        }
        if ("village".equals(menu)) {
            return normalizedPath.startsWith("village") 
                && !normalizedPath.startsWith("villagesurvey") 
                && !normalizedPath.startsWith("villageresource")
                && !normalizedPath.startsWith("villageneedsurvey");
        }
        if ("manageusers".equals(menu)) {
            return normalizedPath.startsWith("adminusers") || normalizedPath.startsWith("appuser") || normalizedPath.startsWith("manageuser");
        }

        return false;
    }
}
