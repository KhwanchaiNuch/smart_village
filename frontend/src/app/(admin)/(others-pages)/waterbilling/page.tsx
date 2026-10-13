"use client"
import ComponentCard from '@/components/common/ComponentCard';
import DataTableWrapper, { DtColumn } from '@/components/common/DataTableWrapper';
import Badge from '@/components/ui/badge/Badge';
import PermissionGuard from "@/components/common/PermissionGuard";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";
import { usePermission } from "@/context/PermissionContext";

interface WaterBillRow {
  billId: number;
  householdId: number;
  villageId: number | null;
  billingPeriod: string;
  meterNo: string | null;
  previousReading: number;
  currentReading: number;
  unitsUsed: number;
  ratePerUnit: number;
  amount: number;
  amountPaid: number;
  balance: number;
  overdue: boolean;
  invoiceNo: string | null;
  dueDate: string | null;
  status: "UNPAID" | "PARTIAL" | "PAID";
  houseNo: string | null;
  moo: string | null;
  [key: string]: unknown;
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

function statusLabel(r: WaterBillRow) {
  if (r.status === "PAID") return "ชำระแล้ว";
  if (r.overdue) return "ค้างชำระเกินกำหนด";
  if (r.status === "PARTIAL") return "ชำระบางส่วน";
  return "ยังไม่ชำระ";
}

function statusColor(r: WaterBillRow): "success" | "error" | "info" | "warning" {
  if (r.status === "PAID") return "success";
  if (r.overdue) return "error";
  if (r.status === "PARTIAL") return "info";
  return "warning";
}

export default function WaterBillingList() {
  const router = useRouter();
  const { village, loaded } = useVillage();
  const { canAdd, canEdit, canDelete, canView } = usePermission();
  const [tableData, setData] = useState<WaterBillRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(currentPeriod());

  const fetchData = useCallback(async () => {
    if (!loaded) return;
    setLoading(true);
    try {
      const vid = village?.villageId;
      const params: Record<string, string | number> = {};
      if (vid) params.villageId = vid;
      if (period) params.period = period;
      const res = await axios.get<WaterBillRow[]>("/water-bills", { params });
      setData(res.data);
    } catch {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: "ไม่สามารถดึงข้อมูลบิลค่าน้ำได้" });
    } finally {
      setLoading(false);
    }
  }, [loaded, village, period]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | จัดการค่าน้ำประปา";
    fetchData();
  }, [fetchData]);

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    if (ids.length === 0) return;
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ?",
      html: `คุณกำลังจะลบบิลค่าน้ำจำนวน <b>${ids.length}</b> รายการ (ลบได้เฉพาะบิลที่ยังไม่ชำระ)`,
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      const responses = await Promise.allSettled(ids.map((id) => axios.delete(`/water-bills/${id}`)));
      const failed = responses.filter((r) => r.status === "rejected").length;
      await fetchData();
      if (failed === 0) {
        Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1800, showConfirmButton: false });
      } else {
        Swal.fire({ icon: "warning", title: "ลบบางส่วนไม่สำเร็จ", text: `สำเร็จ ${ids.length - failed} รายการ, ล้มเหลว ${failed} รายการ (อาจเป็นเพราะจ่ายแล้ว)` });
      }
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถลบข้อมูลได้" });
    } finally {
      setLoading(false);
    }
  };

  const columns: DtColumn<WaterBillRow>[] = [
    { key: "houseNo", label: "บ้านเลขที่", align: "center", exportText: (r) => r.houseNo ?? "" },
    { key: "moo", label: "หมู่", align: "center", exportText: (r) => r.moo ?? "" },
    { key: "billingPeriod", label: "งวดเดือน", align: "center", render: (r) => formatPeriod(r.billingPeriod), exportText: (r) => formatPeriod(r.billingPeriod) },
    { key: "unitsUsed", label: "หน่วยที่ใช้", align: "right", render: (r) => Number(r.unitsUsed).toLocaleString("th-TH") },
    { key: "amount", label: "จำนวนเงิน (บาท)", align: "right", render: (r) => Number(r.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 }) },
    { key: "balance", label: "คงเหลือ (บาท)", align: "right", render: (r) => Number(r.balance).toLocaleString("th-TH", { minimumFractionDigits: 2 }) },
    { key: "invoiceNo", label: "เลขที่ใบแจ้งหนี้", align: "center", exportText: (r) => r.invoiceNo ?? "" },
    {
      key: "status", label: "สถานะ", align: "center",
      searchText: (r) => statusLabel(r),
      exportText: (r) => statusLabel(r),
      render: (r) => <Badge size="sm" color={statusColor(r)}>{statusLabel(r)}</Badge>,
    },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Link href={`/waterbilling/invoice?id=${row.billId}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600" title="พิมพ์ใบแจ้งหนี้">
            <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 2a1 1 0 0 0-1 1v3H3a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1V3a1 1 0 0 0-1-1H5Zm10 4V3H5v3h10ZM5 12h10v5H5v-5Z" />
            </svg>
          </Link>
          {(row.status === "UNPAID" || row.status === "PARTIAL") && canEdit("/waterbilling") && (
            <Link href={`/waterbilling/pay?billId=${row.billId}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-green-500 bg-green-500 text-white hover:bg-green-600" title="รับชำระเงิน">
              <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 4.25a.75.75 0 0 0-1.5 0v3.19L7.28 7.47a.75.75 0 1 0-1.06 1.06l3.25 3.25c.3.3.77.3 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06l-1.97 1.97V6.25Z" />
              </svg>
            </Link>
          )}
          {(row.status === "PAID" || row.status === "PARTIAL") && (
            <Link href={`/waterbilling/receipt?billId=${row.billId}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-500 bg-purple-500 text-white hover:bg-purple-600" title="พิมพ์ใบเสร็จ">
              <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.36-9.14a.75.75 0 1 0-1.22-.87l-2.62 3.68-1.4-1.4a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.14-.09l3.16-4.38Z" />
              </svg>
            </Link>
          )}
          {row.status === "UNPAID" && canEdit("/waterbilling") && (
            <Link href={`/waterbilling/edit?id=${row.billId}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600" title="แก้ไข">
              <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
              </svg>
            </Link>
          )}
          <Link href={`/waterbilling/household?householdId=${row.householdId}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-400 bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300" title="ประวัติการใช้น้ำของบ้านนี้">
            <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-12a.75.75 0 0 0-1.5 0v4c0 .2.08.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06L10.75 9.69V6Z" />
            </svg>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <PermissionGuard menuUrl="/waterbilling">
      <ComponentCard title="">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">จัดการค่าน้ำประปา</h3>
            {village && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}
              </p>
            )}
          </div>
          <div className="flex items-end gap-3">
            <Link href="/waterbilling/summary" className="h-10 flex items-center rounded-lg border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
              สรุปยอด/รายงาน
            </Link>
            {canAdd("/waterbilling") && (
              <Link href="/waterbilling/bulk" className="h-10 flex items-center rounded-lg border border-blue-500 px-4 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10">
                ออกบิลทั้งหมู่บ้าน
              </Link>
            )}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">งวดเดือน</label>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        <DataTableWrapper<WaterBillRow>
          data={tableData}
          columns={columns}
          idKey="billId"
          addUrl="/waterbilling/add"
          canAdd={canAdd("/waterbilling")}
          canDelete={canDelete("/waterbilling")}
          canExport={canView("/waterbilling")}
          onDeleteSelected={handleDeleteSelected}
          exportFilename="water-bills"
          loading={loading}
          emptyText="ไม่พบข้อมูลบิลค่าน้ำ"
          onRowDoubleClick={(row) => router.push(`/waterbilling/invoice?id=${row.billId}`)}
        />
      </ComponentCard>
    </PermissionGuard>
  );
}
