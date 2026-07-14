"use client"
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

interface AppUser {
  userId: number;
  username: string;
  fullName: string | null;
  roleLevel: string;
  scopeId: number | null;
  isActive: boolean;
  createdAt: string | null;
  [key: string]: unknown;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN:    { bg: "bg-purple-100", text: "text-purple-700", label: "ผู้ดูแลระบบ"         },
  PROVINCE: { bg: "bg-blue-100",   text: "text-blue-700",   label: "ผู้ใช้ระดับจังหวัด"  },
  AMPHUR:   { bg: "bg-indigo-100", text: "text-indigo-700", label: "ผู้ใช้ระดับอำเภอ"    },
  TAMBON:   { bg: "bg-cyan-100",   text: "text-cyan-700",   label: "ผู้ใช้ระดับตำบล"     },
  VILLAGE:  { bg: "bg-green-100",  text: "text-green-700",  label: "ผู้ใช้ระดับหมู่บ้าน" },
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get<AppUser[]>("/admin/users");
      setUsers(res.data);
    } catch (err: unknown) {
      const msg = (err as {response?: {data?: {message?: string}}})?.response?.data?.message;
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: msg || "กรุณาลองใหม่" });
    }
  }, []);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | จัดการผู้ใช้";
    fetchData();
  }, [fetchData]);

  const handleToggle = async (user: AppUser) => {
    const action = user.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน";
    const result = await Swal.fire({
      icon: "question", title: `${action} user?`, html: `<b>${user.username}</b>`,
      showCancelButton: true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก",
      confirmButtonColor: user.isActive ? "#dc2626" : "#16a34a",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await axios.patch(`/admin/users/${user.userId}/toggle`);
      await fetchData();
      Swal.fire({ icon: "success", title: `${action}สำเร็จ`, timer: 1200, showConfirmButton: false });
    } catch { Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" }); }
    finally { setLoading(false); }
  };

  const handleDelete = async (user: AppUser) => {
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?", html: `ลบ user <b>${user.username}</b>`,
      showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await axios.delete(`/admin/users/${user.userId}`);
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1200, showConfirmButton: false });
    } catch { Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" }); }
    finally { setLoading(false); }
  };

  const columns: DtColumn<AppUser>[] = [
    {
      key: "username", label: "Username", align: "center",
      exportText: (u) => u.username ?? "",
      render: (u) => <span className="font-mono">{u.username}</span>,
    },
    {
      key: "fullName", label: "ชื่อ-สกุล", align: "center",
      exportText: (u) => u.fullName ?? "",
      render: (u) => <span>{u.fullName || "-"}</span>,
    },
    {
      key: "roleLevel", label: "ระดับสิทธิ์", align: "center",
      searchText: (u) => ROLE_COLORS[u.roleLevel]?.label ?? u.roleLevel,
      exportText:  (u) => ROLE_COLORS[u.roleLevel]?.label ?? u.roleLevel,
      render: (u) => {
        const roleClr = ROLE_COLORS[u.roleLevel] || { bg: "bg-gray-100", text: "text-gray-600", label: u.roleLevel };
        return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleClr.bg} ${roleClr.text}`}>{roleClr.label}</span>;
      },
    },
    {
      key: "scopeId", label: "Scope ID", align: "center",
      exportText: (u) => u.scopeId != null ? String(u.scopeId) : "",
      render: (u) => <span>{u.scopeId ?? "-"}</span>,
    },
    {
      key: "isActive", label: "สถานะ", align: "center",
      searchText: (u) => u.isActive ? "ใช้งาน" : "ปิดใช้งาน",
      exportText:  (u) => u.isActive ? "ใช้งาน" : "ปิดใช้งาน",
      render: (u) =>
        u.isActive ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />ใช้งาน
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />ปิดใช้งาน
          </span>
        ),
    },
    {
      key: "createdAt", label: "วันที่สร้าง", align: "center",
      exportText: (u) => u.createdAt ? u.createdAt.slice(0, 10) : "",
      render: (u) => <span>{u.createdAt ? u.createdAt.slice(0, 10) : "-"}</span>,
    },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (u) => (
        <div className="flex items-center justify-center gap-2">
          <a href={`/manageusers/edit?id=${u.userId}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600" title="แก้ไข">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
          </a>
          <button onClick={() => handleToggle(u)} disabled={loading}
            title={u.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${u.isActive ? "bg-orange-400 hover:bg-orange-500" : "bg-green-500 hover:bg-green-600"}`}>
            {u.isActive ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            )}
          </button>
          <button onClick={() => handleDelete(u)} disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <PermissionGuard adminOnly>
      <ComponentCard title="">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">จัดการผู้ใช้งานระบบ</h3>
          <p className="text-xs text-gray-500 mt-0.5">เฉพาะ ADMIN เท่านั้น</p>
        </div>
        <DataTableWrapper<AppUser>
          data={users}
          columns={columns}
          idKey="userId"
          addUrl="/manageusers/add"
          canAdd={true}
          canDelete={false}
          canExport={false}
          exportFilename="users"
          loading={loading}
          emptyText="ไม่พบผู้ใช้งาน"
        />
      </ComponentCard>
    </PermissionGuard>
  );
}
