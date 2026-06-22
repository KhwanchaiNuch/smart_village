"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

type FormErrors = Partial<Record<string, string>>;

const RESOURCE_TYPES = [
  "แหล่งน้ำ", "ป่าไม้", "ที่ดิน", "วัด/ศาสนสถาน",
  "โรงเรียน", "สถานพยาบาล", "ตลาด/ร้านค้า", "สิ่งก่อสร้าง", "อื่น ๆ",
];

interface Village { villageId: number; villageName: string; moo: string | null; }

function VillageResourceEditContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [form, setForm] = useState({
    resourceId: "", villageId: "", villageCode: "", resourceType: "",
    resourceName: "", description: "", gpsLat: "", gpsLng: "",
  });

  useEffect(() => {
    document.title = "Smart Village | แก้ไขทรัพยากรชุมชน";
    const r = localStorage.getItem("role");
    setRole(r);
    if (r !== "VILLAGE" && r !== "VIEWER") {
      axios.get<Village[]>("/villages/scoped").then(res => setVillages(res.data)).catch(() => {});
    }
    if (!id) return;
    axios.get(`/village-resources/${id}`)
      .then((res) => {
        const d = res.data;
        setForm({
          resourceId: d.resourceId?.toString() || "",
          villageId: d.villageId != null ? String(d.villageId) : "",
          villageCode: d.villageCode || "",
          resourceType: d.resourceType || "",
          resourceName: d.resourceName || "",
          description: d.description || "",
          gpsLat: d.gpsLat != null ? String(d.gpsLat) : "",
          gpsLng: d.gpsLng != null ? String(d.gpsLng) : "",
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
    if (!form.resourceName.trim()) e.resourceName = "กรุณาระบุชื่อทรัพยากร";
    if (!form.resourceType) e.resourceType = "กรุณาเลือกประเภททรัพยากร";
    if (form.gpsLat && isNaN(Number(form.gpsLat))) e.gpsLat = "ต้องเป็นตัวเลข";
    if (form.gpsLng && isNaN(Number(form.gpsLng))) e.gpsLng = "ต้องเป็นตัวเลข";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await axios.post("/village-resources/edit", {
        resourceId: parseInt(form.resourceId),
        villageId: form.villageId ? Number(form.villageId) : null,
        villageCode: form.villageCode || null,
        resourceType: form.resourceType,
        resourceName: form.resourceName,
        description: form.description || null,
        gpsLat: form.gpsLat ? parseFloat(form.gpsLat) : null,
        gpsLng: form.gpsLng ? parseFloat(form.gpsLng) : null,
      });
      await Swal.fire({ icon: "success", title: "อัปเดตสำเร็จ", timer: 1800, showConfirmButton: false });
      window.location.href = "/villageresource";
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
    <ComponentCard title="แก้ไขทรัพยากรชุมชน">
      <input type="hidden" value={form.resourceId} />

      {/* Admin: แสดง/เปลี่ยน village */}
      {role === "ADMIN" && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <Label>หมู่บ้านที่ทรัพยากรนี้อยู่</Label>
          <select
            value={form.villageId}
            onChange={e => setForm(p => ({ ...p, villageId: e.target.value }))}
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
          <Label>ชื่อทรัพยากร <span className="text-red-500">*</span></Label>
          <Input name="resourceName" value={form.resourceName} onChange={handleChange}
            type="text" placeholder="เช่น บึงน้ำสาธารณะ, วัดป่าเขาแก้ว"
            className={errors.resourceName ? "border-red-400" : ""} />
          {errors.resourceName && <p className="mt-1 text-xs text-red-500">{errors.resourceName}</p>}
        </div>
        <div>
          <Label>ประเภททรัพยากร <span className="text-red-500">*</span></Label>
          <select name="resourceType" value={form.resourceType} onChange={handleChange} className={selectClass("resourceType")}>
            <option value="">-- เลือกประเภท --</option>
            {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.resourceType && <p className="mt-1 text-xs text-red-500">{errors.resourceType}</p>}
        </div>
      </div>

      <div>
        <Label>รายละเอียด</Label>
        <TextArea value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))}
          rows={3} placeholder="อธิบายทรัพยากร ประโยชน์ ลักษณะเด่น หรือข้อมูลเพิ่มเติม..." />
      </div>

      <div className="space-y-2">
        <Label>พิกัด GPS (ถ้ามี)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Latitude (ละติจูด)</p>
            <Input name="gpsLat" value={form.gpsLat} onChange={handleChange}
              type="text" placeholder="เช่น 15.870032"
              className={errors.gpsLat ? "border-red-400" : ""} />
            {errors.gpsLat && <p className="mt-1 text-xs text-red-500">{errors.gpsLat}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Longitude (ลองจิจูด)</p>
            <Input name="gpsLng" value={form.gpsLng} onChange={handleChange}
              type="text" placeholder="เช่น 100.992541"
              className={errors.gpsLng ? "border-red-400" : ""} />
            {errors.gpsLng && <p className="mt-1 text-xs text-red-500">{errors.gpsLng}</p>}
          </div>
        </div>
        {form.gpsLat && form.gpsLng && !errors.gpsLat && !errors.gpsLng && (
          <a
            href={`https://www.google.com/maps?q=${form.gpsLat},${form.gpsLng}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:underline"
          >
            ดูบน Google Maps
          </a>
        )}
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
          {saving ? "กำลังอัปเดต..." : "บันทึกการแก้ไข"}
        </button>
      </div>
    </ComponentCard>
  );
}

export default function VillageResourceEdit() {
  return (
        <PermissionGuard menuUrl="/villageresource" action="edit">
<Suspense fallback={<div className="p-6">กำลังโหลด...</div>}>
      <VillageResourceEditContent />
    </Suspense>
    </PermissionGuard>

  );
}
