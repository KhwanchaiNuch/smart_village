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
interface Amphur { amphurId: number; provinceId: number; nameTh: string; }
interface Tambon { tambonId: number; amphurId: number; nameTh: string; zipcode: string | null; }

export default function VillageAdd() {
  const router = useRouter();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [allAmphurs, setAllAmphurs] = useState<Amphur[]>([]);
  const [allTambons, setAllTambons] = useState<Tambon[]>([]);

  const [provinceId, setProvinceId] = useState<number | "">("");
  const [amphurId, setAmphurId] = useState<number | "">("");
  const [tambonId, setTambonId] = useState<number | "">("");
  const [form, setForm] = useState({ villageName: "", moo: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Smart Village | เพิ่มหมู่บ้าน";
    axios.get<Province[]>("/provinces")
      .then((r) => setProvinces([...r.data].sort((a, b) => a.provinceId - b.provinceId)))
      .catch(() => {});
    axios.get<Amphur[]>("/amphurs/all").then((r) => setAllAmphurs(r.data)).catch(() => {});
    axios.get<Tambon[]>("/tambons/all").then((r) => setAllTambons(r.data)).catch(() => {});
  }, []);

  // cascade
  const amphursForDropdown = provinceId !== "" ? allAmphurs.filter(a => a.provinceId === provinceId) : [];
  const tambonsForDropdown = amphurId !== "" ? allTambons.filter(t => t.amphurId === amphurId) : [];

  // reset chain
  useEffect(() => { setAmphurId(""); setTambonId(""); }, [provinceId]);
  useEffect(() => { setTambonId(""); }, [amphurId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const selectedTambon = allTambons.find(t => t.tambonId === tambonId);

  const handleSubmit = async () => {
    if (provinceId === "" || amphurId === "" || tambonId === "") {
      Swal.fire({ icon: "warning", title: "กรุณาเลือกพื้นที่ให้ครบ", text: "ต้องระบุ จังหวัด / อำเภอ / ตำบล" });
      return;
    }
    if (!form.villageName.trim()) {
      Swal.fire({ icon: "warning", title: "กรุณากรอกชื่อหมู่บ้าน" });
      return;
    }
    try {
      setLoading(true);
      await axios.post("/villages/add", {
        tambonId,
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

  const selCls = "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <PermissionGuard menuUrl="/village" action="add">
    <ComponentCard title="เพิ่มหมู่บ้าน">
      <div className="space-y-5">
        <ComponentCard title="ที่ตั้งของหมู่บ้าน">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label>จังหวัด <span className="text-red-500">*</span></Label>
              <select className={selCls} value={provinceId} onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">-- เลือกจังหวัด --</option>
                {provinces.map((p) => <option key={p.provinceId} value={p.provinceId}>{p.nameTh}</option>)}
              </select>
            </div>
            <div>
              <Label>อำเภอ <span className="text-red-500">*</span></Label>
              <select className={selCls} value={amphurId} disabled={provinceId === ""} onChange={(e) => setAmphurId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">-- เลือกอำเภอ --</option>
                {amphursForDropdown.map((a) => <option key={a.amphurId} value={a.amphurId}>{a.nameTh}</option>)}
              </select>
            </div>
            <div>
              <Label>ตำบล <span className="text-red-500">*</span></Label>
              <select className={selCls} value={tambonId} disabled={amphurId === ""} onChange={(e) => setTambonId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">-- เลือกตำบล --</option>
                {tambonsForDropdown.map((t) => <option key={t.tambonId} value={t.tambonId}>{t.nameTh}</option>)}
              </select>
            </div>
          </div>
          {selectedTambon?.zipcode && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              📮 รหัสไปรษณีย์: <strong>{selectedTambon.zipcode}</strong>
            </p>
          )}
        </ComponentCard>

        <ComponentCard title="ข้อมูลหมู่บ้าน">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>ชื่อหมู่บ้าน <span className="text-red-500">*</span></Label>
              <Input
                name="villageName"
                value={form.villageName}
                onChange={handleChange}
                type="text"
                placeholder="เช่น บ้านสามขา"
              />
            </div>
            <div>
              <Label>หมู่ที่</Label>
              <Input
                name="moo"
                value={form.moo}
                onChange={handleChange}
                type="text"
                placeholder="เช่น 5"
              />
            </div>
          </div>
        </ComponentCard>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </ComponentCard>
  </PermissionGuard>
  );
}
