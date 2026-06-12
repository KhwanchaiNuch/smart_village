"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Checkbox from "@/components/form/input/Checkbox";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

interface HouseholdEconomic {
  id: number;
  householdId: number | null;
  incomeTotalPerMonth: number | null;
  debtTotal: number | null;
  debtType: string | null;
  poorFlag: boolean | null;
  recordDate: string | null;
  createdAt: string | null;
}

function formatMoney(n: number | null): string {
  if (n == null) return "-";
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function HouseholdEconomicPage() {
  const [records, setRecords] = useState<HouseholdEconomic[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPoor, setFilterPoor] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get<HouseholdEconomic[]>("/household-economics");
      setRecords(res.data);
      setSelectedIds([]);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message || "กรุณาลองใหม่" });
    }
  }, []);

  useEffect(() => {
    document.title = "Smart Village | เศรษฐกิจครัวเรือน";
    fetchData();
  }, [fetchData]);

  const total = records.length;
  const countPoor = records.filter((r) => r.poorFlag === true).length;
  const avgIncome = records.length > 0
    ? records.reduce((s, r) => s + (r.incomeTotalPerMonth ?? 0), 0) / records.length
    : 0;

  const allDebtTypes = Array.from(new Set(records.map((r) => r.debtType).filter(Boolean)));

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      String(r.householdId || "").includes(q) ||
      (r.debtType || "").toLowerCase().includes(q);
    const matchPoor = filterPoor === "" ? true : filterPoor === "true" ? r.poorFlag === true : r.poorFlag !== true;
    return matchSearch && matchPoor;
  });

  const isAllSelected = filtered.length > 0 && filtered.every((r) => selectedIds.includes(r.id));
  const toggleSelectAll = (checked: boolean) => setSelectedIds(checked ? filtered.map((r) => r.id) : []);
  const toggleSelectOne = (id: number, checked: boolean) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบข้อมูลเศรษฐกิจ <b>${selectedIds.length}</b> รายการ`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await Promise.allSettled(selectedIds.map((id) => axios.delete(`/household-economics/${id}`)));
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  return (
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ข้อมูลเศรษฐกิจครัวเรือน</h3>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} className={selCls} />
            <select value={filterPoor} onChange={(e) => setFilterPoor(e.target.value)} className={selCls}>
              <option value="">ทุกสถานะ</option>
              <option value="true">ยากจน</option>
              <option value="false">ไม่ยากจน</option>
            </select>
            <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0 || loading}
              className="flex items-center gap-2 rounded-full border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              ลบที่เลือก{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </button>
            <a href="/householdeconomic/add"
              className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              เพิ่มข้อมูล
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[900px]">
              <Table>
                <colgroup>
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "180px" }} />
                  <col style={{ width: "180px" }} />
                  <col style={{ width: "160px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "130px" }} />
                  <col style={{ width: "80px" }} />
                </colgroup>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-4 py-3 text-center">
                      <Checkbox checked={isAllSelected} onChange={toggleSelectAll} />
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">รหัสครัวเรือน</TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">รายได้/เดือน (บาท)</TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">หนี้สินรวม (บาท)</TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ประเภทหนี้</TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">สถานะยากจน</TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">วันบันทึก</TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filtered.map((r) => (
                    <TableRow key={r.id} className={selectedIds.includes(r.id) ? "bg-blue-50 dark:bg-blue-500/10" : ""}>
                      <TableCell className="px-4 py-3 text-center">
                        <Checkbox checked={selectedIds.includes(r.id)} onChange={(c) => toggleSelectOne(r.id, c)} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                        #{r.householdId ?? "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400 font-mono">
                        {formatMoney(r.incomeTotalPerMonth)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400 font-mono">
                        {formatMoney(r.debtTotal)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{r.debtType || "-"}</TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        {r.poorFlag === true ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />ยากจน
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />ปกติ
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-gray-500 text-theme-sm">{r.recordDate || "-"}</TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <a href={`/householdeconomic/edit?id=${r.id}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600 mx-auto">
                          <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
                          </svg>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell className="px-4 py-8 text-center text-gray-400 text-theme-sm">ไม่มีข้อมูลเศรษฐกิจครัวเรือน</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
