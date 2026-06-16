"use client";
import ComponentCard from "@/components/common/ComponentCard";
import Checkbox from "@/components/form/input/Checkbox";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";

interface Province { provinceId: number; nameTh: string; }
interface Amphur { amphurId: number; provinceId: number; nameTh: string; }

export default function AmphurPage() {
  const { canAdd, canEdit, canDelete } = usePermission();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [rows, setRows] = useState<Amphur[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const err = (e: any) => Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: e?.response?.data?.message || "กรุณาลองใหม่" });
  const ok = () => Swal.fire({ icon: "success", title: "สำเร็จ", timer: 1200, showConfirmButton: false });

  const fetchAll = useCallback(async () => {
    try {
      const res = await axios.get<Amphur[]>("/amphurs/all");
      setRows([...res.data].sort((a, b) => a.amphurId - b.amphurId));
      setSelectedIds([]);
    } catch (e) { err(e); }
  }, []);

  useEffect(() => {
    document.title = "Smart Village | อำเภอ";
    axios.get<Province[]>("/provinces").then((r) => setProvinces([...r.data].sort((a, b) => a.provinceId - b.provinceId))).catch(err);
    fetchAll();
  }, [fetchAll]);

  const promptName = async (title: string, current = "") => {
    const r = await Swal.fire({
      title, input: "text", inputValue: current, inputPlaceholder: "ชื่ออำเภอ",
      showCancelButton: true, confirmButtonText: "บันทึก", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb", cancelButtonColor: "#6b7280",
      inputValidator: (v) => (!v.trim() ? "กรุณากรอกชื่อ" : undefined),
    });
    return r.isConfirmed ? r.value.trim() : null;
  };

  const addItem = async () => {
    if (provinceId === "") { Swal.fire({ icon: "info", title: "เลือกจังหวัดที่จะเพิ่มอำเภอก่อน" }); return; }
    const name = await promptName("เพิ่มอำเภอ"); if (!name) return;
    try { await axios.post("/amphurs/add", { provinceId, nameTh: name }); await fetchAll(); ok(); } catch (e) { err(e); }
  };
  const editItem = async (a: Amphur) => {
    const name = await promptName("แก้ไขอำเภอ", a.nameTh); if (!name) return;
    try { await axios.post("/amphurs/edit", { amphurId: a.amphurId, provinceId: a.provinceId, nameTh: name }); await fetchAll(); ok(); } catch (e) { err(e); }
  };
  const provinceMap = new Map(provinces.map(p => [p.provinceId, p.nameTh]));
  const scoped = provinceId !== "" ? rows.filter((a) => a.provinceId === provinceId) : rows;
  const filtered = scoped.filter((a) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const pName = provinceMap.get(a.provinceId) || "";
    return a.nameTh.toLowerCase().includes(q) || String(a.amphurId).includes(q) || pName.toLowerCase().includes(q);
  });

  const isAllSelected = filtered.length > 0 && filtered.every((a) => selectedIds.includes(a.amphurId));
  const toggleAll = (c: boolean) => setSelectedIds(c ? filtered.map((a) => a.amphurId) : []);
  const toggleOne = (id: number, c: boolean) => setSelectedIds((prev) => (c ? [...prev, id] : prev.filter((x) => x !== id)));

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({ icon: "warning", title: "ยังไม่ได้เลือกรายการ", text: "กรุณาเลือกอำเภอที่ต้องการลบอย่างน้อย 1 รายการ" });
      return;
    }
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `คุณกำลังจะลบอำเภอจำนวน <b>${selectedIds.length}</b> รายการ<br/>หากมีตำบลอยู่ภายในจะลบไม่ได้`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const responses = await Promise.allSettled(selectedIds.map((id) => axios.delete(`/amphurs/${id}`)));
      const failed = responses.filter((r) => r.status === "rejected").length;
      const success = selectedIds.length - failed;
      await fetchAll();

      if (failed === 0) {
        Swal.fire({ icon: "success", title: "ลบสำเร็จ", text: `ลบอำเภอเรียบร้อย ${success} รายการ`, timer: 1800, showConfirmButton: false });
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
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">อำเภอ</h3>
            <select className={selCls} value={provinceId} onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">-- ทุกจังหวัด --</option>
              {provinces.map((p) => <option key={p.provinceId} value={p.provinceId}>{p.nameTh}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} className={selCls} />
            {canDelete("/amphur") && (
            <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0 || loading}
              className="flex items-center gap-2 rounded-full border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
              ลบที่เลือก{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </button>
            )}
            {canAdd("/amphur") && (
            <button onClick={addItem}
              className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              เพิ่มอำเภอ
            </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-center"><Checkbox checked={isAllSelected} onChange={toggleAll} /></TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">รหัส</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ชื่ออำเภอ</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">จังหวัด</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filtered.map((a) => (
                    <TableRow key={a.amphurId} className={selectedIds.includes(a.amphurId) ? "bg-blue-50 dark:bg-blue-500/10" : ""}>
                      <TableCell className="px-4 py-3 text-center"><Checkbox checked={selectedIds.includes(a.amphurId)} onChange={(c) => toggleOne(a.amphurId, c)} /></TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{a.amphurId}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-center text-theme-sm dark:text-gray-300">{a.nameTh}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{provinceMap.get(a.provinceId) || "-"}</TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {canEdit("/amphur") && (
                          <button onClick={() => editItem(a)} className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 hover:border-yellow-600">
                            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" /></svg>
                          </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell className="px-4 py-8 text-center text-gray-400 text-theme-sm">ไม่พบข้อมูลอำเภอ</TableCell></TableRow>
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
