"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Checkbox from "@/components/form/input/Checkbox";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";

interface VillageNeedSurvey {
  surveyId: number;
  householdId: number | null;
  personId: number | null;
  needType: string | null;
  priorityLevel: number | null;
  detail: string | null;
  surveyDate: string | null;
  createdAt: string | null;
}

interface Person { personId: number; firstName: string; lastName: string; }
interface Household { householdId: number; houseNo: string; moo: string | null; }

const PRIORITY_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: "ต่ำมาก", bg: "bg-gray-100", text: "text-gray-600" },
  2: { label: "ต่ำ", bg: "bg-blue-100", text: "text-blue-700" },
  3: { label: "ปานกลาง", bg: "bg-yellow-100", text: "text-yellow-700" },
  4: { label: "สูง", bg: "bg-orange-100", text: "text-orange-700" },
  5: { label: "เร่งด่วน", bg: "bg-red-100", text: "text-red-700" },
};

export default function VillageSurveyPage() {
  const { canAdd, canEdit, canDelete } = usePermission();
  const [surveys, setSurveys] = useState<VillageNeedSurvey[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterType, setFilterType] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [sRes, pRes, hRes] = await Promise.all([
        axios.get<VillageNeedSurvey[]>("/village-need-surveys"),
        axios.get<Person[]>("/persons"),
        axios.get<Household[]>("/households"),
      ]);
      setSurveys(sRes.data);
      setPersons(pRes.data);
      setHouseholds(hRes.data);
      setSelectedIds([]);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message || "กรุณาลองใหม่" });
    }
  }, []);

  useEffect(() => {
    document.title = "Smart Village | ความต้องการชุมชน";
    fetchData();
  }, [fetchData]);

  const personMap = Object.fromEntries(persons.map((p) => [p.personId, `${p.firstName} ${p.lastName}`]));
  const householdMap = Object.fromEntries(households.map((h) => [h.householdId, `บ้านเลขที่ ${h.houseNo || "-"}${h.moo ? ` หมู่ ${h.moo}` : ""}`]));

  const allTypes = Array.from(new Set(surveys.map((s) => s.needType).filter(Boolean)));

  const filtered = surveys.filter((s) => {
    const q = search.toLowerCase();
    const personName = personMap[s.personId ?? -1] || "";
    const matchSearch = !q ||
      (s.needType || "").toLowerCase().includes(q) ||
      (s.detail || "").toLowerCase().includes(q) ||
      personName.toLowerCase().includes(q);
    const matchPriority = !filterPriority || String(s.priorityLevel) === filterPriority;
    const matchType = !filterType || s.needType === filterType;
    return matchSearch && matchPriority && matchType;
  });

  const isAllSelected = filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.surveyId));
  const toggleSelectAll = (checked: boolean) => setSelectedIds(checked ? filtered.map((s) => s.surveyId) : []);
  const toggleSelectOne = (id: number, checked: boolean) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบข้อมูล <b>${selectedIds.length}</b> รายการ`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await Promise.allSettled(selectedIds.map((id) => axios.delete(`/village-need-surveys/${id}`)));
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
      <ComponentCard title="">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ความต้องการของชุมชน</h3>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} className={selCls} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selCls}>
              <option value="">ทุกประเภท</option>
              {allTypes.map((t) => <option key={t!} value={t!}>{t}</option>)}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selCls}>
              <option value="">ทุกระดับ</option>
              {[1,2,3,4,5].map((n) => <option key={n} value={n}>ระดับ {n}</option>)}
            </select>
            {canDelete("/villagesurvey") && (
            <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0 || loading}
              className="flex items-center gap-2 rounded-full border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              ลบที่เลือก{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </button>
            )}
            {canAdd("/villagesurvey") && (
            <a href="/villagesurvey/add"
              className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              เพิ่มความต้องการ
            </a>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-center">
                      <Checkbox checked={isAllSelected} onChange={toggleSelectAll} />
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ระดับ</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ประเภทความต้องการ</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ครัวเรือน</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">บุคคล</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">รายละเอียด</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">วันที่สำรวจ</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filtered.map((s) => {
                    const priCfg = PRIORITY_CONFIG[s.priorityLevel ?? 0] || { label: String(s.priorityLevel ?? "-"), bg: "bg-gray-100", text: "text-gray-600" };
                    return (
                      <TableRow key={s.surveyId} className={selectedIds.includes(s.surveyId) ? "bg-blue-50 dark:bg-blue-500/10" : ""}>
                        <TableCell className="px-4 py-3 text-center">
                          <Checkbox checked={selectedIds.includes(s.surveyId)} onChange={(c) => toggleSelectOne(s.surveyId, c)} />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ring-2 ring-offset-1 ${priCfg.bg} ${priCfg.text}`}>
                            {s.priorityLevel ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{s.needType || "-"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{householdMap[s.householdId ?? -1] || "-"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{personMap[s.personId ?? -1] || "-"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 max-w-[200px] truncate">{s.detail || "-"}</TableCell>
                        <TableCell className="px-4 py-3 text-center text-gray-500 text-theme-sm">{s.surveyDate || "-"}</TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          {canEdit("/villagesurvey") && (
                          <a href={`/villagesurvey/edit?id=${s.surveyId}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600 mx-auto">
                            <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
                            </svg>
                          </a>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell className="px-4 py-8 text-center text-gray-400 text-theme-sm">ไม่มีข้อมูลความต้องการชุมชน</TableCell>
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
