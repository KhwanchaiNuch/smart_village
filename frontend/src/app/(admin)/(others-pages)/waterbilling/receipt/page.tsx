"use client"
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";
import { usePermission } from "@/context/PermissionContext";

interface WaterPaymentDetail {
  paymentId: number;
  billId: number;
  receiptNo: string | null;
  paidAmount: number;
  paidDate: string;
  paymentMethod: string | null;
  remark: string | null;
  bill: {
    billId: number;
    billingPeriod: string;
    meterNo: string | null;
    previousReading: number;
    currentReading: number;
    unitsUsed: number;
    ratePerUnit: number;
    amount: number;
    invoiceNo: string | null;
    houseNo: string | null;
    moo: string | null;
  } | null;
}

const MONTH_NAMES = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

function formatDateThai(d: string | null) {
  if (!d) return "-";
  const date = new Date(d);
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function formatPeriodThai(period: string) {
  if (!period) return "-";
  const [y, m] = period.split("-");
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${parseInt(y, 10) + 543}`;
}

function money(n: number) {
  return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

function methodLabel(m: string | null) {
  if (m === "CASH") return "เงินสด";
  if (m === "TRANSFER") return "โอนเงิน";
  if (m === "OTHER") return "อื่น ๆ";
  return "-";
}

function ReceiptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { canDelete } = usePermission();
  const paymentId = searchParams.get("id") ?? "";
  const billId = searchParams.get("billId") ?? "";
  const [payment, setPayment] = useState<WaterPaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [voiding, setVoiding] = useState(false);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | ใบเสร็จรับเงินค่าน้ำ";
    if (!paymentId && !billId) return;
    (async () => {
      try {
        setLoading(true);
        if (paymentId) {
          const res = await axios.get<WaterPaymentDetail>(`/water-payments/${paymentId}`);
          setPayment(res.data);
        } else {
          const res = await axios.get<WaterPaymentDetail[]>(`/water-payments/by-bill/${billId}`);
          setPayment(res.data.length > 0 ? res.data[res.data.length - 1] : null);
        }
      } catch {
        Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
      } finally {
        setLoading(false);
      }
    })();
  }, [paymentId, billId]);

  if (!paymentId && !billId) return <p className="p-6 text-gray-500">ไม่พบเลขที่บิลหรือใบเสร็จ</p>;
  if (loading) return <p className="p-6 text-gray-500">กำลังโหลด...</p>;
  if (!payment || !payment.bill) return <p className="p-6 text-gray-500">ไม่พบข้อมูลการชำระเงินของบิลนี้</p>;

  const bill = payment.bill;

  const handleVoid = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยกเลิกการชำระเงินนี้?",
      text: "บิลจะปรับยอดคงเหลือกลับ และใบเสร็จนี้จะใช้ไม่ได้อีกต่อไป",
      showCancelButton: true,
      confirmButtonText: "ใช่, ยกเลิกการชำระ",
      cancelButtonText: "ไม่ใช่",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    setVoiding(true);
    try {
      await axios.delete(`/water-payments/${payment.paymentId}`);
      await Swal.fire({ icon: "success", title: "ยกเลิกการชำระสำเร็จ", timer: 1500, showConfirmButton: false });
      router.push("/waterbilling");
    } catch {
      Swal.fire({ icon: "error", title: "ยกเลิกไม่สำเร็จ" });
    } finally {
      setVoiding(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; top: 0; left: 0; width: 100%; padding: 0; margin: 0; }
        }
      `}</style>

      <div className="mb-4 flex items-center justify-between print:hidden">
        <button onClick={() => router.push("/waterbilling")} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
          ← กลับ
        </button>
        <div className="flex gap-2">
          {canDelete("/waterbilling") && (
            <button onClick={handleVoid} disabled={voiding} className="rounded-lg border border-red-500 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10">
              {voiding ? "กำลังยกเลิก..." : "ยกเลิกการชำระ"}
            </button>
          )}
          <button onClick={() => window.print()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>

      <div className="print-area mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 text-gray-800 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white print:border-0 print:rounded-none print:p-6 print:text-black print:bg-white">
        <div className="mb-6 flex items-start justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl font-bold">ใบเสร็จรับเงินค่าน้ำประปา</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Water Bill Receipt</p>
          </div>
          <div className="text-right text-sm">
            <p>เลขที่ใบเสร็จ: <span className="font-medium">{payment.receiptNo ?? "-"}</span></p>
            <p>อ้างอิงใบแจ้งหนี้: {bill.invoiceNo ?? "-"}</p>
            <p>วันที่ชำระ: {formatDateThai(payment.paidDate)}</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 print:text-gray-600">ได้รับเงินจาก</p>
            <p className="font-medium">บ้านเลขที่ {bill.houseNo || "-"}{bill.moo ? ` หมู่ ${bill.moo}` : ""}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 dark:text-gray-400 print:text-gray-600">งวดประจำเดือน</p>
            <p className="font-medium">{formatPeriodThai(bill.billingPeriod)}</p>
          </div>
        </div>

        <table className="mb-6 w-full text-sm border-collapse">
          <thead>
            <tr className="border-y border-gray-300 bg-gray-50 dark:bg-gray-800 print:bg-gray-100">
              <th className="py-2 px-2 text-left">รายการ</th>
              <th className="py-2 px-2 text-right">หน่วยที่ใช้</th>
              <th className="py-2 px-2 text-right">อัตรา/หน่วย</th>
              <th className="py-2 px-2 text-right">ยอดบิลรวม</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 px-2">ค่าน้ำประปา{bill.meterNo ? ` (มิเตอร์เลขที่ ${bill.meterNo})` : ""}</td>
              <td className="py-2 px-2 text-right">{Number(bill.unitsUsed).toLocaleString("th-TH")}</td>
              <td className="py-2 px-2 text-right">{money(bill.ratePerUnit)}</td>
              <td className="py-2 px-2 text-right">{money(bill.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-6 flex justify-end">
          <div className="w-64 rounded-lg border border-gray-300 p-3 text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">ชำระโดย: {methodLabel(payment.paymentMethod)}</p>
            <p className="text-2xl font-bold">{money(payment.paidAmount)} บาท</p>
            <p className="text-xs text-gray-400 mt-1">รับชำระครั้งนี้ (อาจไม่ใช่ยอดเต็มของบิล หากมีการชำระหลายงวด)</p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 text-center text-sm">
          <div>
            <div className="mb-10">&nbsp;</div>
            <p className="border-t border-gray-400 pt-1">ผู้ชำระเงิน</p>
          </div>
          <div>
            <div className="mb-10">&nbsp;</div>
            <p className="border-t border-gray-400 pt-1">ผู้รับเงิน</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function WaterBillReceipt() {
  return (
    <PermissionGuard menuUrl="/waterbilling">
      <Suspense fallback={<p className="p-6 text-gray-500">กำลังโหลด...</p>}>
        <ReceiptContent />
      </Suspense>
    </PermissionGuard>
  );
}
