"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

type FormErrors = Partial<Record<string, string>>;

interface WaterBillDetail {
  billId: number;
  houseNo: string | null;
  moo: string | null;
  billingPeriod: string;
  previousReading: number;
  currentReading: number;
  ratePerUnit: number;
  meterNo: string | null;
  dueDate: string | null;
  remark: string | null;
  status: string;
}

function EditContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") ?? "";
  const [bill, setBill] = useState<WaterBillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState({ currentReading: "", meterNo: "", dueDate: "", remark: "" });

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | แก้ไขบิลค่าน้ำ";
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get<WaterBillDetail>(`/water-bills/${id}`);
        setBill(res.data);
        setForm({
          currentReading: String(res.data.currentReading),
          meterNo: res.data.meterNo ?? "",
          dueDate: res.data.dueDate ?? "",
          remark: res.data.remark ?? "",
        });
      } catch {
        Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const currentReadingNum = parseFloat(form.currentReading || "0");
  const unitsUsed = bill ? Math.max(0, currentReadingNum - bill.previousReading) : 0;
  const estimatedAmount = bill ? unitsUsed * bill.ratePerUnit : 0;

  const handleSubmit = async () => {
    if (!bill) return;
    const e: FormErrors = {};
    if (!form.currentReading) e.currentReading = "กรุณาระบุเลขมิเตอร์ปัจจุบัน";
    else if (parseFloat(form.currentReading) < bill.previousReading) e.currentReading = `ต้องไม่น้อยกว่าเลขมิเตอร์ครั้งก่อน (${bill.previousReading})`;
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      await axios.post("/water-bills/edit", {
        billId: bill.billId,
        currentReading: parseFloat(form.currentReading),
        meterNo: form.meterNo || null,
        dueDate: form.dueDate || null,
        remark: form.remark || null,
      });
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false });
      router.push("/waterbilling");
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: message || "เกิดข้อผิดพลาด" });
    } finally {
      setSaving(false);
    }
  };

  if (!id) return <p className="p-6 text-gray-500">ไม่พบเลขที่บิล</p>;
  if (loading) return <p className="p-6 text-gray-500">กำลังโหลด...</p>;
  if (!bill) return <p className="p-6 text-gray-500">ไม่พบข้อมูลบิล</p>;

  if (bill.status !== "UNPAID") {
    return (
      <ComponentCard title="แก้ไขบิลค่าน้ำ">
        <p className="text-gray-500">บิลนี้ถูกชำระแล้ว ไม่สามารถแก้ไขได้</p>
      </ComponentCard>
    );
  }

  const inputClass = (field: string) =>
    `mt-1 w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 dark:text-gray-300 ${
      errors[field]
        ? "border-red-400 focus:border-red-400 focus:ring-red-400 text-red-700"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-700 dark:border-gray-600"
    }`;

  return (
    <ComponentCard title="แก้ไขบิลค่าน้ำประปา">
      <div className="mb-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-sm">
        <p>บ้านเลขที่ {bill.houseNo || "-"}{bill.moo ? ` หมู่ ${bill.moo}` : ""} — งวด {bill.billingPeriod}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label>เลขมิเตอร์ครั้งก่อน</Label>
          <input value={bill.previousReading} readOnly className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 dark:bg-gray-800 dark:border-gray-700" />
        </div>
        <div>
          <Label>เลขมิเตอร์ปัจจุบัน <span className="text-red-500">*</span></Label>
          <input name="currentReading" value={form.currentReading} onChange={handleChange} type="number" step="0.01" className={inputClass("currentReading")} />
          {errors.currentReading && <p className="mt-1 text-xs text-red-500">{errors.currentReading}</p>}
        </div>
        <div>
          <Label>เลขที่มิเตอร์ (ถ้ามี)</Label>
          <input name="meterNo" value={form.meterNo} onChange={handleChange} className={inputClass("meterNo")} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>กำหนดชำระ</Label>
          <input name="dueDate" value={form.dueDate} onChange={handleChange} type="date" className={inputClass("dueDate")} />
        </div>
        <div>
          <Label>หมายเหตุ</Label>
          <input name="remark" value={form.remark} onChange={handleChange} className={inputClass("remark")} />
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-4 text-sm">
        <p>อัตราค่าน้ำ: <span className="font-medium">{Number(bill.ratePerUnit).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท/หน่วย</span></p>
        <p>หน่วยที่ใช้: <span className="font-medium">{unitsUsed.toLocaleString("th-TH")} หน่วย</span></p>
        <p>จำนวนเงิน: <span className="font-semibold text-blue-700 dark:text-blue-300">{estimatedAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span></p>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
          ยกเลิก
        </button>
        <button onClick={handleSubmit} disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </div>
    </ComponentCard>
  );
}

export default function WaterBillEdit() {
  return (
    <PermissionGuard menuUrl="/waterbilling" action="edit">
      <Suspense fallback={<p className="p-6 text-gray-500">กำลังโหลด...</p>}>
        <EditContent />
      </Suspense>
    </PermissionGuard>
  );
}
