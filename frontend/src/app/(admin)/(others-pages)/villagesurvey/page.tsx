"use client"
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useVillage } from "@/context/VillageContext";

interface VillageSurvey {
  surveyId: number;
  villageId: number | null;
  householdId: number | null;
  personId: number | null;
  needType: string | null;
  detail: string | null;
  priorityLevel: number | null;
  surveyDate: string | null;
  createdAt?: string | null;
  [key: string]: unknown;
}

interface Person {
  personId: number;
  firstName: string;
  lastName: string;
}

interface Household {
  householdId: number;
  houseNo: string | null;
}

const PRIORITY_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: "สูงมาก", bg: "bg-red-100",    text: "text-red-700" },
  2: { label: "สูง",    bg: "bg-orange-100", text: "text-orange-700" },
  3: { label: "ปานกลาง", bg: "bg-yellow-100", text: "text-yellow-700" },
  4: { label: "ต่ำ",    bg: "bg-green-100",  text: "text-green-700" },
  5: { label: "ต่ำมาก", bg: "bg-blue-100",   text: "text-blue-700" },
};

const NEED_TYPES = [
  "ด้านสุขภาพ", "ด้านการศึกษา", "ด้านอาชีพ", "ด้านที่อยู่อาศัย",
  "ด้านสาธารณูปโภค", "ด้านสวัสดิการสังคม", "อื่นๆ",
];

export default function VillageSurveyPage() {
  const { village, loaded } = useVillage();
  const { canAdd, canEdit, canDelete, canView } = usePermission();
  const [surveys, setSurveys] = useState<VillageSurvey[]>([]);
  const [personMap, setPersonMap] = useState<Map<number, string>>(new Map());
  const [householdMap, setHouseholdMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const vid = village?.villageId;
      const [surveysRes, personsRes, householdsRes] = await Promise.all([
        axios.get<VillageSurvey[]>(vid ? `/village-need-surveys?villageId=${vid}` : "/village-need-surveys"),
        axios.get<Person[]>(vid ? `/persons?villageId=${vid}` : "/persons"),
        axios.get<Household[]>(vid ? `/households?villageId=${vid}` : "/households"),
      ]);
      setSurveys(surveysRes.data);
      const pm = new Map<number, string>();
      personsRes.data.forEach((p) => pm.set(p.personId, `${p.firstName} ${p.lastName}`));
      setPersonMap(pm);
      const hm = new Map<number, string>();
      householdsRes.data.forEach((h) => hm.set(h.householdId, h.houseNo ?? `บ้านเลขที่ ${h.householdId}`));
      setHouseholdMap(hm);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: msg || "กรุณาลองใหม่" });
    } finally {
      setLoading(false);
    }
  }, [village]);

  useEffect(() => {
    document.title = "Smart Village | สำรวจความต้องการ";
    if (!loaded) return;
    fetchData();
  }, [fetchData, loaded]);

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    if (ids.length === 0) return;
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบข้อมูลสำรวจ <b>${ids.length}</b> รายการ`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await Promise.allSettled(ids.map((id) => axios.delete(`/village-need-surveys/${id}`)));
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = surveys.filter((s) => {
    if (filterType && s.needType !== filterType) return false;
    if (filterPriority && String(s.priorityLevel) !== filterPriority) return false;
    return true;
  });

  const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  const toolbarExtra = (
    <>
      <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selCls}>
        <option value="">ทุกด้าน</option>
        {NEED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selCls}>
        <option value="">ทุกระดับ</option>
        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>
    </>
  );

  const columns: DtColumn<VillageSurvey>[] = [
    { key: "_houseNo", label: "บ้านเลขที่", onlyExport: true, exportText: (s) => s.householdId != null ? (householdMap.get(s.householdId) ?? "") : "" },
    {
      key: "priorityLevel", label: "ระดับ", align: "center",
      searchText: (r) => r.priorityLevel != null ? (PRIORITY_CONFIG[r.priorityLevel]?.label ?? `${r.priorityLevel}`) : "",
      exportText: (r) => r.priorityLevel != null ? (PRIORITY_CONFIG[r.priorityLevel]?.label ?? `${r.priorityLevel}`) : "",
      render: (r) => {
        if (r.priorityLevel == null) return <span className="text-gray-400">-</span>;
        const cfg = PRIORITY_CONFIG[r.priorityLevel];
        if (!cfg) return <span>{r.priorityLevel}</span>;
        return (
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
            {r.priorityLevel}
          </span>
        );
      },
    },
    {
      key: "needType", label: "ด้านที่ต้องการ",
      exportText: (r) => r.needType ?? "",
    },
    {
      key: "householdId", label: "ครัวเรือน", align: "center",
      searchText: (r) => r.householdId != null ? (householdMap.get(r.householdId) ?? "") : "",
      exportText: (r) => r.householdId != null ? (householdMap.get(r.householdId) ?? "") : "",
      render: (r) => <span>{r.householdId != null ? (householdMap.get(r.householdId) ?? "-") : "-"}</span>,
    },
    {
      key: "personId", label: "บุคคล", align: "center",
      searchText: (r) => r.personId != null ? (personMap.get(r.personId) ?? "") : "",
      exportText: (r) => r.personId != null ? (personMap.get(r.personId) ?? "") : "",
      render: (r) => <span>{r.personId != null ? (personMap.get(r.personId) ?? "-") : "-"}</span>,
    },
    {
      key: "detail", label: "รายละเอียด",
      exportText: (r) => r.detail ?? "",
      render: (r) => <span className="max-w-[200px] truncate block">{r.detail || "-"}</span>,
    },
    {
      key: "surveyDate", label: "วันที่สำรวจ", align: "center",
      exportText: (r) => r.surveyDate ?? "",
    },
    {
      key: "createdAt", label: "วันที่บันทึก", align: "center",
      exportText: (r) => r.createdAt ? r.createdAt.slice(0, 10) : "",
      render: (r) => <span>{r.createdAt ? r.createdAt.slice(0, 10) : "-"}</span>,
    },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (r) => (
        canEdit("/villagesurvey") ? (
          <a href={`/villagesurvey/edit?id=${r.surveyId}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white hover:bg-amber-600 mx-auto">
            <svg className="fill-current" width="14" height="14" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206Z" />
            </svg>
          </a>
        ) : <span>-</span>
      ),
    },
  ];

  return (
    <PermissionGuard menuUrl="/villagesurvey">
      <ComponentCard title="">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">สำรวจความต้องการชุมชน</h3>
        </div>
        <DataTableWrapper<VillageSurvey>
          data={filtered}
          columns={columns}
          idKey="surveyId"
          addUrl="/villagesurvey/add"
          canAdd={canAdd("/villagesurvey")}
          canDelete={canDelete("/villagesurvey")}
          canExport={true}
          onDeleteSelected={handleDeleteSelected}
          exportFilename="village_surveys"
          loading={loading}
          emptyText="ไม่มีข้อมูลการสำรวจ"
          toolbarExtra={toolbarExtra}
        />
      </ComponentCard>
    </PermissionGuard>
  );
}
