"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

type FormErrors = Partial<Record<string, string>>;

const RESOURCE_TYPES = [
  "แหล่งน้ำ", "ป่าไม้", "ที่ดิน", "วัด/ศาสนสถาน",
  "โรงเรียน", "สถานพยาบาล", "ตลาด/ร้านค้า", "สิ่งก่อสร้าง", "อื่น ๆ",
];

function VillageResourceEditContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    resourceId: "", villageCode: "", resourceType: "",
    resourceName: "", description: "", gpsLat: "", gpsLng: "",
  });

  useEffect(() => {
    document.title = "Smart Village | แก้ไขทรัพยากรชุมชน";
    if (!id) return;
    axios.get(`/village-resources/${id}`)
      .then((res) => {
        const d = res.data;
        setForm({
          resourceId: d.resourceId?.toString() || "",
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>รหัสหมู่บ้าน (Village Code)</Label>
          <Input name="villageCode" value={form.villageCode} onChange={handleChange}
            type="text" placeholder="เช่น M001, VLG-001" />
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
          <a href={`https://maps.google.com/?q=${form.gpsLat},${form.gpsLng}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            ตรวจสอบพิกัดบน Google Maps
          </a>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={handleSubmit} disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <a href="/villageresource" className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 font-medium">
          ยกเลิก
        </a>
      </div>
    </ComponentCard>
  );
}

export default function VillageResourceEdit() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VillageResourceEditContent />
    </Suspense>
  );
}
