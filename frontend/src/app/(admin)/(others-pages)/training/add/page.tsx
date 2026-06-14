"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

type FormErrors = Partial<Record<string, string>>;

interface Village { villageId: number; villageName: string; moo: string | null; }

const TRAINING_TYPES = ["อาชีพ", "สุขภาพ", "การเงิน", "สิ่งแวดล้อม", "เทคโนโลยี", "อื่น ๆ"];

export default function TrainingAdd() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [adminVillageId, setAdminVillageId] = useState<string>("");
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
    if (r === "ADMIN") {
      axios.get<Village[]>("/villages/all").then(res => setVillages(res.data)).catch(() => {});
    }
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

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await axios.post("/training-events/add", {
        villageId: role === "ADMIN" && adminVillageId ? Number(adminVillageId) : null,
        trainingName: form.trainingName,
        trainingType: form.trainingType,
        organizer: form.organizer || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        location: form.location || null,
        description: form.description || null,
      });
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1800, showConfirmButton: false });
      window.location.href = "/training";
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
    <ComponentCard title="เพิ่มโครงการอบรม (Add Training Event)">

      {/* Admin: เลือกหมู่บ้าน */}
      {role === "ADMIN" && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <Label>หมู่บ้านที่จัดอบรม (ถ้าไม่ระบุจะเป็นข้อมูลระดับ Admin)</Label>
          <select
            value={adminVillageId}
            onChange={e => setAdminVillageId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- ไม่ระบุหมู่บ้าน --</option>
            {villages.map(v => (
              <option key={v.villageId} value={v.villageId}>
                {v.villageName}{v.moo ? ` (หมู่ ${v.moo})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>หน่วยงานที่จัด</Label>
          <Input name="organizer" value={form.organizer} onChange={handleChange} type="text" placeholder="เช่น อบต., พัฒนาชุมชน" />
        </div>
        <div>
          <Label>สถานที่จัด</Label>
          <Input name="location" value={form.location} onChange={handleChange} type="text" placeholder="เช่น ศาลากลางหมู่บ้าน" />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div>
        <Label>รายละเอียด</Label>
        <TextArea
          value={form.description}
          onChange={(v) => setForm(p => ({ ...p, description: v }))}
          rows={3}
          placeholder="อธิบายรายละเอียดโครงการ วัตถุประสงค์ หรือเนื้อหาการอบรม..."
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </ComponentCard>
  );
}
