"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";

type FormErrors = Partial<Record<string, string>>;

interface Person {
  personId: number;
  firstName: string;
  lastName: string;
}

const SKILL_LEVELS = ["เบื้องต้น", "ปานกลาง", "ดี", "เชี่ยวชาญ"];

export default function PersonSkillAdd() {
  const { village, loaded } = useVillage();
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [form, setForm] = useState({
    personId: "",
    skillName: "",
    skillLevel: "",
    certificateFlag: "false",
  });

  const fetchPersons = useCallback(async () => {
    if (!loaded) return;
    try {
      const vid = village?.villageId;
      const res = await axios.get<Person[]>(vid ? `/persons?villageId=${vid}` : "/persons");
      setPersons(res.data);
    } catch { /* non-critical */ }
  }, [loaded, village]);

  useEffect(() => {
    document.title = "Smart Village | เพิ่มทักษะบุคคล";
    fetchPersons();
  }, [fetchPersons]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.personId) e.personId = "กรุณาเลือกบุคคล";
    if (!form.skillName.trim()) e.skillName = "กรุณาระบุชื่อทักษะ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await axios.post("/person-skills/add", {
        personId: parseInt(form.personId),
        skillName: form.skillName,
        skillLevel: form.skillLevel || null,
        certificateFlag: form.certificateFlag === "true",
      });
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1800, showConfirmButton: false });
      window.location.href = "/personskill";
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
    <ComponentCard title="เพิ่มทักษะบุคคล">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>บุคคล <span className="text-red-500">*</span></Label>
          <select name="personId" value={form.personId} onChange={handleChange} className={selectClass("personId")}>
            <option value="">-- เลือกบุคคล --</option>
            {persons.map((p, i) => (
              <option key={p.personId ?? i} value={p.personId}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
          {errors.personId && <p className="mt-1 text-xs text-red-500">{errors.personId}</p>}
        </div>
        <div>
          <Label>ชื่อทักษะ <span className="text-red-500">*</span></Label>
          <Input name="skillName" value={form.skillName} onChange={handleChange}
            type="text" placeholder="เช่น การทำเกษตร, ช่างไม้, ทักษะคอมพิวเตอร์"
            className={errors.skillName ? "border-red-400" : ""} />
          {errors.skillName && <p className="mt-1 text-xs text-red-500">{errors.skillName}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>ระดับทักษะ</Label>
          <select name="skillLevel" value={form.skillLevel} onChange={handleChange} className={selectClass("skillLevel")}>
            <option value="">-- เลือกระดับ --</option>
            {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <Label>ใบรับรอง / Certificate</Label>
          <select name="certificateFlag" value={form.certificateFlag} onChange={handleChange} className={selectClass("certificateFlag")}>
            <option value="false">ไม่มีใบรับรอง</option>
            <option value="true">มีใบรับรอง</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={handleSubmit} disabled={saving}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <a href="/personskill" className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 font-medium">
          ยกเลิก
        </a>
      </div>
    </ComponentCard>
  );
}
