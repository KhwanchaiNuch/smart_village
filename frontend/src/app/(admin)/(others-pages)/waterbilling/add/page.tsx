"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";

type FormErrors = Partial<Record<string, string>>;

interface PendingHousehold {
  householdId: number;
  houseNo: string | null;
  moo: string | null;
}

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function WaterBillAdd() {
  const { village, loaded } = useVillage();
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [households, setHouseholds] = useState<PendingHousehold[]>([]);
  const [previousReading, setPreviousReading] = useState<number>(0);
  const [ratePerUnit, setRatePerUnit] = useState<number>(0);
  const [form, setForm] = useState({
    householdId: "",
    billingPeriod: currentPeriod(),
    meterNo: "",
    currentReading: "",
    dueDate: "",
    remark: "",
  });

  const fetchPending = useCallback(async (period: string) => {
    if (!loaded) return;
    try {
      const vid = village?.villageId;
      const params: Record<string, string | number> = { period };
      if (vid) params.villageId = vid;
      const res = await axios.get<PendingHousehold[]>("/water-bills/pending", { params });
      setHouseholds(res.data);
    } catch { /* non-critical */ }
  }, [loaded, village]);

  const fetchRate = useCallback(async (period: string) => {
    try {
      const vid = village?.villageId;
      const params: Record<string, string | number> = { onDate: `${period}-01` };
      if (vid) params.villageId = vid;
      const res = await axios.get<{ ratePerUnit: number }>("/water-rates/current", { params });
      setRatePerUnit(res.data.ratePerUnit ?? 0);
    } catch { setRatePerUnit(0); }
  }, [village]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | ออกบิลค่าน้ำ";
    fetchPending(form.billingPeriod);
    fetchRate(form.billingPeriod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPending, fetchRate]);

  const handlePeriodChange = (period: string) => {
    setForm((p) => ({ ...p, billingPeriod: period, householdId: "" }));
    setPreviousReading(0);
    fetchPending(period);
    fetchRate(period);
  };

  const handleHouseholdChange = async (householdId: string) => {
    setForm((p) => ({ ...p, householdId }));
    if (errors.householdId) setErrors((p) => ({ ...p, householdId: "" }));
    if (!householdId) { setPreviousReading(0); return; }
    try {
      const res = await axios.get<{ previousReading: number }>(`/water-bills/last-reading/${householdId}`);
      setPreviousReading(res.data.previousReading ?? 0);
    } catch { setPreviousReading(0); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const currentReadingNum = parseFloat(form.currentReading || "0");
  const unitsUsed = Math.max(0, currentReadingNum - previousReading);
  const estimatedAmount = unitsUsed * ratePerUnit;

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.householdId) e.householdId = "กรุณาเลือกครัวเรือน";
    if (!form.billingPeriod) e.billingPeriod = "กรุณาระบุงวดเดือน";
    if (!form.currentReading) e.currentReading = "กรุณาระบุเลขมิเตอร์ปัจจุบัน";
    else if (parseFloat(form.currentReading) < previousReading) e.currentReading = `ต้องไม่น้อยกว่าเลขมิเตอร์ครั้งก่อน (${previousReading})`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await axios.post("/water-bills/add", {
        householdId: parseInt(form.householdId),
        billingPeriod: `${form.billingPeriod}-01`,
        meterNo: form.meterNo || null,
        currentReading: parseFloat(form.currentReading),
        dueDate: form.dueDate || null,
        remark: form.remark || null,
      });
      await Swal.fire({ icon: "success", title: "ออกบิลสำเร็จ", timer: 1800, showConfirmButton: false });
      window.location.href = "/waterbilling";
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: message || "เกิดข้อผิดพลาด" });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field: string) =>
    `mt-1 w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 dark:text-gray-300 ${
      errors[field]
        ? "border-red-400 focus:border-red-400 focus:ring-red-400 text-red-700"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-700 dark:border-gray-600"
    }`;

  return (
    <PermissionGuard menuUrl="/waterbilling" action="add">
      <ComponentCard title="ออกบิลค่าน้ำประปา">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>งวดเดือน <span className="text-red-500">*</span></Label>
            <input type="month" value={form.billingPeriod} onChange={(e) => handlePeriodChange(e.target.value)} className={inputClass("billingPeriod")} />
            {errors.billingPeriod && <p className="mt-1 text-xs text-red-500">{errors.billingPeriod}</p>}
          </div>
          <div>
            <Label>ครัวเรือน <span className="text-red-500">*</span></Label>
            <select name="householdId" value={form.householdId} onChange={(e) => handleHouseholdChange(e.target.value)} className={inputClass("householdId")}>
              <option value="">-- เลือกครัวเรือน --</option>
              {households.map((h) => (
                <option key={h.householdId} value={h.householdId}>
                  บ้านเลขที่ {h.houseNo || "-"}{h.moo ? ` หมู่ ${h.moo}` : ""}
                </option>
              ))}
            </select>
            {errors.householdId && <p className="mt-1 text-xs text-red-500">{errors.householdId}</p>}
            <p className="mt-1 text-xs text-gray-400">แสดงเฉพาะครัวเรือนที่ยังไม่มีบิลของงวดนี้</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label>เลขมิเตอร์ครั้งก่อน</Label>
            <input value={previousReading} readOnly className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 dark:bg-gray-800 dark:border-gray-700" />
          </div>
          <div>
            <Label>เลขมิเตอร์ปัจจุบัน <span className="text-red-500">*</span></Label>
            <input name="currentReading" value={form.currentReading} onChange={handleChange} type="number" step="0.01" className={inputClass("currentReading")} />
            {errors.currentReading && <p className="mt-1 text-xs text-red-500">{errors.currentReading}</p>}
          </div>
          <div>
            <Label>เลขที่มิเตอร์ (ถ้ามี)</Label>
            <input name="meterNo" value={form.meterNo} onChange={handleChange} className={inputClass("meterNo")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>กำหนดชำระ (ถ้าไม่ระบุ ระบบจะกำหนดให้อัตโนมัติ)</Label>
            <input name="dueDate" value={form.dueDate} onChange={handleChange} type="date" className={inputClass("dueDate")} />
          </div>
          <div>
            <Label>หมายเหตุ</Label>
            <input name="remark" value={form.remark} onChange={handleChange} className={inputClass("remark")} />
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-4 text-sm">
          <p>อัตราค่าน้ำ: <span className="font-medium">{ratePerUnit.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท/หน่วย</span></p>
          <p>หน่วยที่ใช้โดยประมาณ: <span className="font-medium">{unitsUsed.toLocaleString("th-TH")} หน่วย</span></p>
          <p>จำนวนเงินโดยประมาณ: <span className="font-semibold text-blue-700 dark:text-blue-300">{estimatedAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span></p>
        </div>

        <div className="flex justify-end gap-3">
          <a href="/waterbilling" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
            ยกเลิก
          </a>
          <button onClick={handleSubmit} disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "กำลังบันทึก..." : "บันทึกและออกใบแจ้งหนี้"}
          </button>
        </div>
      </ComponentCard>
    </PermissionGuard>
  );
}
