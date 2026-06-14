package com.k2dev.smart_village.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility เพื่อดึงข้อมูล user ที่ login อยู่ปัจจุบัน
 * ใช้ใน controller เพื่อตัดสินว่า return data ทั้งหมด (Admin) หรือ filter ตาม villageId
 */
public class ScopeUtil {

    public static final String ADMIN_ROLE = "ADMIN";

    /** คืน UserPrincipal ของ user ที่ login อยู่ (null ถ้าไม่มี) */
    public static UserPrincipal currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal p) {
            return p;
        }
        return null;
    }

    /** true ถ้า role = "ผู้ดูแลระบบ" */
    public static boolean isAdmin() {
        UserPrincipal u = currentUser();
        return u != null && ADMIN_ROLE.equals(u.getRole());
    }

    /**
     * คืน scope_id ของ user ปัจจุบัน
     * สำหรับ "ผู้ใช้ระดับหมู่บ้าน" → scope_id = village_id
     */
    public static Integer getScopeId() {
        UserPrincipal u = currentUser();
        return u != null ? u.getScopeId() : null;
    }
}
