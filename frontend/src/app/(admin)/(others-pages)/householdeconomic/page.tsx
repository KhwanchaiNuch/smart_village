"use client"
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useVillage } from "@/context/VillageContext";

interface HouseholdEconomic {
  id: number;
  householdId: number | null;
  houseNo: string | null;
  moo: string | null;
  incomeTotalPerMonth: number | null;
  debtTotal: number | null;
  debtType: string | null;
  poorFlag: boolean | null;
  recordDate: string | null;
  createdAt: string | null;
  [key: string]: unknown;
}

function formatMoney(n: number | null): string {
  if (n == null) return "-";
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";

export default function HouseholdEconomicPage() {
  const { village, loaded } = useVillage();
  const { canAdd, canEdit, canDelete, canView } = usePermission();
  const [records, setRecords] = useState<HouseholdEconomic[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterPoor, setFilterPoor] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const vid = village?.villageId;
      const res = await axios.get<HouseholdEconomic[]>(vid ? `/household-economics?villageId=${vid}` : "/household-economics");
      setRecords([...res.data].sort((a, b) =>
        new Date(b.recordDate || 0).getTime() - new Date(a.recordDate || 0).getTime()
      ));
    } catch (err: unknown) {
      const msg = (err as {response?: {data?: {message?: string}}})?.response?.data?.message;
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: msg || "กรุณาลองใหม่" });
    }
  }, [village]);

  useEffect(() => {
    document.title = "Smart Village | เศรษฐกิจครัวเรือน";
    if (!loaded) return;
    fetchData();
  }, [fetchData, loaded]);

  const total      = records.length;
  const countPoor  = records.filter((r) => r.poorFlag === true).length;
  const avgIncome  = records.length > 0
    ? records.reduce((s, r) => s + (r.incomeTotalPerMonth ?? 0), 0) / records.length
    : 0;

  const preFiltered = records.filter((r) =>
    filterPoor === "" ? true : filterPoor === "true" ? r.poorFlag === true : r.poorFlag !== true
  );

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบข้อมูลเศรษฐกิจ <b>${ids.length}</b> รายการ`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await Promise.allSettled(ids.map((id) => axios.delete(`/household-economics/${id}`)));
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const columns: DtColumn<HouseholdEconomic>[] = [
    {
      key: "householdId", label: "รหัสครัวเรือน", align: "center",
      noExport: true,
      render: (r) => <span className="text-xs text-gray-500">{r.householdId ?? "-"}</span>,
    },
    { key: "houseNo", label: "บ้านเลขที่", align: "center", exportText: (r) => r.houseNo ?? "" },
    { key: "moo", label: "หมู่", align: "center", exportText: (r) => r.moo ?? "" },
    {
      key: "incomeTotalPerMonth", label: "รายได้/เดือน (บาท)", align: "right",
      searchText: (r) => formatMoney(r.incomeTotalPerMonth),
      exportText:  (r) => r.incomeTotalPerMonth != null ? String(r.incomeTotalPerMonth) : "",
      render:      (r) => <span className="font-mono">{formatMoney(r.incomeTotalPerMonth)}</span>,
    },
    {
      key: "debtTotal", label: "หนี้สินรวม (บาท)", align: "right",
      searchText: (r) => formatMoney(r.debtTotal),
      exportText:  (r) => r.debtTotal != null ? String(r.debtTotal) : "",
      render:      (r) => <span className="font-mono">{formatMoney(r.debtTotal)}</span>,
    },
    {
      key: "debtType", label: "ประเภทหนี้", align: "center",
      exportText: (r) => r.debtType ?? "",
      render: (r) => <span>{r.debtType || "-"}</span>,
    },
    {
      key: "poorFlag", label: "ยากจน", align: "center",
      searchText: (r) => r.poorFlag ? "ยากจน" : "ไม่ยากจน",
      exportText:  (r) => r.poorFlag ? "ยากจน" : "ไม่ยากจน",
      render: (r) =>
        r.poorFlag
          ? <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">ยากจน</span>
          : <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">ไม่ยากจน</span>,
    },
    { key: "recordDate", label: "วันที่บันทึก", align: "center", exportText: (r) => r.recordDate ?? "" },
    {
      key: "createdAt", label: "วันที่สร้าง", align: "center",
      exportText: (r) => r.createdAt ? r.createdAt.slice(0, 10) : "",
      render: (r) => <span>{r.createdAt ? r.createdAt.slice(0, 10) : "-"}</span>,
    },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (row) => (
        <div className="flex justify-center">
          {canEdit("/householdeconomic") && (
            <a href={`/householdeconomic/edit?id=${row.id}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600">
              <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
              </svg>
            </a>
          )}
        </div>
      ),
    },
  ];

  const toolbarExtra = (
    <select value={filterPoor} onChange={(e) => setFilterPoor(e.target.value)} className={selCls}>
      <option value="">ทุกสถานะ</option>
      <option value="true">ยากจน</option>
      <option value="false">ไม่ยากจน</option>
    </select>
  );

  return (
    <PermissionGuard menuUrl="/householdeconomic">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "ทั้งหมด", value: total, bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
            { label: "ครัวเรือนยากจน", value: countPoor, bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
            { label: "รายได้เฉลี่ย/เดือน (บาท)", value: avgIncome.toLocaleString("th-TH", { maximumFractionDigits: 0 }), bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
          ].map((m) => (
            <div key={m.label} className={`rounded-xl border ${m.border} ${m.bg} p-4 flex flex-col items-center`}>
              <p className={`text-3xl font-bold ${m.text}`}>{m.value}</p>
              <p className={`text-sm font-medium mt-1 ${m.text} opacity-80`}>{m.label}</p>
            </div>
          ))}
        </div>

        <ComponentCard title="">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ข้อมูลเศรษฐกิจครัวเรือน</h3>
            {village && <p className="text-xs text-gray-500 mt-0.5">{village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}</p>}
          </div>
          <DataTableWrapper<HouseholdEconomic>
            data={preFiltered}
            columns={columns}
            idKey="id"
            addUrl="/householdeconomic/add"
            canAdd={canAdd("/householdeconomic")}
            canDelete={canDelete("/householdeconomic")}
            canExport={canView("/householdeconomic")}
            onDeleteSelected={handleDeleteSelected}
            exportFilename="household_economics"
            toolbarExtra={toolbarExtra}
            loading={loading}
            emptyText="ไม่พบข้อมูลเศรษฐกิจครัวเรือน"
          />
        </ComponentCard>
      </div>
    </PermissionGuard>
  );
}
