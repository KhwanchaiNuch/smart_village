"use client";
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";

interface Province { provinceId: number; nameTh: string; }
interface Amphur { amphurId: number; provinceId: number; nameTh: string; }
interface Tambon { tambonId: number; amphurId: number; nameTh: string; zipcode: string | null; [key: string]: unknown; }

export default function TambonPage() {
  const { canAdd, canEdit, canDelete } = usePermission();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [allAmphurs, setAllAmphurs] = useState<Amphur[]>([]);
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [amphurId, setAmphurId] = useState<number | "">("");
  const [rows, setRows] = useState<Tambon[]>([]);
  const [loading, setLoading] = useState(false);

  const err = (e: unknown) => {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
    Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: msg || "กรุณาลองใหม่" });
  };

  const fetchAll = useCallback(async () => {
    try {
      const res = await axios.get<Tambon[]>("/tambons/all");
      setRows([...res.data].sort((a, b) => a.tambonId - b.tambonId));
    } catch (e) { err(e); }
  }, []);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | ตำบล";
    axios.get<Province[]>("/provinces").then((r) => setProvinces([...r.data].sort((a, b) => a.provinceId - b.provinceId))).catch(err);
    axios.get<Amphur[]>("/amphurs/all").then((r) => setAllAmphurs(r.data)).catch(err);
    fetchAll();
  }, [fetchAll]);

  // Reset amphurId when province changes
  useEffect(() => { setAmphurId(""); }, [provinceId]);

  const provinceMap = new Map(provinces.map((p) => [p.provinceId, p.nameTh]));
  const amphurMap = new Map(allAmphurs.map((a) => [a.amphurId, a]));
  const amphursForDropdown = provinceId !== "" ? allAmphurs.filter((a) => a.provinceId === provinceId) : allAmphurs;

  const promptTambon = async (title: string, name = "", zip = "") => {
    const r = await Swal.fire({
      title,
      html: `<input id="sw-n" class="swal2-input" placeholder="ชื่อตำบล" value="${name.replace(/"/g, "&quot;")}">` +
            `<input id="sw-z" class="swal2-input" placeholder="รหัสไปรษณีย์" value="${(zip || "").replace(/"/g, "&quot;")}">`,
      showCancelButton: true, confirmButtonText: "บันทึก", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#2563eb", cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const n = (document.getElementById("sw-n") as HTMLInputElement).value.trim();
        const z = (document.getElementById("sw-z") as HTMLInputElement).value.trim();
        if (!n) { Swal.showValidationMessage("กรุณากรอกชื่อตำบล"); return false; }
        return { nameTh: n, zipcode: z };
      },
    });
    return r.isConfirmed ? (r.value as { nameTh: string; zipcode: string }) : null;
  };

  const addItem = async () => {
    if (amphurId === "") {
      Swal.fire({ icon: "info", title: "เลือกอำเภอที่จะเพิ่มตำบลก่อน" });
      return;
    }
    const v = await promptTambon("เพิ่มตำบล");
    if (!v) return;
    try {
      await axios.post("/tambons/add", { amphurId, nameTh: v.nameTh, zipcode: v.zipcode });
      await fetchAll();
      Swal.fire({ icon: "success", title: "สำเร็จ", timer: 1200, showConfirmButton: false });
    } catch (e) { err(e); }
  };

  const editItem = async (t: Tambon) => {
    const v = await promptTambon("แก้ไขตำบล", t.nameTh, t.zipcode || "");
    if (!v) return;
    try {
      await axios.post("/tambons/edit", { tambonId: t.tambonId, amphurId: t.amphurId, nameTh: v.nameTh, zipcode: v.zipcode });
      await fetchAll();
      Swal.fire({ icon: "success", title: "สำเร็จ", timer: 1200, showConfirmButton: false });
    } catch (e) { err(e); }
  };

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    if (ids.length === 0) return;
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบตำบล <b>${ids.length}</b> รายการ<br/>หากมีหมู่บ้านอยู่ภายในจะลบไม่ได้`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      const responses = await Promise.allSettled(ids.map((id) => axios.delete(`/tambons/${id}`)));
      const failed = responses.filter((r) => r.status === "rejected").length;
      await fetchAll();
      if (failed === 0) Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
      else Swal.fire({ icon: "warning", title: "ลบบางส่วนไม่สำเร็จ", text: `สำเร็จ ${ids.length - failed}, ล้มเหลว ${failed} รายการ` });
    } catch { Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" }); }
    finally { setLoading(false); }
  };

  const scoped = rows.filter((t) => {
    if (amphurId !== "") return t.amphurId === amphurId;
    if (provinceId !== "") {
      const a = amphurMap.get(t.amphurId);
      return a?.provinceId === provinceId;
    }
    return true;
  });

  const columns: DtColumn<Tambon>[] = [
    { key: "tambonId", label: "รหัส", align: "center", exportText: (r) => String(r.tambonId) },
    { key: "nameTh", label: "ชื่อตำบล", exportText: (r) => r.nameTh },
    {
      key: "amphurId", label: "อำเภอ",
      searchText: (r) => amphurMap.get(r.amphurId)?.nameTh ?? "",
      exportText: (r) => amphurMap.get(r.amphurId)?.nameTh ?? "",
      render: (r) => <span>{amphurMap.get(r.amphurId)?.nameTh || "-"}</span>,
    },
    {
      key: "_province", label: "จังหวัด",
      searchText: (r) => { const a = amphurMap.get(r.amphurId); return a ? (provinceMap.get(a.provinceId) ?? "") : ""; },
      exportText: (r) => { const a = amphurMap.get(r.amphurId); return a ? (provinceMap.get(a.provinceId) ?? "") : ""; },
      render: (r) => { const a = amphurMap.get(r.amphurId); return <span>{a ? (provinceMap.get(a.provinceId) || "-") : "-"}</span>; },
    },
    {
      key: "zipcode", label: "รหัสไปรษณีย์", align: "center",
      exportText: (r) => r.zipcode ?? "",
      render: (r) => <span>{r.zipcode || "-"}</span>,
    },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (t) => canEdit("/tambon") ? (
        <button onClick={() => editItem(t)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600 mx-auto">
          <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
          </svg>
        </button>
      ) : <span className="text-gray-400">-</span>,
    },
  ];

  const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50";

  const toolbarExtra = (
    <>
      <select value={provinceId} onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : "")} className={selCls}>
        <option value="">-- ทุกจังหวัด --</option>
        {provinces.map((p) => <option key={p.provinceId} value={p.provinceId}>{p.nameTh}</option>)}
      </select>
      <select value={amphurId} onChange={(e) => setAmphurId(e.target.value ? Number(e.target.value) : "")} className={selCls}>
        <option value="">-- ทุกอำเภอ --</option>
        {amphursForDropdown.map((a) => <option key={a.amphurId} value={a.amphurId}>{a.nameTh}</option>)}
      </select>
      {canAdd("/tambon") && (
        <button onClick={addItem}
          className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          เพิ่มตำบล
        </button>
      )}
    </>
  );

  return (
    <ComponentCard title="">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ตำบล</h3>
      </div>
      <DataTableWrapper<Tambon>
        data={scoped}
        columns={columns}
        idKey="tambonId"
        canAdd={false}
        canDelete={canDelete("/tambon")}
        canExport={false}
        onDeleteSelected={handleDeleteSelected}
        exportFilename="tambons"
        toolbarExtra={toolbarExtra}
        loading={loading}
        emptyText="ไม่พบข้อมูลตำบล"
      />
    </ComponentCard>
  );
}
