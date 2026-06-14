"use client"
import ComponentCard from "@/components/common/ComponentCard";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

const ROLES = [
  { value: "ADMIN",    label: "ผู้ดูแลระบบ"          },
  { value: "PROVINCE", label: "ผู้ใช้ระดับจังหวัด"   },
  { value: "AMPHUR",   label: "ผู้ใช้ระดับอำเภอ"     },
  { value: "TAMBON",   label: "ผู้ใช้ระดับตำบล"      },
  { value: "VILLAGE",  label: "ผู้ใช้ระดับหมู่บ้าน"  },
];

function EditUserContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    roleLevel: "VILLAGE",
    scopeId: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "Smart Village | แก้ไขผู้ใช้";
    if (!id) { router.push("/manageusers"); return; }
    axios.get(`/admin/users/${id}`)
      .then((res) => {
        const u = res.data;
        setForm({
          username: u.username || "",
          fullName: u.fullName || "",
          password: "",
          confirmPassword: "",
          roleLevel: u.roleLevel || "VILLAGE",
          scopeId: u.scopeId != null ? String(u.scopeId) : "",
          isActive: u.isActive ?? true,
        });
      })
      .catch(() => {
        Swal.fire({ icon: "error", title: "ไม่พบข้อมูล user" });
        router.push("/manageusers");
      })
      .finally(() => setFetching(false));
  }, [id]);

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = "กรุณากรอก username";
    else if (form.username.trim().length < 3) e.username = "username ต้องมีอย่างน้อย 3 ตัวอักษร";
    if (form.password && form.password.length < 6) e.password = "password ต้องมีอย่างน้อย 6 ตัวอักษร";
    if (form.password && form.password !== form.confirmPassword) e.confirmPassword = "password ไม่ตรงกัน";
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
      const body: Record<string, any> = {
        username: form.username.trim(),
        fullName: form.fullName.trim() || null,
        roleLevel: form.roleLevel,
        scopeId: form.scopeId ? Number(form.scopeId) : null,
        isActive: form.isActive,
      };
      if (form.password) body.password = form.password;
      await axios.put(`/admin/users/${id}`, body);
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1400, showConfirmButton: false });
      router.push("/manageusers");
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: err?.response?.data?.message || "เกิดข้อผิดพลาด" });
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

  if (fetching) return (
    <div className="flex items-center justify-center py-20 text-gray-400">กำลังโหลด...</div>
  );

  return (
    <div className="space-y-5">
      <ComponentCard title="">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">แก้ไขผู้ใช้งาน</h3>
          <button onClick={() => router.push("/manageusers")}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            กลับ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.username} onChange={(e) => set("username", e.target.value)}
              className={inputCls("username")} />
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อ-สกุล</label>
            <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
              placeholder="ชื่อ นามสกุล (ไม่บังคับ)" className={inputCls("fullName")} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ระดับสิทธิ์ <span className="text-red-500">*</span>
            </label>
            <select value={form.roleLevel} onChange={(e) => set("roleLevel", e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Scope ID (Village ID)</label>
            <input type="number" min={1} value={form.scopeId} onChange={(e) => set("scopeId", e.target.value)}
              placeholder="รหัสหมู่บ้าน (สำหรับระดับหมู่บ้าน)" className={inputCls("scopeId")} />
            {errors.scopeId && <p className="mt-1 text-xs text-red-500">{errors.scopeId}</p>}
          </div>

          <div className="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
            <p className="mb-3 text-xs text-gray-400">เปลี่ยน Password (เว้นว่างถ้าไม่ต้องการเปลี่ยน)</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Password ใหม่</label>
                <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร" className={inputCls("password")} />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">ยืนยัน Password ใหม่</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
                  placeholder="กรอก password อีกครั้ง" className={inputCls("confirmPassword")} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">{form.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? (
                <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
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

export default function EditUserPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-400">กำลังโหลด...</div>}>
      <EditUserContent />
    </Suspense>
  );
}
