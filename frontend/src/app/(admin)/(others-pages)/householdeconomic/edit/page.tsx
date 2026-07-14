"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

type FormErrors = Partial<Record<string, string>>;

interface Household {
  householdId: number;
  houseNo: string;
  moo: string | null;
}

const DEBT_TYPES = ["ไม่มีหนี้", "หนี้ กยศ.", "หนี้สินเชื่อบ้าน", "หนี้บัตรเครดิต", "หนี้สหกรณ์", "หนี้นอกระบบ", "อื่น ๆ"];

function HouseholdEconomicEditContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [form, setForm] = useState({
    id: "",
    householdId: "",
    incomeTotalPerMonth: "",
    debtTotal: "",
    debtType: "",
    poorFlag: "false",
    recordDate: "",
  });

  const fetchHouseholds = useCallback(async () => {
    try {
      const res = await axios.get<Household[]>("/households");
      setHouseholds(res.data);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | แก้ไขข้อมูลเศรษฐกิจครัวเรือน";
    fetchHouseholds();
    if (!id) return;
    axios.get(`/household-economics/${id}`)
      .then((res) => {
        const d = res.data;
        setForm({
          id: d.id?.toString() || "",
          householdId: d.householdId?.toString() || "",
          incomeTotalPerMonth: d.incomeTotalPerMonth?.toString() || "",
          debtTotal: d.debtTotal?.toString() || "",
          debtType: d.debtType || "",
          poorFlag: d.poorFlag ? "true" : "false",
          recordDate: d.recordDate || "",
        });
      })
      .catch((err: any) => Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message }));
  }, [id, fetchHouseholds]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.householdId) e.householdId = "กรุณาเลือกครัวเรือน";
    if (!form.recordDate) e.recordDate = "กรุณาระบุวันที่บันทึก";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await axios.post("/household-economics/edit", {
        id: parseInt(form.id),
        householdId: parseInt(form.householdId),
        incomeTotalPerMonth: form.incomeTotalPerMonth ? parseFloat(form.incomeTotalPerMonth) : null,
        debtTotal: form.debtTotal ? parseFloat(form.debtTotal) : null,
        debtType: form.debtType || null,
        poorFlag: form.poorFlag === "true",
        recordDate: form.recordDate,
      });
      await Swal.fire({ icon: "success", title: "อัปเดตสำเร็จ", timer: 1800, showConfirmButton: false });
      window.location.href = "/householdeconomic";
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "อัปเดตไม่สำเร็จ", text: err?.response?.data?.message || err?.message });
    } finally {
      setSaving(false);
    }
  };

  const selectClass = (field: string) =>
    `mt-1 w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 dark:text-gray-300 ${
      errors[field]
        ? "border-red-400 focus:border-red-400 focus:ring-red-400 text-red-700"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-700 dark:border-gray-600"
    }`;

  return (
    <ComponentCard title="แก้ไขข้อมูลเศรษฐกิจครัวเรือน">
      <input type="hidden" value={form.id} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>ครัวเรือน <span className="text-red-500">*</span></Label>
          <select name="householdId" value={form.householdId} onChange={handleChange} className={selectClass("householdId")}>
            <option value="">-- เลือกครัวเรือน --</option>
            {households.map((h, i) => (
              <option key={h.householdId ?? i} value={h.householdId}>
                บ้านเลขที่ {h.houseNo || "-"}{h.moo ? ` หมู่ ${h.moo}` : ""}
              </option>
            ))}
          </select>
          {errors.householdId && <p className="mt-1 text-xs text-red-500">{errors.householdId}</p>}
        </div>
        <div>
          <Label>วันที่บันทึก <span className="text-red-500">*</span></Label>
          <DatePicker id="recordDate" placeholder="เลือกวันที่บันทึก" defaultDate={form.recordDate || undefined}
            onChange={(_, d) => {
              setForm((p) => ({ ...p, recordDate: d }));
              if (errors.recordDate) setErrors((p) => ({ ...p, recordDate: "" }));
            }} />
          {errors.recordDate && <p className="mt-1 text-xs text-red-500">{errors.recordDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>รายได้รวมต่อเดือน (บาท)</Label>
          <Input name="incomeTotalPerMonth" value={form.incomeTotalPerMonth} onChange={handleChange}
            type="number" placeholder="เช่น 15000.00" />
        </div>
        <div>
          <Label>หนี้สินรวม (บาท)</Label>
          <Input name="debtTotal" value={form.debtTotal} onChange={handleChange}
            type="number" placeholder="เช่น 50000.00" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>ประเภทหนี้</Label>
          <select name="debtType" value={form.debtType} onChange={handleChange} className={selectClass("debtType")}>
            <option value="">-- เลือกประเภทหนี้ --</option>
            {DEBT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <Label>สถานะครัวเรือนยากจน</Label>
          <select name="poorFlag" value={form.poorFlag} onChange={handleChange} className={selectClass("poorFlag")}>
            <option value="false">ไม่ยากจน</option>
            <option value="true">ยากจน (Poor)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={handleSubmit} disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <a href="/householdeconomic" className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 font-medium">
          ยกเลิก
        </a>
      </div>
    </ComponentCard>
  );
}

export default function HouseholdEconomicEdit() {
  return (
        <PermissionGuard menuUrl="/householdeconomic" action="edit">
<Suspense fallback={<div>Loading...</div>}>
      <HouseholdEconomicEditContent />
    </Suspense>
    </PermissionGuard>

  );
}
