"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";
import PermissionGuard from "@/components/common/PermissionGuard";

type FormErrors = Partial<Record<string, string>>;
interface Person { personId: number; firstName: string; lastName: string; }
interface Household { householdId: number; houseNo: string; moo: string | null; }

const NEED_TYPES = ["สาธารณูปโภค", "สาธารณสุข", "การศึกษา", "อาชีพ/รายได้", "ที่อยู่อาศัย", "สวัสดิการ", "ความปลอดภัย", "อื่น ๆ"];

export default function VillageSurveyAdd() {
  const { village, loaded } = useVillage();
  const [role, setRole] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [form, setForm] = useState({
    householdId: "", personId: "", needType: "",
    priorityLevel: "3", detail: "", surveyDate: "",
  });

  const fetchRefs = useCallback(async () => {
    if (!loaded) return;
    try {
      const vid = village?.villageId;
      const [pRes, hRes] = await Promise.all([
        axios.get<Person[]>(vid ? `/persons?villageId=${vid}` : "/persons"),
        axios.get<Household[]>(vid ? `/households?villageId=${vid}` : "/households"),
      ]);
      setPersons(pRes.data);
      setHouseholds(hRes.data);
    } catch { /* non-critical */ }
  }, [loaded, village]);

  useEffect(() => {
    document.title = "Smart Village | เพิ่มความต้องการชุมชน";
    setRole(localStorage.getItem("role"));
    fetchRefs();
  }, [fetchRefs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.needType) e.needType = "กรุณาเลือกประเภทความต้องการ";
    if (!form.surveyDate) e.surveyDate = "กรุณาระบุวันที่สำรวจ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await axios.post("/village-need-surveys/add", {
        householdId: form.householdId ? parseInt(form.householdId) : null,
        personId: form.personId ? parseInt(form.personId) : null,
        needType: form.needType,
        priorityLevel: form.priorityLevel ? parseInt(form.priorityLevel) : null,
        detail: form.detail || null,
        surveyDate: form.surveyDate,
        villageId: village?.villageId ?? null,
      });
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1800, showConfirmButton: false });
      window.location.href = "/villagesurvey";
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: err?.response?.data?.message || err?.message });
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
    <PermissionGuard menuUrl="/villagesurvey" action="add">
    <ComponentCard title="เพิ่มความต้องการของชุมชน">
      {/* Village context banner */}
      {loaded && village && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          บันทึกสำหรับ: <strong className="ml-1">{village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}</strong>
        </div>
      )}
      {loaded && !village && role === "ADMIN" && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-sm text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          ยังไม่ได้เลือกหมู่บ้าน — กรุณาเลือกหมู่บ้านจากแถบด้านบนก่อนเพิ่มข้อมูล
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>ประเภทความต้องการ <span className="text-red-500">*</span></Label>
          <select name="needType" value={form.needType} onChange={handleChange} className={selectClass("needType")}>
            <option value="">-- เลือกประเภท --</option>
            {NEED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.needType && <p className="mt-1 text-xs text-red-500">{errors.needType}</p>}
        </div>
        <div>
          <Label>ระดับความสำคัญ (1=ต่ำ, 5=เร่งด่วน)</Label>
          <select name="priorityLevel" value={form.priorityLevel} onChange={handleChange} className={selectClass("priorityLevel")}>
            {[1,2,3,4,5].map((n) => (
              <option key={n} value={n}>
                {n} – {["ต่ำมาก","ต่ำ","ปานกลาง","สูง","เร่งด่วน"][n-1]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>ครัวเรือนที่เกี่ยวข้อง</Label>
          <select name="householdId" value={form.householdId} onChange={handleChange} className={selectClass("householdId")}>
            <option value="">-- ไม่ระบุ --</option>
            {households.map((h, i) => (
              <option key={h.householdId ?? i} value={h.householdId}>
                บ้านเลขที่ {h.houseNo || "-"}{h.moo ? ` หมู่ ${h.moo}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>บุคคลที่เกี่ยวข้อง</Label>
          <select name="personId" value={form.personId} onChange={handleChange} className={selectClass("personId")}>
            <option value="">-- ไม่ระบุ --</option>
            {persons.map((p, i) => (
              <option key={p.personId ?? i} value={p.personId}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>รายละเอียดความต้องการ</Label>
        <TextArea value={form.detail} onChange={(v) => setForm((p) => ({ ...p, detail: v }))}
          rows={3} placeholder="อธิบายความต้องการหรือปัญหาเพิ่มเติม..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>วันที่สำรวจ <span className="text-red-500">*</span></Label>
          <DatePicker id="surveyDate" placeholder="เลือกวันที่สำรวจ"
            onChange={(_, d) => {
              setForm((p) => ({ ...p, surveyDate: d }));
              if (errors.surveyDate) setErrors((p) => ({ ...p, surveyDate: "" }));
            }} />
          {errors.surveyDate && <p className="mt-1 text-xs text-red-500">{errors.surveyDate}</p>}
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={handleSubmit} disabled={saving}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <a href="/villagesurvey" className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 font-medium">
          ยกเลิก
        </a>
      </div>
    </ComponentCard>
  </PermissionGuard>
  );
}
