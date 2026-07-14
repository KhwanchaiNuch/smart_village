"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

interface Province { provinceId: number; nameTh: string; }
interface Amphur   { amphurId: number; provinceId: number; nameTh: string; }
interface Tambon   { tambonId: number; amphurId: number; nameTh: string; zipcode: string | null; }

const SEL = "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed";

export default function VillageAdd() {
  const router = useRouter();

  // ── role / scope ──────────────────────────────────────────────────────
  const [role,    setRole]    = useState<string | null>(null);
  const [scopeId, setScopeId] = useState<number | null>(null);

  // ── dropdown data ─────────────────────────────────────────────────────
  const [provinces,   setProvinces]   = useState<Province[]>([]);
  const [amphurs,     setAmphurs]     = useState<Amphur[]>([]);
  const [tambons,     setTambons]     = useState<Tambon[]>([]);
  const [allAmphurs,  setAllAmphurs]  = useState<Amphur[]>([]);
  const [allTambons,  setAllTambons]  = useState<Tambon[]>([]);

  // ── selected values ───────────────────────────────────────────────────
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [amphurId,   setAmphurId]   = useState<number | "">("");
  const [tambonId,   setTambonId]   = useState<number | "">("");
  const [form,       setForm]       = useState({ villageName: "", moo: "" });
  const [loading,    setLoading]    = useState(false);

  // ── init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | เพิ่มหมู่บ้าน";
    const r   = localStorage.getItem("role");
    const sid = localStorage.getItem("scopeId");
    const sidNum = sid ? Number(sid) : null;
    setRole(r);
    setScopeId(sidNum);

    if (r === "ADMIN") {
      // ADMIN: load all
      axios.get<Province[]>("/provinces").then(res => setProvinces([...res.data].sort((a,b) => a.provinceId - b.provinceId))).catch(() => {});
      axios.get<Amphur[]>("/amphurs/all").then(res => setAllAmphurs(res.data)).catch(() => {});
      axios.get<Tambon[]>("/tambons/all").then(res => setAllTambons(res.data)).catch(() => {});
    } else if (r === "PROVINCE" && sidNum) {
      // PROVINCE: pre-load amphurs for their province
      axios.get<Amphur[]>(`/amphurs?provinceId=${sidNum}`).then(res => setAmphurs(res.data)).catch(() => {});
    } else if (r === "AMPHUR" && sidNum) {
      // AMPHUR: pre-load tambons for their amphur
      axios.get<Tambon[]>(`/tambons?amphurId=${sidNum}`).then(res => setTambons(res.data)).catch(() => {});
    } else if (r === "TAMBON" && sidNum) {
      // TAMBON: tambonId = scopeId, pre-fill
      setTambonId(sidNum);
    }
  }, []);

  // ── ADMIN cascade ─────────────────────────────────────────────────────
  const amphursForDropdown = role === "ADMIN" && provinceId !== "" ? allAmphurs.filter(a => a.provinceId === provinceId) : amphurs;
  const tambonsForDropdown = role === "ADMIN" && amphurId !== ""   ? allTambons.filter(t => t.amphurId === amphurId) : tambons;

  const onProvinceChange = (val: string) => {
    const pid = val ? Number(val) : "";
    setProvinceId(pid);
    setAmphurId(""); setTambonId("");
    if (pid !== "") {
      axios.get<Amphur[]>(`/amphurs?provinceId=${pid}`).then(res => setAmphurs(res.data)).catch(() => {});
    } else { setAmphurs([]); }
  };
  const onAmphurChange = (val: string) => {
    const aid = val ? Number(val) : "";
    setAmphurId(aid); setTambonId("");
    if (aid !== "") {
      axios.get<Tambon[]>(`/tambons?amphurId=${aid}`).then(res => setTambons(res.data)).catch(() => {});
    } else { setTambons([]); }
  };

  // ── ADMIN only: province dropdown resets chain ─────────────────────
  // (handled in onProvinceChange / onAmphurChange above)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const selectedTambon = [...allTambons, ...tambons].find(t => t.tambonId === tambonId);

  const handleSubmit = async () => {
    // validate location
    if (role === "ADMIN" || role === "PROVINCE") {
      if (amphurId === "" || tambonId === "") {
        Swal.fire({ icon: "warning", title: "กรุณาเลือกพื้นที่ให้ครบ", text: "ต้องระบุ อำเภอ / ตำบล" });
        return;
      }
    } else if (role === "AMPHUR") {
      if (tambonId === "") {
        Swal.fire({ icon: "warning", title: "กรุณาเลือกตำบล" });
        return;
      }
    }
    // TAMBON: tambonId pre-filled

    if (!form.villageName.trim()) {
      Swal.fire({ icon: "warning", title: "กรุณากรอกชื่อหมู่บ้าน" });
      return;
    }
    try {
      setLoading(true);
      await axios.post("/villages/add", {
        tambonId: tambonId !== "" ? tambonId : scopeId,
        villageName: form.villageName.trim(),
        moo: form.moo.trim() || null,
      });
      await Swal.fire({ icon: "success", title: "เพิ่มหมู่บ้านสำเร็จ", timer: 1500, showConfirmButton: false });
      router.push("/village");
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "เพิ่มไม่สำเร็จ", text: err?.response?.data?.message || "กรุณาลองใหม่" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGuard menuUrl="/village">
    <ComponentCard title="เพิ่มหมู่บ้าน">
      <div className="space-y-5">

        {/* Location cascade */}
        <ComponentCard title="ที่ตั้งของหมู่บ้าน">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Province — ADMIN only */}
            {role === "ADMIN" && (
              <div>
                <Label>จังหวัด <span className="text-red-500">*</span></Label>
                <select className={SEL} value={provinceId} onChange={e => onProvinceChange(e.target.value)}>
                  <option value="">-- เลือกจังหวัด --</option>
                  {provinces.map(p => <option key={p.provinceId} value={p.provinceId}>{p.nameTh}</option>)}
                </select>
              </div>
            )}

            {/* Amphur — ADMIN + PROVINCE */}
            {(role === "ADMIN" || role === "PROVINCE") && (
              <div>
                <Label>อำเภอ <span className="text-red-500">*</span></Label>
                <select className={SEL} value={amphurId}
                  disabled={role === "ADMIN" && provinceId === ""}
                  onChange={e => onAmphurChange(e.target.value)}>
                  <option value="">-- เลือกอำเภอ --</option>
                  {amphursForDropdown.map(a => <option key={a.amphurId} value={a.amphurId}>{a.nameTh}</option>)}
                </select>
              </div>
            )}

            {/* Tambon — ADMIN + PROVINCE + AMPHUR */}
            {(role === "ADMIN" || role === "PROVINCE" || role === "AMPHUR") && (
              <div>
                <Label>ตำบล <span className="text-red-500">*</span></Label>
                <select className={SEL} value={tambonId}
                  disabled={(role === "ADMIN" || role === "PROVINCE") && amphurId === ""}
                  onChange={e => setTambonId(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">-- เลือกตำบล --</option>
                  {tambonsForDropdown.map(t => <option key={t.tambonId} value={t.tambonId}>{t.nameTh}</option>)}
                </select>
              </div>
            )}

            {/* TAMBON: show tambon name only (pre-filled, no edit) */}
            {role === "TAMBON" && (
              <div>
                <Label>ตำบล</Label>
                <div className="mt-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                  ตำบล ID: <strong>{scopeId}</strong> (พื้นที่ของบัญชีนี้)
                </div>
              </div>
            )}
          </div>

          {selectedTambon?.zipcode && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              รหัสไปรษณีย์: <strong>{selectedTambon.zipcode}</strong>
            </p>
          )}
        </ComponentCard>

        {/* Village info */}
        <ComponentCard title="ข้อมูลหมู่บ้าน">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>ชื่อหมู่บ้าน <span className="text-red-500">*</span></Label>
              <Input name="villageName" value={form.villageName} onChange={handleChange} type="text" placeholder="เช่น บ้านสามขา" />
            </div>
            <div>
              <Label>หมู่ที่</Label>
              <Input name="moo" value={form.moo} onChange={handleChange} type="text" placeholder="เช่น 5" />
            </div>
          </div>
        </ComponentCard>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            ยกเลิก
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </ComponentCard>
  </PermissionGuard>
  );
}
