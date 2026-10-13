"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";

interface OutstandingBill {
  billId: number;
  houseNo: string | null;
  moo: string | null;
  amount: number;
  balance: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  overdue: boolean;
  dueDate: string | null;
}

interface SummaryData {
  period: string | null;
  periodTotalBills: number;
  periodTotalAmount: number;
  periodPaidCount: number;
  periodPaidAmount: number;
  periodUnpaidCount: number;
  periodUnpaidAmount: number;
  periodOverdueCount: number;
  periodOverdueAmount: number;
  overallOutstandingCount: number;
  overallOutstandingAmount: number;
  outstandingBills: OutstandingBill[];
}

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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

export default function WaterBillingSummary() {
  const { village, loaded } = useVillage();
  const [period, setPeriod] = useState(currentPeriod());
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!loaded) return;
    setLoading(true);
    try {
      const vid = village?.villageId;
      const params: Record<string, string | number> = { period };
      if (vid) params.villageId = vid;
      const res = await axios.get<SummaryData>("/water-bills/summary", { params });
      setData(res.data);
    } catch {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  }, [loaded, village, period]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | สรุปยอดค่าน้ำประปา";
    fetchData();
  }, [fetchData]);

  const cards = data ? [
    { label: "บิลทั้งหมดในงวดนี้", value: `${data.periodTotalBills} ใบ`, sub: `${money(data.periodTotalAmount)} บาท`, color: "text-gray-800 dark:text-white" },
    { label: "ชำระแล้วในงวดนี้", value: `${data.periodPaidCount} ใบ`, sub: `${money(data.periodPaidAmount)} บาท`, color: "text-green-600 dark:text-green-400" },
    { label: "ค้างชำระในงวดนี้", value: `${data.periodUnpaidCount} ใบ`, sub: `${money(data.periodUnpaidAmount)} บาท`, color: "text-amber-600 dark:text-amber-400" },
    { label: "เกินกำหนดชำระ", value: `${data.periodOverdueCount} ใบ`, sub: `${money(data.periodOverdueAmount)} บาท`, color: "text-red-600 dark:text-red-400" },
  ] : [];

  return (
    <PermissionGuard menuUrl="/waterbilling">
      <ComponentCard title="">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">สรุปยอดค่าน้ำประปา</h3>
            {village && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">งวดเดือน</label>
            <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600" />
          </div>
        </div>

        {loading || !data ? (
          <p className="text-gray-400 text-sm">กำลังโหลด...</p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((c) => (
                <div key={c.label} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{c.label}</p>
                  <p className={`mt-1 text-xl font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>

            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                ยอดค้างชำระสะสมทุกงวด (ทั้งหมด): <span className="font-bold">{data.overallOutstandingCount} ใบ</span> รวม <span className="font-bold">{money(data.overallOutstandingAmount)} บาท</span>
              </p>
            </div>

            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">รายการค้างชำระในงวด {formatPeriod(period)}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="py-2 px-2">บ้านเลขที่</th>
                    <th className="py-2 px-2">หมู่</th>
                    <th className="py-2 px-2 text-right">ยอดบิล</th>
                    <th className="py-2 px-2 text-right">คงเหลือ</th>
                    <th className="py-2 px-2 text-center">กำหนดชำระ</th>
                    <th className="py-2 px-2 text-center">สถานะ</th>
                    <th className="py-2 px-2 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.outstandingBills.length === 0 && (
                    <tr><td colSpan={7} className="py-4 text-center text-gray-400">ไม่มีบิลค้างชำระในงวดนี้</td></tr>
                  )}
                  {data.outstandingBills.map((b) => (
                    <tr key={b.billId} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-2">{b.houseNo || "-"}</td>
                      <td className="py-2 px-2">{b.moo || "-"}</td>
                      <td className="py-2 px-2 text-right">{money(b.amount)}</td>
                      <td className="py-2 px-2 text-right">{money(b.balance)}</td>
                      <td className="py-2 px-2 text-center">{b.dueDate || "-"}</td>
                      <td className="py-2 px-2 text-center">
                        <Badge size="sm" color={b.overdue ? "error" : b.status === "PARTIAL" ? "info" : "warning"}>
                          {b.overdue ? "เกินกำหนด" : b.status === "PARTIAL" ? "ชำระบางส่วน" : "ยังไม่ชำระ"}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Link href={`/waterbilling/pay?billId=${b.billId}`} className="text-blue-600 hover:underline text-xs">รับชำระ</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ComponentCard>
    </PermissionGuard>
  );
}
