"use client";
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";

interface Province { provinceId: number; nameTh: string; }
interface Amphur { amphurId: number; provinceId: number; nameTh: string; [key: string]: unknown; }

export default function AmphurPage() {
  const { canAdd, canEdit, canDelete } = usePermission();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [rows, setRows] = useState<Amphur[]>([]);
  const [loading, setLoading] = useState(false);

  const err = (e: unknown) => {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
    Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: msg || "กรุณาลองใหม่" });
  };

  const fetchAll = useCallback(async () => {
    try {
      const res = await axios.get<Amphur[]>("/amphurs/all");
      setRows([...res.data].sort((a, b) => a.amphurId - b.amphurId));
    } catch (e) { err(e); }
  }, []);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | อำเภอ";
    axios.get<Province[]>("/provinces").then((r) => setProvinces([...r.data].sort((a, b) => a.provinceId - b.provinceId))).catch(err);
    fetchAll();
  }, [fetchAll]);

  const provinceMap = new Map(provinces.map((p) => [p.provinceId, p.nameTh]));

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
    if (provinceId === "") {
      Swal.fire({ icon: "info", title: "เลือกจังหวัดที่จะเพิ่มอำเภอก่อน" });
      return;
    }
    const name = await promptName("เพิ่มอำเภอ");
    if (!name) return;
    try {
      await axios.post("/amphurs/add", { provinceId, nameTh: name });
      await fetchAll();
      Swal.fire({ icon: "success", title: "สำเร็จ", timer: 1200, showConfirmButton: false });
    } catch (e) { err(e); }
  };

  const editItem = async (a: Amphur) => {
    const name = await promptName("แก้ไขอำเภอ", a.nameTh);
    if (!name) return;
    try {
      await axios.post("/amphurs/edit", { amphurId: a.amphurId, provinceId: a.provinceId, nameTh: name });
      await fetchAll();
      Swal.fire({ icon: "success", title: "สำเร็จ", timer: 1200, showConfirmButton: false });
    } catch (e) { err(e); }
  };

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    if (ids.length === 0) return;
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบอำเภอ <b>${ids.length}</b> รายการ<br/>หากมีตำบลอยู่ภายในจะลบไม่ได้`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      const responses = await Promise.allSettled(ids.map((id) => axios.delete(`/amphurs/${id}`)));
      const failed = responses.filter((r) => r.status === "rejected").length;
      await fetchAll();
      if (failed === 0) Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
      else Swal.fire({ icon: "warning", title: "ลบบางส่วนไม่สำเร็จ", text: `สำเร็จ ${ids.length - failed}, ล้มเหลว ${failed} รายการ` });
    } catch { Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" }); }
    finally { setLoading(false); }
  };

  const scoped = provinceId !== "" ? rows.filter((a) => a.provinceId === provinceId) : rows;

  const columns: DtColumn<Amphur>[] = [
    { key: "amphurId", label: "รหัส", align: "center", exportText: (r) => String(r.amphurId) },
    { key: "nameTh", label: "ชื่ออำเภอ", exportText: (r) => r.nameTh },
    {
      key: "provinceId", label: "จังหวัด",
      searchText: (r) => provinceMap.get(r.provinceId) ?? "",
      exportText: (r) => provinceMap.get(r.provinceId) ?? "",
      render: (r) => <span>{provinceMap.get(r.provinceId) || "-"}</span>,
    },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (a) => canEdit("/amphur") ? (
        <button onClick={() => editItem(a)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600 mx-auto">
          <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
          </svg>
        </button>
      ) : <span className="text-gray-400">-</span>,
    },
  ];

  const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  const toolbarExtra = (
    <>
      <select value={provinceId} onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : "")} className={selCls}>
        <option value="">-- ทุกจังหวัด --</option>
        {provinces.map((p) => <option key={p.provinceId} value={p.provinceId}>{p.nameTh}</option>)}
      </select>
      {canAdd("/amphur") && (
        <button onClick={addItem}
          className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          เพิ่มอำเภอ
        </button>
      )}
    </>
  );

  return (
    <ComponentCard title="">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">อำเภอ</h3>
      </div>
      <DataTableWrapper<Amphur>
        data={scoped}
        columns={columns}
        idKey="amphurId"
        canAdd={false}
        canDelete={canDelete("/amphur")}
        canExport={false}
        onDeleteSelected={handleDeleteSelected}
        exportFilename="amphurs"
        toolbarExtra={toolbarExtra}
        loading={loading}
        emptyText="ไม่พบข้อมูลอำเภอ"
      />
    </ComponentCard>
  );
}
