"use client"
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/smart_village/api").replace(/\/api$/, "");
function imgUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return API_BASE + url;
}
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";
import PermissionGuard from "@/components/common/PermissionGuard";

type FormErrors = Partial<Record<string, string>>;

interface Household {
  householdId: number;
  houseNo: string;
  moo: string | null;
}

const ISSUE_TYPES = [
  "โครงสร้างพื้นฐาน", "สิ่งแวดล้อม", "สังคม/ความปลอดภัย",
  "สุขภาพ", "เศรษฐกิจ", "การศึกษา", "อื่น ๆ",
];
const STATUSES = ["ยังไม่แก้", "กำลังทำ", "แก้แล้ว"];

const sevLabels: Record<string, string> = {
  "1": "1 – น้อยมาก", "2": "2 – น้อย", "3": "3 – ปานกลาง",
  "4": "4 – มาก", "5": "5 – วิกฤต",
};

function CommunityIssueEditContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { village, loaded } = useVillage();

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);

  // รูปภาพ
  const [imageFile, setImageFile]       = useState<File | null>(null);   // ไฟล์ใหม่ (ยังไม่ upload)
  const [imagePreview, setImagePreview] = useState<string>("");          // URL สำหรับแสดง
  const [imageRemoved, setImageRemoved] = useState(false);               // user กด ✕ ไปแล้ว
  const [objectUrl, setObjectUrl]       = useState<string>("");          // track object URL เพื่อ revoke
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    id: "",
    householdId: "",
    area: "",
    issueType: "",
    severity: "3",
    status: "ยังไม่แก้",
    owner: "",
    impactPeople: "",
    budgetEstimate: "",
    dueDate: "",
    remark: "",
  });

  const fetchHouseholds = useCallback(async () => {
    if (!loaded) return;
    try {
      const vid = village?.villageId;
      const res = await axios.get<Household[]>(vid ? `/households?villageId=${vid}` : "/households");
      setHouseholds(res.data);
    } catch { /* non-critical */ }
  }, [loaded, village]);

  useEffect(() => {
    document.title = "Smart Village | Edit Community Issue";
    fetchHouseholds();
    if (!id) return;
    axios.get(`/community-issues/${id}`)
      .then((res) => {
        const d = res.data;
        setForm({
          id: d.id?.toString() || "",
          householdId: d.householdId?.toString() || "",
          area: d.area || "",
          issueType: d.issueType || "",
          severity: d.severity?.toString() || "3",
          status: d.status || "ยังไม่แก้",
          owner: d.owner || "",
          impactPeople: d.impactPeople?.toString() || "",
          budgetEstimate: d.budgetEstimate?.toString() || "",
          dueDate: d.dueDate || "",
          remark: d.remark || "",
        });
        if (d.imageUrl) setImagePreview(imgUrl(d.imageUrl));
      })
      .catch((err: any) =>
        Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message })
      );
  }, [id, fetchHouseholds]);

  // cleanup object URL เมื่อ unmount
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // revoke URL เก่าถ้ามี
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setImageFile(file);
    setImagePreview(url);
    setImageRemoved(false);
  };

  const clearImage = () => {
    if (objectUrl) { URL.revokeObjectURL(objectUrl); setObjectUrl(""); }
    setImageFile(null);
    setImagePreview("");
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.area.trim()) e.area = "กรุณาระบุพื้นที่/บริเวณ";
    if (!form.issueType) e.issueType = "กรุณาเลือกประเภทปัญหา";
    if (!form.severity) e.severity = "กรุณาเลือกระดับความรุนแรง";
    if (!form.status) e.status = "กรุณาเลือกสถานะ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("id",        form.id);
      fd.append("area",      form.area);
      fd.append("issueType", form.issueType);
      fd.append("severity",  form.severity);
      fd.append("status",    form.status);
      if (form.householdId)   fd.append("householdId",   form.householdId);
      if (form.owner)         fd.append("owner",         form.owner);
      if (form.impactPeople)  fd.append("impactPeople",  form.impactPeople);
      if (form.budgetEstimate)fd.append("budgetEstimate",form.budgetEstimate);
      if (form.dueDate)       fd.append("dueDate",       form.dueDate);
      if (form.remark)        fd.append("remark",        form.remark);
      // villageId สำหรับ backend สร้าง folder path
      const vid = village?.villageId;
      if (vid) fd.append("villageId", String(vid));
      // ไฟล์ใหม่ หรือ flag ลบรูป
      if (imageFile)        fd.append("file", imageFile);
      else if (imageRemoved) fd.append("removeImage", "true");

      await axios.post("/community-issues/edit", fd);
      await Swal.fire({ icon: "success", title: "อัปเดตสำเร็จ", timer: 1800, showConfirmButton: false });
      window.location.href = "/communityissue";
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
    <ComponentCard title="แก้ไขปัญหาชุมชน (Edit Community Issue)">
      <input type="hidden" value={form.id} />

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>พื้นที่/บริเวณ <span className="text-red-500">*</span></Label>
          <Input name="area" value={form.area} onChange={handleChange} type="text"
            placeholder="เช่น ถนนสายหลัก หมู่ 3"
            className={errors.area ? "border-red-400" : ""}
          />
          {errors.area && <p className="mt-1 text-xs text-red-500">{errors.area}</p>}
        </div>
        <div>
          <Label>ประเภทปัญหา <span className="text-red-500">*</span></Label>
          <select name="issueType" value={form.issueType} onChange={handleChange} className={selectClass("issueType")}>
            <option value="">-- เลือกประเภทปัญหา --</option>
            {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.issueType && <p className="mt-1 text-xs text-red-500">{errors.issueType}</p>}
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label>ระดับความรุนแรง <span className="text-red-500">*</span></Label>
          <select name="severity" value={form.severity} onChange={handleChange} className={selectClass("severity")}>
            <option value="">-- เลือกระดับ --</option>
            {["1","2","3","4","5"].map((n) => <option key={n} value={n}>{sevLabels[n]}</option>)}
          </select>
          {errors.severity && <p className="mt-1 text-xs text-red-500">{errors.severity}</p>}
        </div>
        <div>
          <Label>สถานะ <span className="text-red-500">*</span></Label>
          <select name="status" value={form.status} onChange={handleChange} className={selectClass("status")}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
        </div>
        <div>
          <Label>ครัวเรือนที่เกี่ยวข้อง (ถ้ามี)</Label>
          <select name="householdId" value={form.householdId} onChange={handleChange} className={selectClass("householdId")}>
            <option value="">-- ไม่ระบุ --</option>
            {households.map((h) => (
              <option key={h.householdId} value={h.householdId}>บ้านเลขที่ {h.houseNo}{h.moo ? ` หมู่ ${h.moo}` : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label>ผู้รับผิดชอบ</Label>
          <Input name="owner" value={form.owner} onChange={handleChange} type="text" placeholder="เช่น อบต., ผู้ใหญ่บ้าน" />
        </div>
        <div>
          <Label>จำนวนผู้ได้รับผลกระทบ (คน)</Label>
          <Input name="impactPeople" value={form.impactPeople} onChange={handleChange} type="number" placeholder="0" />
        </div>
        <div>
          <Label>งบประมาณโดยประมาณ (บาท)</Label>
          <Input name="budgetEstimate" value={form.budgetEstimate} onChange={handleChange} type="number" placeholder="0.00" />
        </div>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>กำหนดแก้ไขภายใน</Label>
          <DatePicker id="dueDate" placeholder="เลือกวันกำหนดเสร็จ"
            defaultDate={form.dueDate || undefined}
            onChange={(_, d) => setForm((p) => ({ ...p, dueDate: d }))}
          />
        </div>
      </div>

      {/* Remark */}
      <div>
        <Label>หมายเหตุ / รายละเอียดเพิ่มเติม</Label>
        <TextArea value={form.remark} onChange={(v) => setForm((p) => ({ ...p, remark: v }))} rows={3} placeholder="อธิบายปัญหาเพิ่มเติม..." />
      </div>

      {/* Image */}
      <div>
        <Label>รูปภาพประกอบ (ถ้ามี)</Label>
        <div
          className="mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <div className="relative w-full max-w-xs">
              <img src={imagePreview} alt="preview" className="w-full rounded-lg object-contain max-h-48" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearImage(); }}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >✕</button>
              <p className="mt-2 text-xs text-center text-gray-400">
                {imageFile ? `${imageFile.name} (${((imageFile.size) / 1024).toFixed(0)} KB)` : "คลิกเพื่อเปลี่ยนรูป"}
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 mx-auto mb-2 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <p className="text-sm">คลิกเพื่อเลือกรูปภาพ</p>
              <p className="text-xs mt-1">PNG, JPG, WEBP ไม่เกิน 10 MB</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={handleSubmit} disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <a href="/communityissue" className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 font-medium">
          ยกเลิก
        </a>
      </div>
    </ComponentCard>
  );

}

export default function CommunityIssueEdit() {
  return (
        <PermissionGuard menuUrl="/communityissue" action="edit">
<Suspense fallback={<div>Loading...</div>}>
      <CommunityIssueEditContent />
    </Suspense>
    </PermissionGuard>

  );
}