"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

interface WaterBillDetail {
  billId: number;
  houseNo: string | null;
  moo: string | null;
  billingPeriod: string;
  amount: number;
  amountPaid: number;
  balance: number;
  status: string;
}

interface PriorPayment {
  paymentId: number;
  receiptNo: string | null;
  paidAmount: number;
  paidDate: string;
  paymentMethod: string | null;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function methodLabel(m: string | null) {
  if (m === "CASH") return "เงินสด";
  if (m === "TRANSFER") return "โอนเงิน";
  if (m === "OTHER") return "อื่น ๆ";
  return "-";
}

function PayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const billId = searchParams.get("billId") ?? "";
  const [bill, setBill] = useState<WaterBillDetail | null>(null);
  const [priorPayments, setPriorPayments] = useState<PriorPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    paidAmount: "",
    paidDate: todayStr(),
    paymentMethod: "CASH",
    remark: "",
  });

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | บันทึกรับชำระค่าน้ำ";
    if (!billId) return;
    (async () => {
      try {
        setLoading(true);
        const [billRes, payRes] = await Promise.all([
          axios.get<WaterBillDetail>(`/water-bills/${billId}`),
          axios.get<PriorPayment[]>(`/water-payments/by-bill/${billId}`),
        ]);
        setBill(billRes.data);
        setPriorPayments(payRes.data);
        setForm((p) => ({ ...p, paidAmount: String(billRes.data.balance) }));
      } catch {
        Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
      } finally {
        setLoading(false);
      }
    })();
  }, [billId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!bill) return;
    if (!form.paidAmount || Number(form.paidAmount) <= 0) {
      Swal.fire({ icon: "warning", title: "กรุณาระบุจำนวนเงินที่ชำระ" });
      return;
    }
    if (Number(form.paidAmount) > bill.balance) {
      Swal.fire({ icon: "warning", title: "จำนวนเงินเกินยอดคงเหลือ", text: `ยอดคงเหลือ ${bill.balance.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท` });
      return;
    }
    setSaving(true);
    try {
      await axios.post("/water-payments/add", {
        billId: bill.billId,
        paidAmount: parseFloat(form.paidAmount),
        paidDate: form.paidDate,
        paymentMethod: form.paymentMethod,
        remark: form.remark || null,
      });
      await Swal.fire({ icon: "success", title: "บันทึกรับชำระสำเร็จ", timer: 1500, showConfirmButton: false });
      router.push(`/waterbilling/receipt?billId=${bill.billId}`);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: message || "เกิดข้อผิดพลาด" });
    } finally {
      setSaving(false);
    }
  };

  if (!billId) return <p className="p-6 text-gray-500">ไม่พบเลขที่บิล</p>;
  if (loading) return <p className="p-6 text-gray-500">กำลังโหลด...</p>;
  if (!bill) return <p className="p-6 text-gray-500">ไม่พบข้อมูลบิล</p>;

  if (bill.status === "PAID") {
    return (
      <ComponentCard title="บันทึกรับชำระเงิน">
        <p className="text-gray-500">บิลนี้ถูกชำระครบแล้ว ไม่สามารถบันทึกการชำระเพิ่มได้</p>
      </ComponentCard>
    );
  }

  const inputClass = "mt-1 w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 dark:text-gray-300 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600";

  return (
    <ComponentCard title="บันทึกรับชำระเงินค่าน้ำ">
      <div className="mb-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-sm space-y-1">
        <p>บ้านเลขที่ {bill.houseNo || "-"}{bill.moo ? ` หมู่ ${bill.moo}` : ""}</p>
        <p>ยอดตามใบแจ้งหนี้: <span className="font-semibold">{Number(bill.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span></p>
        {bill.amountPaid > 0 && (
          <p>ชำระไปแล้ว: <span className="font-semibold text-green-600 dark:text-green-400">{Number(bill.amountPaid).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span></p>
        )}
        <p>ยอดคงเหลือที่ต้องชำระ: <span className="font-semibold text-red-600 dark:text-red-400">{Number(bill.balance).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span></p>
      </div>

      {priorPayments.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">ประวัติการชำระก่อนหน้า</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="py-1 px-2">วันที่</th>
                <th className="py-1 px-2 text-right">จำนวนเงิน</th>
                <th className="py-1 px-2">ช่องทาง</th>
                <th className="py-1 px-2">เลขที่ใบเสร็จ</th>
              </tr>
            </thead>
            <tbody>
              {priorPayments.map((p) => (
                <tr key={p.paymentId} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="py-1 px-2">{p.paidDate}</td>
                  <td className="py-1 px-2 text-right">{Number(p.paidAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-2">{methodLabel(p.paymentMethod)}</td>
                  <td className="py-1 px-2">{p.receiptNo || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>จำนวนเงินที่ชำระ (บาท) <span className="text-red-500">*</span></Label>
          <input name="paidAmount" value={form.paidAmount} onChange={handleChange} type="number" step="0.01" className={inputClass} />
        </div>
        <div>
          <Label>วันที่ชำระ <span className="text-red-500">*</span></Label>
          <input name="paidDate" value={form.paidDate} onChange={handleChange} type="date" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>ช่องทางการชำระ</Label>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className={inputClass}>
            <option value="CASH">เงินสด</option>
            <option value="TRANSFER">โอนเงิน</option>
            <option value="OTHER">อื่น ๆ</option>
          </select>
        </div>
        <div>
          <Label>หมายเหตุ</Label>
          <input name="remark" value={form.remark} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
          ยกเลิก
        </button>
        <button onClick={handleSubmit} disabled={saving} className="rounded-lg bg-green-600 px-5 py-2.5 text-sm text-white hover:bg-green-700 disabled:opacity-50">
          {saving ? "กำลังบันทึก..." : "บันทึกรับชำระและออกใบเสร็จ"}
        </button>
      </div>
    </ComponentCard>
  );
}

export default function WaterBillPay() {
  return (
    <PermissionGuard menuUrl="/waterbilling" action="edit">
      <Suspense fallback={<p className="p-6 text-gray-500">กำลังโหลด...</p>}>
        <PayContent />
      </Suspense>
    </PermissionGuard>
  );
}
