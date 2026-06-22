"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useGeoScope } from "@/context/GeoScopeContext";
import PermissionGuard from "@/components/common/PermissionGuard";

type FormErrors = Partial<Record<string, string>>;

interface Village { villageId: number; villageName: string; moo: string | null; }

const TRAINING_TYPES = ["อาชีพ", "สุขภาพ", "การเงิน", "สิ่งแวดล้อม", "เทคโนโลยี", "อื่น ๆ"];

export default function TrainingAdd() {
  const router = useRouter();
  const { selectedVillage } = useGeoScope();
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [form, setForm] = useState({
    trainingName: "",
    trainingType: "",
    organizer: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    document.title = "Smart Village | Training Add";
    const r = localStorage.getItem("role");
    setRole(r);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.trainingName.trim()) e.trainingName = "กรุณาระบุชื่อโครงการ";
    if (!form.trainingType) e.trainingType = "กรุณาเลือกหมวดหมู่";
    if (!form.startDate) e.startDate = "กรุณาระบุวันเริ่ม";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resolveVillageId = (): number | null => {
    if (role === "VILLAGE" || role === "VIEWER") {
      const scopeId = localStorage.getItem("scopeId");
      return scopeId ? Number(scopeId) : null;
    }
    return selectedVillage ? selectedVillage.villageId : null;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const targetVillageId = resolveVillageId();
    if (!targetVillageId) {
      Swal.fire({ 
        icon: "warning", 
        title: "กรุณาเลือกหมู่บ้าน", 
        text: "ไม่พบข้อมูลขอบเขตหมู่บ้าน โปรดเลือกหมู่บ้านจากเมนูด้านบนก่อนทำรายการ" 
      });
      return;
    }

    setSaving(true);
    try {
      await axios.post("/training-events/add", {
        villageId: targetVillageId,
        trainingName: form.trainingName,
        trainingType: form.trainingType,
        organizer: form.organizer || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        location: form.location || null,
        description: form.description || null,
      });

      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1800, showConfirmButton: false });
      router.push("/training");
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: err?.response?.data?.message || err?.message });
    } finally {
      setSaving(false);
    }
  };

  // 🛠️ ฟังก์ชัน selectClass ที่ระบบต้องการเรียกใช้งาน
  const selectClass = (field: string) =>
    `mt-1 w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 dark:text-gray-300 ${
      errors[field]
        ? "border-red-400 focus:border-red-400 focus:ring-red-400 text-red-700"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-700 dark:border-gray-600"
    }`;

  return (
    <PermissionGuard menuUrl="/training" action="add">
    <ComponentCard title="เพิ่มโครงการอบรม (Add Training Event)">

      {role === "VILLAGE" || role === "VIEWER" ? (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-green-500 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
          บันทึกโครงการในขอบเขตพื้นที่หมู่บ้านของคุณโดยอัตโนมัติ (ตามสิทธิ์ผู้ใช้งาน)
        </div>
      ) : (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-blue-500 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {selectedVillage ? (
            <span>📍 กำลังเพิ่มโครงการอบรมในขอบเขต: <strong>{selectedVillage.villageName} {selectedVillage.moo ? `(หมู่ ${selectedVillage.moo})` : ""}</strong></span>
          ) : (
            <span className="text-red-500">⚠️ กรุณาเลือกหมู่บ้านที่แถบเมนูด้านบนก่อนทำรายการเพิ่มข้อมูล</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <Label>ชื่อโครงการ/อบรม <span className="text-red-500">*</span></Label>
          <Input
            name="trainingName"
            value={form.trainingName}
            onChange={handleChange}
            type="text"
            placeholder="เช่น อบรมทำปุ๋ยอินทรีย์"
            className={errors.trainingName ? "border-red-400" : ""}
          />
          {errors.trainingName && <p className="mt-1 text-xs text-red-500">{errors.trainingName}</p>}
        </div>

        <div>
          <Label>หมวดหมู่ <span className="text-red-500">*</span></Label>
          <select name="trainingType" value={form.trainingType} onChange={handleChange} className={selectClass("trainingType")}>
            <option value="">-- เลือกหมวดหมู่ --</option>
            {TRAINING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.trainingType && <p className="mt-1 text-xs text-red-500">{errors.trainingType}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <Label>หน่วยงานที่จัด</Label>
          <Input name="organizer" value={form.organizer} onChange={handleChange} type="text" placeholder="เช่น อบต., พัฒนาชุมชน" />
        </div>
        <div>
          <Label>สถานที่จัด</Label>
          <Input name="location" value={form.location} onChange={handleChange} type="text" placeholder="เช่น ศาลากลางหมู่บ้าน" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <Label>วันเริ่มต้น <span className="text-red-500">*</span></Label>
          <DatePicker
            id="startDate"
            placeholder="เลือกวันที่เริ่ม"
            defaultDate={form.startDate || undefined}
            onChange={(_, dateStr) => {
              setForm(p => ({ ...p, startDate: dateStr }));
              if (errors.startDate) setErrors(p => ({ ...p, startDate: "" }));
            }}
          />
          {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
        </div>
        <div>
          <Label>วันสิ้นสุด</Label>
          <DatePicker
            id="endDate"
            placeholder="เลือกวันที่สิ้นสุด"
            defaultDate={form.endDate || undefined}
            onChange={(_, dateStr) => setForm(p => ({ ...p, endDate: dateStr }))}
          />
        </div>
      </div>

      <div className="mt-4">
        <Label>รายละเอียด</Label>
        <TextArea
          value={form.description}
          onChange={(v) => setForm(p => ({ ...p, description: v }))}
          rows={3}
          placeholder="อธิบายรายละเอียดโครงการ วัตถุประสงค์ หรือเนื้อหาการอบรม..."
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => router.push("/training")}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || (!selectedVillage && role !== "VILLAGE" && role !== "VIEWER")}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </ComponentCard>
  </PermissionGuard>
  );
}