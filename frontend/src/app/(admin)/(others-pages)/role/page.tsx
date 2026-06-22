"use client"
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

interface Role {
  id: number; name: string; status: boolean; createdAt: string;
  [key: string]: unknown;
}

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get<Role[]>("/roles");
      setRoles(res.data);
    } catch { Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" }); }
  }, []);

  useEffect(() => {
    document.title = "Smart Village | จัดการ Role";
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?", html: `ลบ Role <b>${name}</b>`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await axios.delete(`/roles/${id}`);
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch (err: unknown) {
      const msg = (err as {response?: {data?: {message?: string}}})?.response?.data?.message;
      Swal.fire({ icon: "error", title: "ลบไม่สำเร็จ", text: msg });
    } finally { setLoading(false); }
  };

  const columns: DtColumn<Role>[] = [
    { key: "id",   label: "ID",       align: "center", exportText: (r) => String(r.id) },
    { key: "name", label: "ชื่อ Role", exportText: (r) => r.name ?? "" },
    {
      key: "status", label: "สถานะ", align: "center",
      searchText: (r) => r.status ? "เปิดใช้งาน" : "ปิดใช้งาน",
      exportText:  (r) => r.status ? "เปิดใช้งาน" : "ปิดใช้งาน",
      render: (r) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {r.status ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </span>
      ),
    },
    {
      key: "createdAt", label: "วันที่สร้าง", align: "center",
      exportText: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString("th-TH") : "",
      render: (r) => <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("th-TH") : "-"}</span>,
    },
    {
      key: "_action", label: "จัดการ", align: "center", sortable: false, noExport: true,
      render: (r) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => window.location.href = `/role/edit?id=${r.id}`}
            className="px-3 py-1 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium">แก้ไข</button>
          <button onClick={() => handleDelete(r.id, r.name)} disabled={loading}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 font-medium disabled:opacity-50">ลบ</button>
        </div>
      ),
    },
  ];

  return (
    <PermissionGuard adminOnly>
      <ComponentCard title="จัดการ Role">
        <DataTableWrapper<Role>
          data={roles}
          columns={columns}
          idKey="id"
          addUrl="/role/add"
          canAdd={true}
          canDelete={false}
          canExport={false}
          exportFilename="roles"
          loading={loading}
          emptyText="ไม่พบข้อมูล Role"
        />
      </ComponentCard>
    </PermissionGuard>
  );
}
