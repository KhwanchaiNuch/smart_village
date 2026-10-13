"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";

interface VillageOption {
  villageId: number;
  villageName: string;
  moo: string | null;
}

interface WaterRateRow {
  rateId: number;
  villageId: number | null;
  ratePerUnit: number;
  effectiveFrom: string;
  remark: string | null;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WaterRateSettings() {
  const { canAdd, canDelete } = usePermission();
  const [villages, setVillages] = useState<VillageOption[]>([]);
  const [rates, setRates] = useState<WaterRateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ villageId: "", ratePerUnit: "", effectiveFrom: todayStr(), remark: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [villageRes, rateRes] = await Promise.all([
        axios.get<VillageOption[]>("/villages/scoped"),
        axios.get<WaterRateRow[]>("/water-rates"),
      ]);
      setVillages(villageRes.data);
      setRates(rateRes.data);
    } catch {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | ตั้งค่าอัตราค่าน้ำ";
    fetchData();
  }, [fetchData]);

  const villageName = (villageId: number | null) => {
    if (villageId == null) return "อัตรากลาง (ทุกหมู่บ้าน)";
    const v = villages.find((x) => x.villageId === villageId);
    return v ? `${v.villageName}${v.moo ? ` หมู่ ${v.moo}` : ""}` : `หมู่บ้าน #${villageId}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.villageId) {
      Swal.fire({ icon: "warning", title: "กรุณาเลือกหมู่บ้าน", text: "แต่ละหมู่บ้านต้องตั้งอัตราค่าน้ำของตัวเอง" });
      return;
    }
    if (!form.ratePerUnit || !form.effectiveFrom) {
      Swal.fire({ icon: "warning", title: "กรุณาระบุอัตราค่าน้ำและวันที่มีผล" });
      return;
    }
    setSaving(true);
    try {
      await axios.post("/water-rates/add", {
        villageId: form.villageId ? parseInt(form.villageId) : null,
        ratePerUnit: parseFloat(form.ratePerUnit),
        effectiveFrom: form.effectiveFrom,
        remark: form.remark || null,
      });
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false });
      setForm({ villageId: form.villageId, ratePerUnit: "", effectiveFrom: todayStr(), remark: "" });
      fetchData();
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: message || "เกิดข้อผิดพลาด" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rateId: number) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ?",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/water-rates/${rateId}`);
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
      fetchData();
    } catch {
      Swal.fire({ icon: "error", title: "ลบไม่สำเร็จ" });
    }
  };

  const inputClass = "mt-1 w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 dark:text-gray-300 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600";

  return (
    <PermissionGuard menuUrl="/waterrate">
      <ComponentCard title="ตั้งค่าอัตราค่าน้ำประปา">
        {canAdd("/waterrate") && (
          <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">เพิ่มอัตราค่าน้ำใหม่</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>หมู่บ้าน <span className="text-red-500">*</span></Label>
                <select name="villageId" value={form.villageId} onChange={handleChange} className={inputClass}>
                  <option value="">-- เลือกหมู่บ้าน --</option>
                  {villages.map((v) => (
                    <option key={v.villageId} value={v.villageId}>{v.villageName}{v.moo ? ` หมู่ ${v.moo}` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>อัตรา (บาท/หน่วย) <span className="text-red-500">*</span></Label>
                <input name="ratePerUnit" value={form.ratePerUnit} onChange={handleChange} type="number" step="0.01" className={inputClass} />
              </div>
              <div>
                <Label>มีผลตั้งแต่วันที่ <span className="text-red-500">*</span></Label>
                <input name="effectiveFrom" value={form.effectiveFrom} onChange={handleChange} type="date" className={inputClass} />
              </div>
              <div>
                <Label>หมายเหตุ</Label>
                <input name="remark" value={form.remark} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={handleSubmit} disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? "กำลังบันทึก..." : "บันทึกอัตราใหม่"}
              </button>
            </div>
          </div>
        )}

        <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">ประวัติอัตราค่าน้ำ</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="py-2 px-2">หมู่บ้าน</th>
                <th className="py-2 px-2 text-right">อัตรา (บาท/หน่วย)</th>
                <th className="py-2 px-2 text-center">มีผลตั้งแต่</th>
                <th className="py-2 px-2">หมายเหตุ</th>
                {canDelete("/waterrate") && <th className="py-2 px-2 text-center">จัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="py-4 text-center text-gray-400">กำลังโหลด...</td></tr>
              )}
              {!loading && rates.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center text-gray-400">ยังไม่มีข้อมูลอัตราค่าน้ำ</td></tr>
              )}
              {rates.map((r) => (
                <tr key={r.rateId} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-2">{villageName(r.villageId)}</td>
                  <td className="py-2 px-2 text-right">{Number(r.ratePerUnit).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-2 text-center">{r.effectiveFrom}</td>
                  <td className="py-2 px-2">{r.remark || "-"}</td>
                  {canDelete("/waterrate") && (
                    <td className="py-2 px-2 text-center">
                      <button onClick={() => handleDelete(r.rateId)} className="text-red-500 hover:underline text-xs">ลบ</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </PermissionGuard>
  );
}
