"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

export default function RoleAdd() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) { setError("กรุณาระบุชื่อ Role"); return; }
    setSaving(true);
    try {
      await axios.post("/roles/add", { name: name.trim(), status });
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false });
      window.location.href = "/role";
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: err?.response?.data?.message });
    } finally { setSaving(false); }
  };

  return (
    <PermissionGuard adminOnly>
    <ComponentCard title="เพิ่ม Role">
      <div className="max-w-md space-y-5">
        <div>
          <Label>ชื่อ Role <span className="text-red-500">*</span></Label>
          <Input type="text" value={name} onChange={e => { setName(e.target.value); setError(""); }}
            placeholder="เช่น ADMIN, VILLAGE, TAMBON"
            className={error ? "border-red-400" : ""} />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <div>
          <Label>สถานะ</Label>
          <div className="flex gap-6 mt-2">
            {[{ label: "เปิดใช้งาน", val: true }, { label: "ปิดใช้งาน", val: false }].map(opt => (
              <label key={String(opt.val)} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" checked={status === opt.val} onChange={() => setStatus(opt.val)}
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
