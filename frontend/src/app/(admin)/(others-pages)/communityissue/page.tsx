"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Checkbox from "@/components/form/input/Checkbox";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";

interface CommunityIssue {
  id: number;
  householdId: number | null;
  area: string;
  issueType: string;
  severity: number;
  status: string;
  owner: string;
  impactPeople: number | null;
  budgetEstimate: number | null;
  dueDate: string | null;
  remark: string | null;
  createdAt: string | null;
}

const SEVERITY_CONFIG: Record<number, { label: string; bg: string; text: string; ring: string }> = {
  1: { label: "น้อยมาก", bg: "bg-green-100", text: "text-green-700", ring: "ring-green-300" },
  2: { label: "น้อย", bg: "bg-lime-100", text: "text-lime-700", ring: "ring-lime-300" },
  3: { label: "ปานกลาง", bg: "bg-yellow-100", text: "text-yellow-700", ring: "ring-yellow-300" },
  4: { label: "มาก", bg: "bg-red-100", text: "text-red-700", ring: "ring-red-300" },
  5: { label: "วิกฤต", bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-300" },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  "ยังไม่แก้": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  "กำลังทำ": { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  "แก้แล้ว": { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
};

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "แก้แล้ว") return false;
  return new Date(dueDate) < new Date();
}

function formatBudget(n: number | null): string {
  if (n == null) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function CommunityIssuePage() {
  const { canAdd, canEdit, canDelete } = usePermission();
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get<CommunityIssue[]>("/community-issues");
      const sorted = [...res.data].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      setIssues(sorted);
      setSelectedIds([]);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message || "กรุณาลองใหม่" });
    }
  }, []);

  useEffect(() => {
    document.title = "Smart Village | Community Issues";
    fetchData();
  }, [fetchData]);

  // stats
  const total = issues.length;
  const countNotFixed = issues.filter((i) => i.status === "ยังไม่แก้").length;
  const countDoing = issues.filter((i) => i.status === "กำลังทำ").length;
  const countDone = issues.filter((i) => i.status === "แก้แล้ว").length;
  const countOverdue = issues.filter((i) => isOverdue(i.dueDate, i.status)).length;

  // unique types for filter
  const allTypes = Array.from(new Set(issues.map((i) => i.issueType).filter(Boolean)));

  const filtered = issues.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (i.area || "").toLowerCase().includes(q) ||
      (i.issueType || "").toLowerCase().includes(q) ||
      (i.owner || "").toLowerCase().includes(q);
    const matchStatus = !filterStatus || i.status === filterStatus;
    const matchType = !filterType || i.issueType === filterType;
    const matchSeverity = !filterSeverity || String(i.severity) === filterSeverity;
    return matchSearch && matchStatus && matchType && matchSeverity;
  });

  const isAllSelected = filtered.length > 0 && filtered.every((i) => selectedIds.includes(i.id));
  const toggleSelectAll = (checked: boolean) => setSelectedIds(checked ? filtered.map((i) => i.id) : []);
  const toggleSelectOne = (id: number, checked: boolean) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ?",
      html: `ลบปัญหาชุมชน <b>${selectedIds.length}</b> รายการ`,
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await Promise.allSettled(selectedIds.map((id) => axios.delete(`/community-issues/${id}`)));
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const selectCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  return (
    <PermissionGuard menuUrl="/communityissue">
    <div className="space-y-5">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "ทั้งหมด", value: total, bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
          { label: "ยังไม่แก้", value: countNotFixed, bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
          { label: "กำลังทำ", value: countDoing, bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
          { label: "แก้แล้ว", value: countDone, bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
          { label: "เกินกำหนด", value: countOverdue, bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
        ].map((m) => (
          <div key={m.label} className={`rounded-xl border ${m.border} ${m.bg} p-4 flex flex-col items-center`}>
            <p className={`text-3xl font-bold ${m.text}`}>{m.value}</p>
            <p className={`text-sm font-medium mt-1 ${m.text} opacity-80`}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* ── Main Table ── */}
      <ComponentCard title="">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            ปัญหาในชุมชน
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={selectCls}
            />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectCls}>
              <option value="">ทุกสถานะ</option>
              <option value="ยังไม่แก้">ยังไม่แก้</option>
              <option value="กำลังทำ">กำลังทำ</option>
              <option value="แก้แล้ว">แก้แล้ว</option>
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectCls}>
              <option value="">ทุกประเภท</option>
              {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className={selectCls}>
              <option value="">ทุกระดับ</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>ระดับ {n}</option>)}
            </select>
            {canDelete("/communityissue") && (
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0 || loading}
              className="flex items-center gap-2 rounded-full border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              ลบที่เลือก{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </button>
            )}
            {canAdd("/communityissue") && (
            <a
              href="/communityissue/add"
              className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              แจ้งปัญหา
            </a>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1000px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-center">
                      <Checkbox checked={isAllSelected} onChange={toggleSelectAll} />
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ระดับ</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ประเภทปัญหา</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">พื้นที่</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">สถานะ</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ผู้รับผิดชอบ</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ผลกระทบ (คน)</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">งบประมาณ</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">กำหนดเสร็จ</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filtered.map((issue) => {
                    const isSelected = selectedIds.includes(issue.id);
                    const sev = SEVERITY_CONFIG[issue.severity] || { label: String(issue.severity), bg: "bg-gray-100", text: "text-gray-600", ring: "" };
                    const stCfg = STATUS_CONFIG[issue.status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
                    const overdue = isOverdue(issue.dueDate, issue.status);
                    return (
                      <TableRow key={issue.id} className={isSelected ? "bg-red-50 dark:bg-red-500/10" : overdue ? "bg-purple-50/50 dark:bg-purple-900/10" : ""}>
                        <TableCell className="px-4 py-3 text-center">
                          <Checkbox checked={isSelected} onChange={(c) => toggleSelectOne(issue.id, c)} />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ring-2 ${sev.bg} ${sev.text} ${sev.ring}`}>
                            {issue.severity}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                          {issue.issueType || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 max-w-[150px] truncate">
                          {issue.area || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${stCfg.bg} ${stCfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot}`} />
                            {issue.status || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{issue.owner || "-"}</TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          {issue.impactPeople != null ? (
                            <span className="text-gray-500 text-theme-sm dark:text-gray-400">{issue.impactPeople.toLocaleString()}</span>
                          ) : <span className="text-gray-500 text-theme-sm dark:text-gray-400">-</span>}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatBudget(issue.budgetEstimate)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          {issue.dueDate ? (
                            <span className={`text-xs font-medium ${overdue ? "text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full" : "text-gray-500"}`}>
                              {issue.dueDate}
                            </span>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`/communityissue/detail?id=${issue.id}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                              title="ดูรายละเอียด"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                              </svg>
                            </a>
                            {canEdit("/communityissue") && (
                            <a
                              href={`/communityissue/edit?id=${issue.id}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600"
                              title="แก้ไข"
                            >
                              <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
                              </svg>
                            </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell className="px-4 py-8 text-center text-gray-400 text-theme-sm">ไม่มีข้อมูลปัญหาชุมชน</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
    </PermissionGuard>
  );
}
