"use client";
import ComponentCard from "@/components/common/ComponentCard";
import Checkbox from "@/components/form/input/Checkbox";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";

interface Province { provinceId: number; nameTh: string; }
interface Amphur { amphurId: number; provinceId: number; nameTh: string; }
interface Tambon { tambonId: number; amphurId: number; nameTh: string; }
interface Village { villageId: number; tambonId: number; villageName: string; moo: string | null; }

export default function VillagePage() {
  const { village: activeVillage, setVillage } = useVillage();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphurs, setAmphurs] = useState<Amphur[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [amphurId, setAmphurId] = useState<number | "">("");
  const [tambonId, setTambonId] = useState<number | "">("");
  const [rows, setRows] = useState<Village[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const err = (e: any) => Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: e?.response?.data?.message || "กรุณาลองใหม่" });
  const ok = () => Swal.fire({ icon: "success", title: "สำเร็จ", timer: 1200, showConfirmButton: false });

  useEffect(() => {
    document.title = "Smart Village | หมู่บ้าน";
    axios.get<Province[]>("/provinces").then((r) => setProvinces([...r.data].sort((a, b) => a.provinceId - b.provinceId))).catch(err);
  }, []);

  useEffect(() => {
    setAmphurId(""); setTambons([]); setTambonId(""); setRows([]); setSelectedIds([]);
    if (provinceId !== "") axios.get<Amphur[]>("/amphurs", { params: { provinceId } }).then((r) => setAmphurs([...r.data].sort((a, b) => a.amphurId - b.amphurId))).catch(err);
    else setAmphurs([]);
  }, [provinceId]);

  useEffect(() => {
    setTambonId(""); setRows([]); setSelectedIds([]);
    if (amphurId !== "") axios.get<Tambon[]>("/tambons", { params: { amphurId } }).then((r) => setTambons([...r.data].sort((a, b) => a.tambonId - b.tambonId))).catch(err);
    else setTambons([]);
  }, [amphurId]);

  const fetchData = useCallback(async (tid: number) => {
    try { const res = await axios.get<Village[]>("/villages", { params: { tambonId: tid } }); setRows(res.data); setSelectedIds([]); } catch (e) { err(e); }
  }, []);

  useEffect(() => {
    if (tambonId !== "") fetchData(tambonId); else { setRows([]); setSelectedIds([]); }
  }, [tambonId, fetchData]);

  const promptVillage = async (title: string, name = "", moo = "") => {
    const r = await Swal.fire({
      title,
      html: `<input id="sw-n" class="swal2-input" placeholder="ชื่อหมู่บ้าน" value="${name.replace(/"/g, "&quot;")}">` +
            `<input id="sw-m" class="swal2-input" placeholder="หมู่ที่ (เช่น 5)" value="${(moo || "").replace(/"/g, "&quot;")}">`,
      showCancelButton: true, confirmButtonText: "บันทึก", cancelButtonText: "ยกเลิก", confirmButtonColor: "#2563eb", cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const n = (document.getElementById("sw-n") as HTMLInputElement).value.trim();
        const m = (document.getElementById("sw-m") as HTMLInputElement).value.trim();
        if (!n) { Swal.showValidationMessage("กรุณากรอกชื่อหมู่บ้าน"); return false; }
        return { villageName: n, moo: m };
      },
    });
    return r.isConfirmed ? (r.value as { villageName: string; moo: string }) : null;
  };

  const addItem = async () => {
    if (tambonId === "") { Swal.fire({ icon: "info", title: "เลือกตำบลก่อน" }); return; }
    const v = await promptVillage("เพิ่มหมู่บ้าน"); if (!v) return;
    try { await axios.post("/villages/add", { tambonId, villageName: v.villageName, moo: v.moo }); await fetchData(tambonId); ok(); } catch (e) { err(e); }
  };
  const editItem = async (vil: Village) => {
    const v = await promptVillage("แก้ไขหมู่บ้าน", vil.villageName, vil.moo || ""); if (!v) return;
    try { await axios.post("/villages/edit", { villageId: vil.villageId, tambonId: vil.tambonId, villageName: v.villageName, moo: v.moo }); await fetchData(tambonId as number); ok(); } catch (e) { err(e); }
  };
  const delItem = async (vil: Village) => {
    const r = await Swal.fire({ icon: "warning", title: "ยืนยันการลบ?", html: `ลบ <b>${vil.villageName}</b>`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก", confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280" });
    if (!r.isConfirmed) return;
    try { await axios.delete(`/villages/${vil.villageId}`); await fetchData(tambonId as number); ok(); } catch (e) { err(e); }
  };

  const useThisVillage = (vil: Village) => {
    setVillage({ villageId: vil.villageId, villageName: vil.villageName, moo: vil.moo });
    Swal.fire({ icon: "success", title: "เลือกหมู่บ้านแล้ว",
      html: `กำลังใช้งาน <b>${vil.villageName}</b>${vil.moo ? ` (หมู่ ${vil.moo})` : ""}<br><span style="font-size:13px;color:#6b7280">เมนูครัวเรือน/บุคคล พร้อมใช้งานแล้ว</span>`,
      timer: 1800, showConfirmButton: false });
  };

  const filtered = rows.filter((v) => {
    const q = search.toLowerCase();
    return !q || v.villageName.toLowerCase().includes(q) || (v.moo || "").includes(q);
  });

  const isAllSelected = filtered.length > 0 && filtered.every((v) => selectedIds.includes(v.villageId));
  const toggleAll = (c: boolean) => setSelectedIds(c ? filtered.map((v) => v.villageId) : []);
  const toggleOne = (id: number, c: boolean) => setSelectedIds((prev) => (c ? [...prev, id] : prev.filter((x) => x !== id)));

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const r = await Swal.fire({ icon: "warning", title: "ยืนยันการลบ?", html: `ลบ <b>${selectedIds.length}</b> รายการ`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก", confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280" });
    if (!r.isConfirmed) return;
    setLoading(true);
    try { await Promise.allSettled(selectedIds.map((id) => axios.delete(`/villages/${id}`))); await fetchData(tambonId as number); ok(); }
    catch { Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" }); } finally { setLoading(false); }
  };

  const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50";

  return (
    <div className="space-y-5">
      <ComponentCard title="">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">หมู่บ้าน</h3>
            <select className={selCls} value={provinceId} onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">-- จังหวัด --</option>
              {provinces.map((p) => <option key={p.provinceId} value={p.provinceId}>{p.nameTh}</option>)}
            </select>
            <select className={selCls} value={amphurId} disabled={provinceId === ""} onChange={(e) => setAmphurId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">-- อำเภอ --</option>
              {amphurs.map((a) => <option key={a.amphurId} value={a.amphurId}>{a.nameTh}</option>)}
            </select>
            <select className={selCls} value={tambonId} disabled={amphurId === ""} onChange={(e) => setTambonId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">-- ตำบล --</option>
              {tambons.map((t) => <option key={t.tambonId} value={t.tambonId}>{t.nameTh}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} className={selCls} />
            <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0 || loading}
              className="flex items-center gap-2 rounded-full border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
              ลบที่เลือก{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </button>
            <button onClick={addItem} disabled={tambonId === ""}
              className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              เพิ่มหมู่บ้าน
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[650px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-center"><Checkbox checked={isAllSelected} onChange={toggleAll} /></TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">หมู่ที่</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ชื่อหมู่บ้าน</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ใช้งาน</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filtered.map((v) => {
                    const isActive = activeVillage?.villageId === v.villageId;
                    return (
                    <TableRow key={v.villageId} className={isActive ? "bg-emerald-50 dark:bg-emerald-500/10" : selectedIds.includes(v.villageId) ? "bg-blue-50 dark:bg-blue-500/10" : ""}>
                      <TableCell className="px-4 py-3 text-center"><Checkbox checked={selectedIds.includes(v.villageId)} onChange={(c) => toggleOne(v.villageId, c)} /></TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{v.moo || "-"}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-center text-theme-sm dark:text-gray-300">{v.villageName}</TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <button onClick={() => useThisVillage(v)} disabled={isActive}
                          className="rounded-full border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">
                          {isActive ? "ใช้งานอยู่" : "ใช้งาน"}
                        </button>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => editItem(v)} className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600">
                            <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" /></svg>
                          </button>
                          <button onClick={() => delItem(v)} className="flex h-9 w-9 items-center justify-center rounded-full border border-red-600 bg-red-600 text-white hover:bg-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell className="px-4 py-8 text-center text-gray-400 text-theme-sm">{tambonId === "" ? "เลือกพื้นที่เพื่อดูหมู่บ้าน" : "ยังไม่มีหมู่บ้านในตำบลนี้"}</TableCell></TableRow>
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
