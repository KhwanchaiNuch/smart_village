"use client"
import ComponentCard from "@/components/common/ComponentCard";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

interface Role { id: number; name: string; status: boolean; createdAt: string; }

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get<Role[]>("/roles");
      setRoles(res.data);
    } catch {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
    }
  }, []);

  useEffect(() => {
    document.title = "Smart Village | จัดการ Role";
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบ Role <b>${name}</b>`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/roles/${id}`);
      await Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "ลบไม่สำเร็จ", text: err?.response?.data?.message });
    }
  };

  const filtered = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ComponentCard title="จัดการ Role">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text" placeholder="ค้นหาชื่อ Role..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        />
        <button
          onClick={() => window.location.href = "/role/add"}
          className="px-4 py-2 bg-brand-500 text-white text-sm rounded-lg hover:bg-brand-600 whitespace-nowrap font-medium"
        >+ เพิ่ม Role</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-16">
                ID
              </th>
              <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                ชื่อ Role
              </th>
              <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-32">
                สถานะ
              </th>
              <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-44">
                วันที่สร้าง
              </th>
              <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-28">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400 dark:text-gray-500">ไม่พบข้อมูล</td>
              </tr>
            ) : filtered.map((r, idx) => (
              <tr key={r.id}
                className={`${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/60 dark:bg-gray-800/40"} hover:bg-brand-50/40 dark:hover:bg-brand-900/10 transition-colors`}>
                <td className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 text-gray-400 dark:text-gray-500">
                  {r.id}
                </td>
                <td className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                  {r.name}
                </td>
                <td className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"}`}>
                    {r.status ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 text-gray-500 dark:text-gray-400">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString("th-TH") : "-"}
                </td>
                <td className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => window.location.href = `/role/edit?id=${r.id}`}
                      className="px-3 py-1 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium"
                    >แก้ไข</button>
                    <button
                      onClick={() => handleDelete(r.id, r.name)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 font-medium"
                    >ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">ทั้งหมด {filtered.length} รายการ</p>
    </ComponentCard>
  );
}
