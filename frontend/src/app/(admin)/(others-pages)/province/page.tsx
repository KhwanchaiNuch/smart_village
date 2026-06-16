"use client";
import ComponentCard from "@/components/common/ComponentCard";
import Checkbox from "@/components/form/input/Checkbox";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";

interface Province { provinceId: number; nameTh: string; }

export default function ProvincePage() {
  const { canAdd, canEdit, canDelete } = usePermission();
  const [rows, setRows] = useState<Province[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const err = (e: any) => Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: e?.response?.data?.message || "กรุณาลองใหม่" });
  const ok = () => Swal.fire({ icon: "success", title: "สำเร็จ", timer: 1200, showConfirmButton: false });

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get<Province[]>("/provinces");
      setRows([...res.data].sort((a, b) => a.provinceId - b.provinceId));
      setSelectedIds([]);
    } catch (e) { err(e); }
  }, []);

  useEffect(() => { document.title = "Smart Village | จังหวัด"; fetchData(); }, [fetchData]);

  const promptName = async (title: string, current = "") => {
    const r = await Swal.fire({
      title, input: "text", inputValue: current, inputPlaceholder: "ชื่อจังหวัด",
      showCancelButton: true, confirmButtonText: "บันทึก", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb", cancelButtonColor: "#6b7280",
      inputValidator: (v) => (!v.trim() ? "กรุณากรอกชื่อ" : undefined),
    });
    return r.isConfirmed ? r.value.trim() : null;
  };

  const addItem = async () => {
    const name = await promptName("เพิ่มจังหวัด"); if (!name) return;
    try { await axios.post("/provinces/add", { nameTh: name }); await fetchData(); ok(); } catch (e) { err(e); }
  };
  const editItem = async (p: Province) => {
    const name = await promptName("แก้ไขจังหวัด", p.nameTh); if (!name) return;
    try { await axios.post("/provinces/edit", { provinceId: p.provinceId, nameTh: name }); await fetchData(); ok(); } catch (e) { err(e); }
  };
  const filtered = rows.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.nameTh.toLowerCase().includes(q) || String(p.provinceId).includes(q);
  });

  const isAllSelected = filtered.length > 0 && filtered.every((p) => selectedIds.includes(p.provinceId));
  const toggleAll = (c: boolean) => setSelectedIds(c ? filtered.map((p) => p.provinceId) : []);
  const toggleOne = (id: number, c: boolean) => setSelectedIds((prev) => (c ? [...prev, id] : prev.filter((x) => x !== id)));

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({ icon: "warning", title: "ยังไม่ได้เลือกรายการ", text: "กรุณาเลือกจังหวัดที่ต้องการลบอย่างน้อย 1 รายการ" });
      return;
    }
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `คุณกำลังจะลบจังหวัดจำนวน <b>${selectedIds.length}</b> รายการ<br/>หากมีอำเภออยู่ภายในจะลบไม่ได้`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const responses = await Promise.allSettled(selectedIds.map((id) => axios.delete(`/provinces/${id}`)));
      const failed = responses.filter((r) => r.status === "rejected").length;
      const success = selectedIds.length - failed;
      await fetchData();

      if (failed === 0) {
        Swal.fire({ icon: "success", title: "ลบสำเร็จ", text: `ลบจังหวัดเรียบร้อย ${success} รายการ`, timer: 1800, showConfirmButton: false });
      } else {
        Swal.fire({ icon: "warning", title: "ลบบางส่วนไม่สำเร็จ", text: `สำเร็จ ${success} รายการ, ล้มเหลว ${failed} รายการ` });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถลบข้อมูลได้ กรุณาตรวจสอบสิทธิ์หรือลองใหม่อีกครั้ง" });
    } finally {
      setLoading(false);
    }
  };

  const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  return (
    <div className="space-y-5">
      <ComponentCard title="">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">จังหวัด</h3>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} className={selCls} />
            {canDelete("/province") && (
            <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0 || loading}
              className="flex items-center gap-2 rounded-full border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
              ลบที่เลือก{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </button>
            )}
            {canAdd("/province") && (
            <button onClick={addItem}
              className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              เพิ่มจังหวัด
            </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-center"><Checkbox checked={isAllSelected} onChange={toggleAll} /></TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">รหัส</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ชื่อจังหวัด</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filtered.map((p) => (
                    <TableRow key={p.provinceId} className={selectedIds.includes(p.provinceId) ? "bg-blue-50 dark:bg-blue-500/10" : ""}>
                      <TableCell className="px-4 py-3 text-center"><Checkbox checked={selectedIds.includes(p.provinceId)} onChange={(c) => toggleOne(p.provinceId, c)} /></TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{p.provinceId}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-center text-theme-sm dark:text-gray-300">{p.nameTh}</TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {canEdit("/province") && (
                          <button onClick={() => editItem(p)} className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 hover:border-yellow-600">
                            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" /></svg>
                          </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell className="px-4 py-8 text-center text-gray-400 text-theme-sm">ไม่พบข้อมูลจังหวัด</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
