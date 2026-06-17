"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/context/PermissionContext";

interface PermissionGuardProps {
  /** ระบุ menuUrl สำหรับตรวจ permission ปกติ */
  menuUrl?: string;
  /** ถ้าไม่ระบุ → ตรวจ canView, ระบุ "add"/"edit"/"delete" → ตรวจ permission ที่ตรงกัน */
  action?: "add" | "edit" | "delete";
  /** true = เฉพาะ ADMIN เท่านั้น (ระบบสิทธิ์, จัดการผู้ใช้, ฯลฯ) */
  adminOnly?: boolean;
  children: React.ReactNode;
}

export default function PermissionGuard({ menuUrl, action, adminOnly, children }: PermissionGuardProps) {
  const { canView, canAdd, canEdit, canDelete, isAdmin, loading } = usePermission();
  const router = useRouter();

  const hasPermission = (): boolean => {
    if (adminOnly) return isAdmin;
    if (!menuUrl) return true;
    switch (action) {
      case "add":    return canAdd(menuUrl);
      case "edit":   return canEdit(menuUrl);
      case "delete": return canDelete(menuUrl);
      default:       return canView(menuUrl);
    }
  };

  useEffect(() => {
    if (!loading && !hasPermission()) {
      router.replace("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
          <svg className="animate-spin w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (!hasPermission()) {
    return null;
  }

  return <>{children}</>;
}
