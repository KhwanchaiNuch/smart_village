"use client";
import ComponentCard from "@/components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";

interface Province { provinceId: number; nameTh: string; }
interface Amphur { amphurId: number; provinceId: number; nameTh: string; }
interface Tambon { tambonId: number; amphurId: number; nameTh: string; }
interface Village { villageId: number; tambonId: number; villageName: string; moo: string | null; }

export default function AreaPage() {
  const { village: activeVillage, setVillage } = useVillage();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphurs, setAmphurs] = useState<Amphur[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [provinceId, setProvinceId] = useState<number | "">("");
  const [amphurId, setAmphurId] = useState<number | "">("");
  const [tambonId, setTambonId] = useState<number | "">("");

  const err = (e: any) => {
    const raw = e?.response?.data?.message || "";
    if (/foreign key|violates|still referenced/i.test(raw)) {
      Swal.fire({
        icon: "warning",
        title: "ลบไม่ได้",
        text: "หมู่บ้านนี้มีครัวเรือนอยู่ภายใน กรุณาย้ายหรือลบครัวเรือนออกก่อน จึงจะลบหมู่บ้านได้",
      });
      return;
    }
    Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: raw || "กรุณาลองใหม่" });
  };
  const ok = () => Swal.fire({ icon: "success", title: "สำเร็จ", timer: 1200, showConfirmButton: false });

  // ── load lists ──────────────────────────────────────────────
  const loadProvinces = useCallback(async () => {
    try { setProvinces((await axios.get<Province[]>("/provinces")).data); } catch (e) { err(e); }
  }, []);

  const loadAmphurs = useCallback(async (pid: number) => {
    try { setAmphurs((await axios.get<Amphur[]>("/amphurs", { params: { provinceId: pid } })).data); } catch (e) { err(e); }
  }, []);

  const loadTambons = useCallback(async (aid: number) => {
    try { setTambons((await axios.get<Tambon[]>("/tambons", { params: { amphurId: aid } })).data); } catch (e) { err(e); }
  }, []);

  const loadVillages = useCallback(async (tid: number) => {
    try { setVillages((await axios.get<Village[]>("/villages", { params: { tambonId: tid } })).data); } catch (e) { err(e); }
  }, []);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | จัดการพื้นที่";
    loadProvinces();
  }, [loadProvinces]);

  // cascade resets
  useEffect(() => {
    setAmphurId(""); setTambons([]); setTambonId(""); setVillages([]);
    if (provinceId !== "") loadAmphurs(provinceId); else setAmphurs([]);
  }, [provinceId, loadAmphurs]);

  useEffect(() => {
    setTambonId(""); setVillages([]);
    if (amphurId !== "") loadTambons(amphurId); else setTambons([]);
  }, [amphurId, loadTambons]);

  useEffect(() => {
    if (tambonId !== "") loadVillages(tambonId); else setVillages([]);
  }, [tambonId, loadVillages]);

  // ── single-name prompt (province / amphur / tambon) ─────────
  const promptName = async (title: string, current = "") => {
    const r = await Swal.fire({
      title, input: "text", inputValue: current, inputPlaceholder: "กรอกชื่อ",
      showCancelButton: true, confirmButtonText: "บันทึก", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb", cancelButtonColor: "#6b7280",
      inputValidator: (v) => (!v.trim() ? "กรุณากรอกชื่อ" : undefined),
    });
    return r.isConfirmed ? r.value.trim() : null;
  };

  const confirmDelete = async (label: string) => {
    const r = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?", html: `ลบ <b>${label}</b> และข้อมูลย่อยที่เกี่ยวข้อง`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    return r.isConfirmed;
  };

  // ── Province actions ────────────────────────────────────────
  const addProvince = async () => {
    const name = await promptName("เพิ่มจังหวัด"); if (!name) return;
    try { await axios.post("/provinces/add", { nameTh: name }); await loadProvinces(); ok(); } catch (e) { err(e); }
  };
  const editProvince = async () => {
    if (provinceId === "") return;
    const cur = provinces.find((p) => p.provinceId === provinceId);
    const name = await promptName("แก้ไขจังหวัด", cur?.nameTh); if (!name) return;
    try { await axios.post("/provinces/edit", { provinceId, nameTh: name }); await loadProvinces(); ok(); } catch (e) { err(e); }
  };
  const delProvince = async () => {
    if (provinceId === "") return;
    const cur = provinces.find((p) => p.provinceId === provinceId);
    if (!(await confirmDelete(cur?.nameTh || "จังหวัดนี้"))) return;
    try { await axios.delete(`/provinces/${provinceId}`); setProvinceId(""); await loadProvinces(); ok(); } catch (e) { err(e); }
  };

  // ── Amphur actions ──────────────────────────────────────────
  const addAmphur = async () => {
    if (provinceId === "") return;
    const name = await promptName("เพิ่มอำเภอ"); if (!name) return;
    try { await axios.post("/amphurs/add", { provinceId, nameTh: name }); await loadAmphurs(provinceId); ok(); } catch (e) { err(e); }
  };
  const editAmphur = async () => {
    if (amphurId === "") return;
    const cur = amphurs.find((a) => a.amphurId === amphurId);
    const name = await promptName("แก้ไขอำเภอ", cur?.nameTh); if (!name) return;
    try { await axios.post("/amphurs/edit", { amphurId, provinceId, nameTh: name }); await loadAmphurs(provinceId as number); ok(); } catch (e) { err(e); }
  };
  const delAmphur = async () => {
    if (amphurId === "") return;
    const cur = amphurs.find((a) => a.amphurId === amphurId);
    if (!(await confirmDelete(cur?.nameTh || "อำเภอนี้"))) return;
    try { await axios.delete(`/amphurs/${amphurId}`); setAmphurId(""); await loadAmphurs(provinceId as number); ok(); } catch (e) { err(e); }
  };

  // ── Tambon actions ──────────────────────────────────────────
  const addTambon = async () => {
    if (amphurId === "") return;
    const name = await promptName("เพิ่มตำบล"); if (!name) return;
    try { await axios.post("/tambons/add", { amphurId, nameTh: name }); await loadTambons(amphurId); ok(); } catch (e) { err(e); }
  };
  const editTambon = async () => {
    if (tambonId === "") return;
    const cur = tambons.find((t) => t.tambonId === tambonId);
    const name = await promptName("แก้ไขตำบล", cur?.nameTh); if (!name) return;
    try { await axios.post("/tambons/edit", { tambonId, amphurId, nameTh: name }); await loadTambons(amphurId as number); ok(); } catch (e) { err(e); }
  };
  const delTambon = async () => {
    if (tambonId === "") return;
    const cur = tambons.find((t) => t.tambonId === tambonId);
    if (!(await confirmDelete(cur?.nameTh || "ตำบลนี้"))) return;
    try { await axios.delete(`/tambons/${tambonId}`); setTambonId(""); await loadTambons(amphurId as number); ok(); } catch (e) { err(e); }
  };

  // ── Village (หมู่บ้าน + หมู่) actions ────────────────────────
  const promptVillage = async (title: string, name = "", moo = "") => {
    const r = await Swal.fire({
      title,
      html:
        `<input id="sw-name" class="swal2-input" placeholder="ชื่อหมู่บ้าน" value="${name.replace(/"/g, "&quot;")}">` +
        `<input id="sw-moo" class="swal2-input" placeholder="หมู่ที่ (เช่น 5)" value="${(moo || "").replace(/"/g, "&quot;")}">`,
      showCancelButton: true, confirmButtonText: "บันทึก", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb", cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const n = (document.getElementById("sw-name") as HTMLInputElement).value.trim();
        const m = (document.getElementById("sw-moo") as HTMLInputElement).value.trim();
        if (!n) { Swal.showValidationMessage("กรุณากรอกชื่อหมู่บ้าน"); return false; }
        return { villageName: n, moo: m };
      },
    });
    return r.isConfirmed ? (r.value as { villageName: string; moo: string }) : null;
  };

  const addVillage = async () => {
    if (tambonId === "") return;
    const v = await promptVillage("เพิ่มหมู่บ้าน"); if (!v) return;
    try { await axios.post("/villages/add", { tambonId, villageName: v.villageName, moo: v.moo }); await loadVillages(tambonId); ok(); } catch (e) { err(e); }
  };
  const editVillage = async (vil: Village) => {
    const v = await promptVillage("แก้ไขหมู่บ้าน", vil.villageName, vil.moo || ""); if (!v) return;
    try { await axios.post("/villages/edit", { villageId: vil.villageId, tambonId, villageName: v.villageName, moo: v.moo }); await loadVillages(tambonId as number); ok(); } catch (e) { err(e); }
  };
  const delVillage = async (vil: Village) => {
    if (!(await confirmDelete(vil.villageName))) return;
    try { await axios.delete(`/villages/${vil.villageId}`); await loadVillages(tambonId as number); ok(); } catch (e) { err(e); }
  };

  const useThisVillage = (vil: Village) => {
    setVillage({ villageId: vil.villageId, villageName: vil.villageName, moo: vil.moo });
    Swal.fire({
      icon: "success",
      title: "เลือกหมู่บ้านแล้ว",
      html: `กำลังใช้งาน <b>${vil.villageName}</b>${vil.moo ? ` (หมู่ ${vil.moo})` : ""}<br><span style="font-size:13px;color:#6b7280">เมนูครัวเรือน/บุคคล พร้อมใช้งานแล้ว</span>`,
      timer: 1800, showConfirmButton: false,
    });
  };

  const selCls = "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed";
  const miniBtn = "flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="space-y-5">
      <ComponentCard title="">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">จัดการพื้นที่</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">เลือกไล่ระดับ จังหวัด → อำเภอ → ตำบล → หมู่บ้าน</p>

        <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 order-2">
          {/* จังหวัด */}
          <div className="md:order-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">จังหวัด</label>
            <select className={selCls} value={provinceId} onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">-- เลือกจังหวัด --</option>
              {provinces.map((p) => <option key={p.provinceId} value={p.provinceId}>{p.nameTh}</option>)}
            </select>
            <div className="mt-2 flex gap-2">
              <button onClick={addProvince} className={`${miniBtn} bg-green-600 hover:bg-green-700`}>+ เพิ่ม</button>
              <button onClick={editProvince} disabled={provinceId === ""} className={`${miniBtn} bg-yellow-500 hover:bg-yellow-600`}>แก้ไข</button>
              <button onClick={delProvince} disabled={provinceId === ""} className={`${miniBtn} bg-red-600 hover:bg-red-700`}>ลบ</button>
            </div>
          </div>

          {/* อำเภอ */}
          <div className="md:order-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">อำเภอ</label>
            <select className={selCls} value={amphurId} disabled={provinceId === ""} onChange={(e) => setAmphurId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">-- เลือกอำเภอ --</option>
              {amphurs.map((a) => <option key={a.amphurId} value={a.amphurId}>{a.nameTh}</option>)}
            </select>
            <div className="mt-2 flex gap-2">
              <button onClick={addAmphur} disabled={provinceId === ""} className={`${miniBtn} bg-green-600 hover:bg-green-700`}>+ เพิ่ม</button>
              <button onClick={editAmphur} disabled={amphurId === ""} className={`${miniBtn} bg-yellow-500 hover:bg-yellow-600`}>แก้ไข</button>
              <button onClick={delAmphur} disabled={amphurId === ""} className={`${miniBtn} bg-red-600 hover:bg-red-700`}>ลบ</button>
            </div>
          </div>

          {/* ตำบล */}
          <div className="md:order-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ตำบล</label>
            <select className={selCls} value={tambonId} disabled={amphurId === ""} onChange={(e) => setTambonId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">-- เลือกตำบล --</option>
              {tambons.map((t) => <option key={t.tambonId} value={t.tambonId}>{t.nameTh}</option>)}
            </select>
            <div className="mt-2 flex gap-2">
              <button onClick={addTambon} disabled={amphurId === ""} className={`${miniBtn} bg-green-600 hover:bg-green-700`}>+ เพิ่ม</button>
              <button onClick={editTambon} disabled={tambonId === ""} className={`${miniBtn} bg-yellow-500 hover:bg-yellow-600`}>แก้ไข</button>
              <button onClick={delTambon} disabled={tambonId === ""} className={`${miniBtn} bg-red-600 hover:bg-red-700`}>ลบ</button>
            </div>
          </div>
        </div>

        {/* หมู่บ้าน + หมู่ */}
        <div className="order-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white">หมู่บ้าน / หมู่</h4>
            <button onClick={addVillage} disabled={tambonId === ""}
              className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              เพิ่มหมู่บ้าน
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[500px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">หมู่ที่</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ชื่อหมู่บ้าน</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {villages.map((v) => {
                      const isActive = activeVillage?.villageId === v.villageId;
                      return (
                      <TableRow key={v.villageId} className={isActive ? "bg-emerald-50 dark:bg-emerald-500/10" : ""}>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{v.moo || "-"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                          {v.villageName}
                          {isActive && <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">กำลังใช้งาน</span>}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => useThisVillage(v)} disabled={isActive}
                              className="flex h-9 items-center gap-1 rounded-full border border-emerald-600 bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">
                              {isActive ? "ใช้งานอยู่" : "ใช้งาน"}
                            </button>
                            <button onClick={() => editVillage(v)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600">
                              <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
                              </svg>
                            </button>
                            <button onClick={() => delVillage(v)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-600 bg-red-600 text-white hover:bg-red-700">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                    {villages.length === 0 && (
                      <TableRow>
                        <TableCell className="px-4 py-8 text-center text-gray-400 text-theme-sm">
                          {tambonId === "" ? "เลือกตำบลเพื่อดูหมู่บ้าน" : "ยังไม่มีหมู่บ้านในตำบลนี้"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
        </div>
      </ComponentCard>
    </div>
  );
}
