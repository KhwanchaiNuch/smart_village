"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import { useCallback, useEffect, useRef, useState } from "react";
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

export default function CommunityIssueAdd() {
  const { village, loaded } = useVillage();
  const [role, setRole] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);

  // รูปภาพ — เก็บ File object ไว้ก่อน upload พร้อม submit
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
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
    } catch {
      // non-critical
    }
  }, [loaded, village]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | Add Community Issue";
    setRole(localStorage.getItem("role"));
    fetchHouseholds();
  }, [fetchHouseholds]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // เลือกไฟล์ → preview ทันที (ไม่ upload ก่อน)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    // revoke URL เก่าก่อนสร้างใหม่ (ป้องกัน memory leak)
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
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
      // ส่งเป็น multipart/form-data — fields + file ในคราวเดียว
      const fd = new FormData();
      if (form.householdId) fd.append("householdId", form.householdId);
      fd.append("area",         form.area);
      fd.append("issueType",    form.issueType);
      fd.append("severity",     form.severity);
      fd.append("status",       form.status);
      if (form.owner)          fd.append("owner",          form.owner);
      if (form.impactPeople)   fd.append("impactPeople",   form.impactPeople);
      if (form.budgetEstimate) fd.append("budgetEstimate", form.budgetEstimate);
      if (form.dueDate)        fd.append("dueDate",        form.dueDate);
      if (form.remark)         fd.append("remark",         form.remark);
      // villageId สำหรับ backend สร้าง folder hierarchy
      const vid = village?.villageId;
      if (vid) fd.append("villageId", String(vid));
      // แนบไฟล์ (ถ้ามี)
      if (imageFile) fd.append("file", imageFile);

      await axios.post("/community-issues/add", fd);

      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1800, showConfirmButton: false });
      window.location.href = "/communityissue";
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

  const sevColors: Record<string, string> = {
    "1": "text-green-600", "2": "text-lime-600", "3": "text-yellow-600",
    "4": "text-red-600", "5": "text-purple-700",
  };
  const sevLabels: Record<string, string> = {
    "1": "1 – น้อยมาก", "2": "2 – น้อย", "3": "3 – ปานกลาง",
    "4": "4 – มาก", "5": "5 – วิกฤต",
  };

  return (
    <PermissionGuard menuUrl="/communityissue" action="add">
    <ComponentCard title="แจ้งปัญหาชุมชน (Add Community Issue)">
      {/* Village context banner */}
      {loaded && village && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          บันทึกสำหรับ: <strong className="ml-1">{village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}</strong>
        </div>
      )}
      {loaded && !village && role === "ADMIN" && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-sm text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          ยังไม่ได้เลือกหมู่บ้าน — กรุณาเลือกหมู่บ้านจากแถบด้านบนก่อนเพิ่มข้อมูล
        </div>
      )}
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>พื้นที่/บริเวณ <span className="text-red-500">*</span></Label>
          <Input
            name="area"
            value={form.area}
            onChange={handleChange}
            type="text"
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
            {["1","2","3","4","5"].map((n) => (
              <option key={n} value={n} className={sevColors[n]}>{sevLabels[n]}</option>
            ))}
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
          <DatePicker
            id="dueDate"
            placeholder="เลือกวันกำหนดเสร็จ"
            onChange={(_, d) => setForm((p) => ({ ...p, dueDate: d }))}
          />
        </div>
      </div>

      {/* Remark */}
      <div>
        <Label>หมายเหตุ / รายละเอียดเพิ่มเติม</Label>
        <TextArea value={form.remark} onChange={(v) => setForm((p) => ({ ...p, remark: v }))} rows={3} placeholder="อธิบายปัญหาเพิ่มเติม..." />
      </div>

      {/* Image upload — preview local, upload พร้อม submit */}
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
              <p className="mt-2 text-center text-xs text-gray-500">
                {imageFile?.name} ({((imageFile?.size ?? 0) / 1024).toFixed(0)} KB)
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
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? "กำลังบันทึก..." : "แจ้งปัญหา"}
        </button>
        <a href="/communityissue" className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 font-medium">
          ยกเลิก
        </a>
      </div>
    </ComponentCard>
  </PermissionGuard>
  );
}
