"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);
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
    try {
      const res = await axios.get<Household[]>("/households");
      setHouseholds(res.data);
    } catch {
      // non-critical
    }
  }, []);

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
      })
      .catch((err: any) =>
        Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message })
      );
  }, [id, fetchHouseholds]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
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
      await axios.post("/community-issues/edit", {
        id: parseInt(form.id),
        householdId: form.householdId ? parseInt(form.householdId) : null,
        area: form.area,
        issueType: form.issueType,
        severity: parseInt(form.severity),
        status: form.status,
        owner: form.owner || null,
        impactPeople: form.impactPeople ? parseInt(form.impactPeople) : null,
        budgetEstimate: form.budgetEstimate ? parseFloat(form.budgetEstimate) : null,
        dueDate: form.dueDate || null,
        remark: form.remark || null,
      });
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
              <option key={n} value={n}>{sevLabels[n]}</option>
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
            defaultDate={form.dueDate || undefined}
            onChange={(_, d) => setForm((p) => ({ ...p, dueDate: d }))}
          />
        </div>
        <div>{/* spacer */}</div>
      </div>

      {/* Remark */}
      <div>
        <Label>หมายเหตุ / รายละเอียดเพิ่มเติม</Label>
        <TextArea value={form.remark} onChange={(v) => setForm((p) => ({ ...p, remark: v }))} rows={3} placeholder="อธิบายปัญหาเพิ่มเติม..." />
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
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
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityIssueEditContent />
    </Suspense>
  );
}
