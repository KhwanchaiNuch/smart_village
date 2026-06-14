"use client"
import ComponentCard from "@/components/common/ComponentCard";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

const ROLES = [
  { value: "ADMIN",    label: "ผู้ดูแลระบบ"          },
  { value: "PROVINCE", label: "ผู้ใช้ระดับจังหวัด"   },
  { value: "AMPHUR",   label: "ผู้ใช้ระดับอำเภอ"     },
  { value: "TAMBON",   label: "ผู้ใช้ระดับตำบล"      },
  { value: "VILLAGE",  label: "ผู้ใช้ระดับหมู่บ้าน"  },
];

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    roleLevel: "VILLAGE",
    scopeId: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = "กรุณากรอก username";
    else if (form.username.trim().length < 3) e.username = "username ต้องมีอย่างน้อย 3 ตัวอักษร";
    if (!form.password) e.password = "กรุณากรอก password";
    else if (form.password.length < 6) e.password = "password ต้องมีอย่างน้อย 6 ตัวอักษร";
    if (form.password !== form.confirmPassword) e.confirmPassword = "password ไม่ตรงกัน";
    if (!form.roleLevel) e.roleLevel = "กรุณาเลือกระดับสิทธิ์";
    if (form.scopeId && isNaN(Number(form.scopeId))) e.scopeId = "Scope ID ต้องเป็นตัวเลข";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await axios.post("/admin/users", {
        username: form.username.trim(),
        password: form.password,
        fullName: form.fullName.trim() || null,
        roleLevel: form.roleLevel,
        scopeId: form.scopeId ? Number(form.scopeId) : null,
        isActive: form.isActive,
      });
      await Swal.fire({ icon: "success", title: "เพิ่มผู้ใช้สำเร็จ", timer: 1400, showConfirmButton: false });
      router.push("/manageusers");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "เกิดข้อผิดพลาด";
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `h-10 w-full rounded-lg border px-3 text-sm text-gray-800 outline-none focus:ring-1 dark:bg-gray-900 dark:text-white ${
      errors[field]
        ? "border-red-400 focus:ring-red-400 dark:border-red-500"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
    }`;

  return (
    <div className="space-y-5">
      <ComponentCard title="">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">เพิ่มผู้ใช้งานใหม่</h3>
          <button onClick={() => router.push("/manageusers")}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            กลับ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
          {/* Username */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.username} onChange={(e) => set("username", e.target.value)}
              placeholder="กรอก username" className={inputCls("username")} />
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
          </div>

          {/* Full name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อ-สกุล</label>
            <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
              placeholder="ชื่อ นามสกุล (ไม่บังคับ)" className={inputCls("fullName")} />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password <span className="text-red-500">*</span>
            </label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร" className={inputCls("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ยืนยัน Password <span className="text-red-500">*</span>
            </label>
            <input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder="กรอก password อีกครั้ง" className={inputCls("confirmPassword")} />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ระดับสิทธิ์ <span className="text-red-500">*</span>
            </label>
            <select value={form.roleLevel} onChange={(e) => set("roleLevel", e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {errors.roleLevel && <p className="mt-1 text-xs text-red-500">{errors.roleLevel}</p>}
          </div>

          {/* Scope ID */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Scope ID (Village ID)</label>
            <input type="number" min={1} value={form.scopeId} onChange={(e) => set("scopeId", e.target.value)}
              placeholder="รหัสหมู่บ้าน (สำหรับระดับหมู่บ้าน)" className={inputCls("scopeId")} />
            {errors.scopeId && <p className="mt-1 text-xs text-red-500">{errors.scopeId}</p>}
            <p className="mt-1 text-xs text-gray-400">ผู้ใช้ระดับหมู่บ้านจะเห็นเฉพาะข้อมูลของ Village ID นี้</p>
          </div>

          {/* isActive */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">{form.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
              {loading ? (
                <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              )}
              บันทึก
            </button>
            <button type="button" onClick={() => router.push("/manageusers")} disabled={loading}
              className="rounded-full border border-gray-300 px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400">
              ยกเลิก
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
