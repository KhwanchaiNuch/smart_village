"use client"
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

interface Menu {
  id: number; name: string; url: string; status: boolean; createdAt: string;
  [key: string]: unknown;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get<Menu[]>("/menus");
      setMenus(res.data);
    } catch { Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" }); }
  }, []);

  useEffect(() => {
    document.title = "Smart Village | จัดการ Menu";
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?", html: `ลบ Menu <b>${name}</b>`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await axios.delete(`/menus/${id}`);
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch (err: unknown) {
      const msg = (err as {response?: {data?: {message?: string}}})?.response?.data?.message;
      Swal.fire({ icon: "error", title: "ลบไม่สำเร็จ", text: msg });
    } finally { setLoading(false); }
  };

  const columns: DtColumn<Menu>[] = [
    { key: "id",   label: "ID",     align: "center", exportText: (m) => String(m.id) },
    { key: "name", label: "ชื่อ Menu", exportText: (m) => m.name ?? "" },
    {
      key: "url", label: "URL / Path",
      exportText: (m) => m.url ?? "",
      render: (m) => <span className="font-mono text-blue-600 dark:text-blue-400 text-xs">{m.url || "-"}</span>,
    },
    {
      key: "status", label: "สถานะ", align: "center",
      searchText: (m) => m.status ? "เปิดใช้งาน" : "ปิดใช้งาน",
      exportText:  (m) => m.status ? "เปิดใช้งาน" : "ปิดใช้งาน",
      render: (m) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${m.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {m.status ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </span>
      ),
    },
    {
      key: "createdAt", label: "วันที่สร้าง", align: "center",
      exportText: (m) => m.createdAt ? new Date(m.createdAt).toLocaleDateString("th-TH") : "",
      render: (m) => <span>{m.createdAt ? new Date(m.createdAt).toLocaleDateString("th-TH") : "-"}</span>,
    },
    {
      key: "_action", label: "จัดการ", align: "center", sortable: false, noExport: true,
      render: (m) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => window.location.href = `/menu/edit?id=${m.id}`}
            className="px-3 py-1 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium">แก้ไข</button>
          <button onClick={() => handleDelete(m.id, m.name)} disabled={loading}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 font-medium disabled:opacity-50">ลบ</button>
        </div>
      ),
    },
  ];

  return (
    <PermissionGuard adminOnly>
      <ComponentCard title="จัดการ Menu">
        <DataTableWrapper<Menu>
          data={menus}
          columns={columns}
          idKey="id"
          addUrl="/menu/add"
          canAdd={true}
          canDelete={false}
          canExport={false}
          exportFilename="menus"
          loading={loading}
          emptyText="ไม่พบข้อมูล Menu"
        />
      </ComponentCard>
    </PermissionGuard>
  );
}
