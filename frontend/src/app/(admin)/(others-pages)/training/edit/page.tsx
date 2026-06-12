"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

type FormErrors = Partial<Record<string, string>>;

const TRAINING_TYPES = ["อาชีพ", "สุขภาพ", "การเงิน", "สิ่งแวดล้อม", "เทคโนโลยี", "อื่น ๆ"];

function TrainingEditContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: "",
    trainingName: "",
    trainingType: "",
    organizer: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    document.title = "Smart Village | Training Edit";
    if (!id) return;
    axios.get(`/training-events/${id}`)
      .then((res) => {
        const d = res.data;
        setForm({
          id: d.id?.toString() || "",
          trainingName: d.trainingName || "",
          trainingType: d.trainingType || "",
          organizer: d.organizer || "",
          startDate: d.startDate || "",
          endDate: d.endDate || "",
          location: d.location || "",
          description: d.description || "",
        });
      })
      .catch((err: any) => Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message }));
  }, [id]);

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
      await axios.post("/training-events/edit", {
        id: parseInt(form.id),
        trainingName: form.trainingName,
        trainingType: form.trainingType,
        organizer: form.organizer || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        location: form.location || null,
        description: form.description || null,
      });
      await Swal.fire({ icon: "success", title: "อัปเดตสำเร็จ", timer: 1800, showConfirmButton: false });
      window.location.href = "/training";
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
    <ComponentCard title="แก้ไขโครงการอบรม (Edit Training Event)">
      <input type="hidden" value={form.id} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>ชื่อโครงการ/อบรม <span className="text-red-500">*</span></Label>
          <Input name="trainingName" value={form.trainingName} onChange={handleChange} type="text" placeholder="เช่น อบรมทำปุ๋ยอินทรีย์" className={errors.trainingName ? "border-red-400" : ""} />
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
          <Input name="organizer" value={form.organizer} onChange={handleChange} type="text" placeholder="เช่น อบต." />
        </div>
        <div>
          <Label>สถานที่จัด</Label>
          <Input name="location" value={form.location} onChange={handleChange} type="text" placeholder="เช่น ศาลากลางหมู่บ้าน" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>วันเริ่มต้น <span className="text-red-500">*</span></Label>
          <DatePicker id="startDate" placeholder="เลือกวันเริ่ม" defaultDate={form.startDate || undefined}
            onChange={(_, d) => { setForm((p) => ({ ...p, startDate: d })); if (errors.startDate) setErrors((p) => ({ ...p, startDate: "" })); }} />
          {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
        </div>
        <div>
          <Label>วันสิ้นสุด</Label>
          <DatePicker id="endDate" placeholder="เลือกวันสิ้นสุด" defaultDate={form.endDate || undefined} onChange={(_, d) => setForm((p) => ({ ...p, endDate: d }))} />
        </div>
      </div>

      <div>
        <Label>รายละเอียด</Label>
        <TextArea value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} rows={3} />
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <a href="/training" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300">ยกเลิก</a>
      </div>
    </ComponentCard>
  );
}

export default function TrainingEdit() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrainingEditContent />
    </Suspense>
  );
}
