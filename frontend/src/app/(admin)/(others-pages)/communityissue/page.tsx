"use client"
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useVillage } from "@/context/VillageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/smart_village/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

function getIssueImgSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("data:")) return url;
  return `${UPLOADS_BASE}/uploads/${url.replace(/^\.?\/uploads\//, "")}`;
}

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
  imageUrl?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

interface Household {
  householdId: number;
  houseNo: string | null;
}

const SEVERITY_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: "น้อยมาก", bg: "bg-green-100",  text: "text-green-700"  },
  2: { label: "น้อย",    bg: "bg-lime-100",   text: "text-lime-700"   },
  3: { label: "ปานกลาง", bg: "bg-yellow-100", text: "text-yellow-700" },
  4: { label: "มาก",    bg: "bg-red-100",    text: "text-red-700"    },
  5: { label: "วิกฤต",  bg: "bg-purple-100", text: "text-purple-700" },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  "ยังไม่แก้": { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
  "กำลังทำ":  { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  "แก้แล้ว":  { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
};

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "แก้แล้ว") return false;
  return new Date(dueDate) < new Date();
}

function formatBudget(n: number | null): string {
  if (n == null) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";

export default function CommunityIssuePage() {
  const { village, loaded } = useVillage();
  const { canAdd, canEdit, canDelete, canView } = usePermission();
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [householdMap, setHouseholdMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterType,     setFilterType]     = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const vid = village?.villageId;
      const [res, householdsRes] = await Promise.all([
        axios.get<CommunityIssue[]>(vid ? `/community-issues?villageId=${vid}` : "/community-issues"),
        axios.get<Household[]>(vid ? `/households?villageId=${vid}` : "/households"),
      ]);
      const sorted = [...res.data].sort((a, b) => {
        if (b.severity !== a.severity) return b.severity - a.severity;
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      setIssues(sorted);

      const hm = new Map<number, string>();
      householdsRes.data.forEach((h) => hm.set(h.householdId, h.houseNo ?? `บ้านเลขที่ ${h.householdId}`));
      setHouseholdMap(hm);
    } catch (err: unknown) {
      const msg = (err as {response?: {data?: {message?: string}}})?.response?.data?.message;
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: msg || "กรุณาลองใหม่" });
    }
  }, [village]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | Community Issues";
    if (!loaded) return;
    fetchData();
  }, [fetchData, loaded]);

  const total         = issues.length;
  const countNotFixed = issues.filter((i) => i.status === "ยังไม่แก้").length;
  const countDoing    = issues.filter((i) => i.status === "กำลังทำ").length;
  const countDone     = issues.filter((i) => i.status === "แก้แล้ว").length;
  const countOverdue  = issues.filter((i) => isOverdue(i.dueDate, i.status)).length;
  const allTypes      = Array.from(new Set(issues.map((i) => i.issueType).filter(Boolean)));

  const preFiltered = issues.filter((i) => {
    const matchStatus   = !filterStatus   || i.status === filterStatus;
    const matchType     = !filterType     || i.issueType === filterType;
    const matchSeverity = !filterSeverity || String(i.severity) === filterSeverity;
    return matchStatus && matchType && matchSeverity;
  });

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบปัญหาชุมชน <b>${ids.length}</b> รายการ`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => axios.delete(`/community-issues/${id}`)));
      const failed = results.filter((r) => r.status === "rejected").length;
      await fetchData();
      if (failed > 0) {
        Swal.fire({ icon: "warning", title: `สำเร็จ ${ids.length - failed}, ล้มเหลว ${failed} รายการ` });
      } else {
        Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
      }
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const columns: DtColumn<CommunityIssue>[] = [
    {
      key: "householdNo", label: "บ้านเลขที่", onlyExport: true,
      exportText: (i) => i.householdId != null ? (householdMap.get(i.householdId) ?? "") : "",
    },
    {
      key: "imageUrl", label: "รูปภาพปัญหา (URL)", onlyExport: true,
      exportText: (i) => i.imageUrl ? (getIssueImgSrc(i.imageUrl) ?? "") : "",
    },
    {
      key: "severity", label: "ระดับ", align: "center",
      searchText: (i) => SEVERITY_CONFIG[i.severity]?.label ?? String(i.severity),
      exportText:  (i) => SEVERITY_CONFIG[i.severity]?.label ?? String(i.severity),
      render: (i) => {
        const sev = SEVERITY_CONFIG[i.severity] || { label: String(i.severity), bg: "bg-gray-100", text: "text-gray-600" };
        return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>{sev.label}</span>;
      },
    },
    { key: "issueType", label: "ประเภทปัญหา", align: "center", exportText: (i) => i.issueType ?? "" },
    { key: "area",      label: "พื้นที่",       align: "center", exportText: (i) => i.area ?? "" },
    {
      key: "status", label: "สถานะ", align: "center",
      exportText: (i) => i.status ?? "",
      render: (i) => {
        const st = STATUS_CONFIG[i.status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
        const overdue = isOverdue(i.dueDate, i.status);
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text} ${overdue ? "ring-2 ring-red-300" : ""}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
            {i.status}
            {overdue && " ⚠️"}
          </span>
        );
      },
    },
    { key: "owner", label: "ผู้รับผิดชอบ", align: "center", exportText: (i) => i.owner ?? "" },
    {
      key: "impactPeople", label: "ผลกระทบ (คน)", align: "center",
      searchText: (i) => i.impactPeople != null ? String(i.impactPeople) : "",
      exportText:  (i) => i.impactPeople != null ? String(i.impactPeople) : "",
      render: (i) => <span>{i.impactPeople != null ? i.impactPeople.toLocaleString() : "-"}</span>,
    },
    {
      key: "budgetEstimate", label: "งบประมาณ", align: "center",
      searchText: (i) => i.budgetEstimate != null ? String(i.budgetEstimate) : "",
      exportText:  (i) => i.budgetEstimate != null ? String(i.budgetEstimate) : "",
      render: (i) => <span>{formatBudget(i.budgetEstimate)}</span>,
    },
    {
      key: "dueDate", label: "กำหนดเสร็จ", align: "center",
      exportText: (i) => i.dueDate ?? "",
      render: (i) => {
        const overdue = isOverdue(i.dueDate, i.status);
        return <span className={overdue ? "text-red-600 font-medium" : ""}>{i.dueDate || "-"}</span>;
      },
    },
    {
      key: "remark", label: "หมายเหตุ", align: "center",
      exportText: (i) => i.remark ?? "",
      render: (i) => <span className="text-xs text-gray-600">{i.remark || "-"}</span>,
    },
    {
      key: "createdAt", label: "วันที่บันทึก", align: "center",
      exportText: (i) => i.createdAt ? i.createdAt.slice(0, 10) : "",
      render: (i) => <span>{i.createdAt ? i.createdAt.slice(0, 10) : "-"}</span>,
    },
    { key: "_updatedAt", label: "วันที่แก้ไขล่าสุด", onlyExport: true, exportText: (i) => i.updatedAt ? i.updatedAt.slice(0, 10) : "" },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (issue) => (
        <div className="flex justify-center gap-2">
          <a href={`/communityissue/detail?id=${issue.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-500 bg-blue-500 text-white hover:bg-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </a>
          {canEdit("/communityissue") && (
            <a href={`/communityissue/edit?id=${issue.id}`}
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
    <>
      <select value={filterStatus}   onChange={(e) => setFilterStatus(e.target.value)}   className={selCls}>
        <option value="">ทุกสถานะ</option>
        <option value="ยังไม่แก้">ยังไม่แก้</option>
        <option value="กำลังทำ">กำลังทำ</option>
        <option value="แก้แล้ว">แก้แล้ว</option>
      </select>
      <select value={filterType}     onChange={(e) => setFilterType(e.target.value)}     className={selCls}>
        <option value="">ทุกประเภท</option>
        {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className={selCls}>
        <option value="">ทุกระดับ</option>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>ระดับ {n}</option>)}
      </select>
    </>
  );

  return (
    <PermissionGuard menuUrl="/communityissue">
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "ทั้งหมด",   value: total,        bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
            { label: "ยังไม่แก้", value: countNotFixed, bg: "bg-red-50",    text: "text-red-700",   border: "border-red-200"    },
            { label: "กำลังทำ",  value: countDoing,    bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
            { label: "แก้แล้ว",  value: countDone,     bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
            { label: "เกินกำหนด", value: countOverdue,  bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
          ].map((m) => (
            <div key={m.label} className={`rounded-xl border ${m.border} ${m.bg} p-4 flex flex-col items-center`}>
              <p className={`text-3xl font-bold ${m.text}`}>{m.value}</p>
              <p className={`text-sm font-medium mt-1 ${m.text} opacity-80`}>{m.label}</p>
            </div>
          ))}
        </div>

        <ComponentCard title="">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ปัญหาในชุมชน</h3>
            {village && <p className="text-xs text-gray-500 mt-0.5">{village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}</p>}
          </div>
          <DataTableWrapper<CommunityIssue>
            data={preFiltered}
            columns={columns}
            idKey="id"
            addUrl="/communityissue/add"
            canAdd={canAdd("/communityissue")}
            canDelete={canDelete("/communityissue")}
            canExport={canView("/communityissue")}
            onDeleteSelected={handleDeleteSelected}
            exportFilename="community_issues"
            toolbarExtra={toolbarExtra}
            loading={loading}
            emptyText="ไม่พบปัญหาชุมชน"
          />
        </ComponentCard>
      </div>
    </PermissionGuard>
  );
}
