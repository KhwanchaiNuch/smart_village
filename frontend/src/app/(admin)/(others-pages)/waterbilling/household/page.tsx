"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

interface BillRow {
  billId: number;
  billingPeriod: string;
  unitsUsed: number;
  amount: number;
  amountPaid: number;
  balance: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  overdue: boolean;
  invoiceNo: string | null;
  dueDate: string | null;
}

interface HouseholdHistory {
  household: { householdId: number; houseNo: string | null; moo: string | null };
  bills: BillRow[];
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
}

const MONTH_NAMES_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function formatPeriod(period: string) {
  if (!period) return "-";
  const [y, m] = period.split("-");
  return `${MONTH_NAMES_SHORT[parseInt(m, 10) - 1]} ${parseInt(y, 10) + 543}`;
}

function money(n: number) {
  return Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

function statusLabel(r: BillRow) {
  if (r.status === "PAID") return "ชำระแล้ว";
  if (r.overdue) return "ค้างชำระเกินกำหนด";
  if (r.status === "PARTIAL") return "ชำระบางส่วน";
  return "ยังไม่ชำระ";
}

function statusColor(r: BillRow): "success" | "error" | "info" | "warning" {
  if (r.status === "PAID") return "success";
  if (r.overdue) return "error";
  if (r.status === "PARTIAL") return "info";
  return "warning";
}

function HouseholdHistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const householdId = searchParams.get("householdId") ?? "";
  const [data, setData] = useState<HouseholdHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | ประวัติการใช้น้ำ";
    if (!householdId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get<HouseholdHistory>(`/water-bills/by-household/${householdId}`);
        setData(res.data);
      } catch {
        Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
      } finally {
        setLoading(false);
      }
    })();
  }, [householdId]);

  if (!householdId) return <p className="p-6 text-gray-500">ไม่พบครัวเรือน</p>;
  if (loading) return <p className="p-6 text-gray-500">กำลังโหลด...</p>;
  if (!data) return <p className="p-6 text-gray-500">ไม่พบข้อมูล</p>;

  return (
    <ComponentCard title="">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            ประวัติการใช้น้ำ — บ้านเลขที่ {data.household.houseNo || "-"}{data.household.moo ? ` หมู่ ${data.household.moo}` : ""}
          </h3>
        </div>
        <button onClick={() => router.push("/waterbilling")} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
          ← กลับ
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">ยอดบิลรวมทั้งหมด</p>
          <p className="mt-1 text-xl font-bold text-gray-800 dark:text-white">{money(data.totalBilled)} บาท</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">ชำระแล้วรวม</p>
          <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">{money(data.totalPaid)} บาท</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">ค้างชำระรวม</p>
          <p className="mt-1 text-xl font-bold text-red-600 dark:text-red-400">{money(data.totalOutstanding)} บาท</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
              <th className="py-2 px-2">งวดเดือน</th>
              <th className="py-2 px-2 text-right">หน่วยที่ใช้</th>
              <th className="py-2 px-2 text-right">จำนวนเงิน</th>
              <th className="py-2 px-2 text-right">คงเหลือ</th>
              <th className="py-2 px-2 text-center">สถานะ</th>
              <th className="py-2 px-2 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.bills.length === 0 && (
              <tr><td colSpan={6} className="py-4 text-center text-gray-400">ยังไม่มีบิลค่าน้ำของบ้านนี้</td></tr>
            )}
            {data.bills.map((b) => (
              <tr key={b.billId} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-2">{formatPeriod(b.billingPeriod)}</td>
                <td className="py-2 px-2 text-right">{Number(b.unitsUsed).toLocaleString("th-TH")}</td>
                <td className="py-2 px-2 text-right">{money(b.amount)}</td>
                <td className="py-2 px-2 text-right">{money(b.balance)}</td>
                <td className="py-2 px-2 text-center">
                  <Badge size="sm" color={statusColor(b)}>{statusLabel(b)}</Badge>
                </td>
                <td className="py-2 px-2 text-center">
                  <div className="flex justify-center gap-3 text-xs">
                    <Link href={`/waterbilling/invoice?id=${b.billId}`} className="text-blue-600 hover:underline">ใบแจ้งหนี้</Link>
                    {(b.status === "PAID" || b.status === "PARTIAL") && (
                      <Link href={`/waterbilling/receipt?billId=${b.billId}`} className="text-purple-600 hover:underline">ใบเสร็จ</Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComponentCard>
  );
}

export default function WaterBillHouseholdHistory() {
  return (
    <PermissionGuard menuUrl="/waterbilling">
      <Suspense fallback={<p className="p-6 text-gray-500">กำลังโหลด...</p>}>
        <HouseholdHistoryContent />
      </Suspense>
    </PermissionGuard>
  );
}
