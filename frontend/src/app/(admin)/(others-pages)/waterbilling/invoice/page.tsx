"use client"
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

interface WaterBillDetail {
  billId: number;
  householdId: number;
  billingPeriod: string;
  meterNo: string | null;
  previousReading: number;
  currentReading: number;
  unitsUsed: number;
  ratePerUnit: number;
  amount: number;
  amountPaid: number;
  balance: number;
  invoiceNo: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  status: string;
  houseNo: string | null;
  moo: string | null;
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

function InvoiceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") ?? "";
  const [bill, setBill] = useState<WaterBillDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | ใบแจ้งหนี้ค่าน้ำ";
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get<WaterBillDetail>(`/water-bills/${id}`);
        setBill(res.data);
      } catch {
        Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!id) return <p className="p-6 text-gray-500">ไม่พบเลขที่บิล</p>;
  if (loading) return <p className="p-6 text-gray-500">กำลังโหลด...</p>;
  if (!bill) return <p className="p-6 text-gray-500">ไม่พบข้อมูลบิล</p>;

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
          {bill.status === "UNPAID" && (
            <button onClick={() => router.push(`/waterbilling/pay?billId=${bill.billId}`)} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
              รับชำระเงิน
            </button>
          )}
          <button onClick={() => window.print()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            พิมพ์ใบแจ้งหนี้
          </button>
        </div>
      </div>

      <div className="print-area mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 text-gray-800 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white print:border-0 print:rounded-none print:p-6 print:text-black print:bg-white">
        <div className="mb-6 flex items-start justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl font-bold">ใบแจ้งหนี้ค่าน้ำประปา</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Water Bill Invoice</p>
          </div>
          <div className="text-right text-sm">
            <p>เลขที่ใบแจ้งหนี้: <span className="font-medium">{bill.invoiceNo ?? "-"}</span></p>
            <p>วันที่ออกใบแจ้งหนี้: {formatDateThai(bill.invoiceDate)}</p>
            <p>กำหนดชำระ: {formatDateThai(bill.dueDate)}</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 print:text-gray-600">เรียกเก็บจาก</p>
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
              <th className="py-2 px-2 text-right">เลขมิเตอร์ครั้งก่อน</th>
              <th className="py-2 px-2 text-right">เลขมิเตอร์ปัจจุบัน</th>
              <th className="py-2 px-2 text-right">หน่วยที่ใช้</th>
              <th className="py-2 px-2 text-right">อัตรา/หน่วย</th>
              <th className="py-2 px-2 text-right">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 px-2">ค่าน้ำประปา{bill.meterNo ? ` (มิเตอร์เลขที่ ${bill.meterNo})` : ""}</td>
              <td className="py-2 px-2 text-right">{Number(bill.previousReading).toLocaleString("th-TH")}</td>
              <td className="py-2 px-2 text-right">{Number(bill.currentReading).toLocaleString("th-TH")}</td>
              <td className="py-2 px-2 text-right">{Number(bill.unitsUsed).toLocaleString("th-TH")}</td>
              <td className="py-2 px-2 text-right">{money(bill.ratePerUnit)}</td>
              <td className="py-2 px-2 text-right">{money(bill.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-6 flex justify-end">
          <div className="w-64 rounded-lg border border-gray-300 p-3 text-right">
            {bill.amountPaid > 0 && bill.status !== "PAID" ? (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">ยอดบิลรวม {money(bill.amount)} บาท — ชำระแล้ว {money(bill.amountPaid)} บาท</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600 mt-1">ยอดคงเหลือที่ต้องชำระ</p>
                <p className="text-2xl font-bold">{money(bill.balance)} บาท</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">
                  {bill.status === "PAID" ? "ชำระครบแล้ว" : "ยอดที่ต้องชำระ"}
                </p>
                <p className="text-2xl font-bold">{money(bill.amount)} บาท</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 text-center text-sm">
          <div>
            <div className="mb-10">&nbsp;</div>
            <p className="border-t border-gray-400 pt-1">ผู้จัดทำ / ผู้ออกใบแจ้งหนี้</p>
          </div>
          <div>
            <div className="mb-10">&nbsp;</div>
            <p className="border-t border-gray-400 pt-1">ผู้รับเรื่อง</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function WaterBillInvoice() {
  return (
    <PermissionGuard menuUrl="/waterbilling">
      <Suspense fallback={<p className="p-6 text-gray-500">กำลังโหลด...</p>}>
        <InvoiceContent />
      </Suspense>
    </PermissionGuard>
  );
}
