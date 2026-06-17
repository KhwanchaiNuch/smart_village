"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "@/lib/axios";

export interface MenuPermission {
  menuUrl:   string;
  menuName:  string;
  canView:   boolean;
  canAdd:    boolean;
  canEdit:   boolean;
  canDelete: boolean;
}

interface PermissionContextValue {
  permissions:  MenuPermission[];
  loading:      boolean;
  refreshPerms: () => Promise<void>;
  /** true ถ้า role = ADMIN (ได้ทุก permission) */
  isAdmin:      boolean;
  canView:   (menuUrl: string) => boolean;
  canAdd:    (menuUrl: string) => boolean;
  canEdit:   (menuUrl: string) => boolean;
  canDelete: (menuUrl: string) => boolean;
}

const PermissionContext = createContext<PermissionContextValue>({
  permissions:  [],
  loading:      true,
  refreshPerms: async () => {},
  isAdmin:      false,
  canView:   () => false,
  canAdd:    () => false,
  canEdit:   () => false,
  canDelete: () => false,
});

const STORAGE_KEY = "permissions";

/** อ่าน permissions จาก localStorage (ถ้ามี) */
function loadCached(): MenuPermission[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? (JSON.parse(raw) as MenuPermission[]) : [];
  } catch {
    return [];
  }
}

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  // เริ่มด้วย empty state เสมอ (SSR-safe — ห้ามอ่าน localStorage ใน useState initializer)
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [isAdmin,     setIsAdmin]     = useState(false);

  const refreshPerms = useCallback(async () => {
    try {
      const role = localStorage.getItem("role");
      if (!role) { setLoading(false); return; }

      setIsAdmin(role === "ADMIN");

      const res = await axios.get<MenuPermission[]>("/role-menus/my-permissions");
      setPermissions(res.data);
      // อัปเดต cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    } catch {
      // ถ้า fetch ไม่ได้ (เช่น token หมดอายุ) ปล่อยให้ auth redirect จัดการ
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // อ่าน cache ก่อน (client-only) เพื่อไม่ให้ flicker ระหว่างรอ API
    const cached = loadCached();
    const role   = localStorage.getItem("role");
    if (cached.length > 0) setPermissions(cached);
    if (role) setIsAdmin(role === "ADMIN");

    // fetch ใหม่ใน background
    refreshPerms();
  }, [refreshPerms]);

  // helper — ถ้า admin ได้ทุกอย่างเสมอ
  const find = (menuUrl: string) =>
    permissions.find(p => p.menuUrl === menuUrl);

  // canView: ถ้าไม่อยู่ใน DB → อนุญาต (หน้าไม่ได้ลงทะเบียน = ไม่มี restriction เช่น dashboard /)
  // canAdd/Edit/Delete: ถ้าไม่อยู่ใน DB → ปฏิเสธ (ต้องมี permission ชัดเจนจึงทำได้)
  const canView   = (menuUrl: string) => isAdmin || (find(menuUrl)?.canView   ?? true);
  const canAdd    = (menuUrl: string) => isAdmin || (loading ? true : (find(menuUrl)?.canAdd    ?? false));
  const canEdit   = (menuUrl: string) => isAdmin || (loading ? true : (find(menuUrl)?.canEdit   ?? false));
  const canDelete = (menuUrl: string) => isAdmin || (loading ? true : (find(menuUrl)?.canDelete ?? false));

  return (
    <PermissionContext.Provider value={{ permissions, loading, refreshPerms, isAdmin, canView, canAdd, canEdit, canDelete }}>
      {children}
    </PermissionContext.Provider>
  );
}

/** ใช้ใน component: const { canAdd } = usePermission(); */
export function usePermission() {
  return useContext(PermissionContext);
}
