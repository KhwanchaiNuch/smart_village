"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

type FormErrors = Partial<Record<string, string>>;

export default function MenuAdd() {
  const [form, setForm] = useState({ name: "", url: "", status: true });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async () => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "กรุณาระบุชื่อ Menu";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      await axios.post("/menus/add", { name: form.name.trim(), url: form.url || null, status: form.status });
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false });
      window.location.href = "/menu";
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: err?.response?.data?.message });
    } finally { setSaving(false); }
  };

  return (
    <PermissionGuard adminOnly>
    <ComponentCard title="เพิ่ม Menu">
      <div className="max-w-md space-y-5">
        <div>
          <Label>ชื่อ Menu <span className="text-red-500">*</span></Label>
          <Input name="name" type="text" value={form.name} onChange={handleChange}
            placeholder="เช่น จัดการครัวเรือน, รายงาน"
            className={errors.name ? "border-red-400" : ""} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <Label>URL</Label>
          <Input name="url" type="text" value={form.url} onChange={handleChange}
            placeholder="เช่น /household, /training" />
        </div>

        <div>
          <Label>สถานะ</Label>
          <div className="flex gap-6 mt-2">
            {[{ label: "เปิดใช้งาน", val: true }, { label: "ปิดใช้งาน", val: false }].map(opt => (
              <label key={String(opt.val)} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" checked={form.status === opt.val}
                  onChange={() => setForm(p => ({ ...p, status: opt.val }))}
                  className="accent-blue-600" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => window.history.back()}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
            ยกเลิก
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </ComponentCard>
  </PermissionGuard>
  );
}
