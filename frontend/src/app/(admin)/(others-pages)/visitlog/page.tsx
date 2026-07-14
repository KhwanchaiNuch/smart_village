"use client"
import ComponentCard from '@/components/common/ComponentCard';
import DataTableWrapper, { DtColumn } from '@/components/common/DataTableWrapper';
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useVillage } from "@/context/VillageContext";

interface VisitLog {
  id: number;
  personId: number;
  householdId: number;
  visitDate: string;
  visitor: string;
  visitReason: string;
  summary: string;
  nextAction: string;
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

export default function VisitLogPage() {
  const { village, loaded } = useVillage();
  const { canAdd, canEdit, canDelete, canView } = usePermission();
  const [tableData, setData] = useState<VisitLog[]>([]);
  const [personMap, setPersonMap] = useState<Map<number, string>>(new Map());
  const [householdMap, setHouseholdMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const vid = village?.villageId;
      const [logsRes, personsRes, householdsRes] = await Promise.all([
        axios.get<VisitLog[]>(vid ? `/visit-logs?villageId=${vid}` : "/visit-logs"),
        axios.get<Person[]>(vid ? `/persons?villageId=${vid}` : "/persons"),
        axios.get<Household[]>(vid ? `/households?villageId=${vid}` : "/households"),
      ]);
      const sorted = [...logsRes.data].sort((a, b) =>
        new Date(b.visitDate || 0).getTime() - new Date(a.visitDate || 0).getTime()
      );
      setData(sorted);

      const map = new Map<number, string>();
      personsRes.data.forEach((p) => map.set(p.personId, `${p.firstName} ${p.lastName}`));
      setPersonMap(map);

      const hm = new Map<number, string>();
      householdsRes.data.forEach((h) => hm.set(h.householdId, h.houseNo ?? `บ้านเลขที่ ${h.householdId}`));
      setHouseholdMap(hm);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: msg || "กรุณาลองใหม่" });
    }
  }, [village]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | Visit Log";
    if (!loaded) return;
    fetchData();
  }, [fetchData, loaded]);

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    if (ids.length === 0) return;
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบบันทึกการเยี่ยมบ้าน <b>${ids.length}</b> รายการ`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => axios.delete(`/visit-logs/${id}`)));
      const failed = results.filter((r) => r.status === "rejected").length;
      await fetchData();
      if (failed === 0) {
        Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: "warning", title: "ลบบางส่วนไม่สำเร็จ", text: `ล้มเหลว ${failed} รายการ` });
      }
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const columns: DtColumn<VisitLog>[] = [
    {
      key: "houseNo", label: "บ้านเลขที่", onlyExport: true,
      exportText: (r) => r.householdId != null ? (householdMap.get(r.householdId) ?? "") : "",
    },
    {
      key: "householdId", label: "รหัสครัวเรือน", align: "center",
      noExport: true,
      render: (r) => <span className="text-xs text-gray-500">{r.householdId ?? "-"}</span>,
    },
    {
      key: "personId", label: "ชื่อ-นามสกุล", align: "center",
      searchText: (r) => personMap.get(r.personId) ?? "",
      exportText: (r) => personMap.get(r.personId) ?? "",
      render: (r) => <span>{personMap.get(r.personId) || "-"}</span>,
    },
    {
      key: "visitDate", label: "วันที่เยี่ยม", align: "center",
      exportText: (r) => r.visitDate ?? "",
    },
    {
      key: "visitor", label: "ผู้เยี่ยม", align: "center",
      exportText: (r) => r.visitor ?? "",
    },
    {
      key: "visitReason", label: "วัตถุประสงค์", align: "center",
      exportText: (r) => r.visitReason ?? "",
    },
    {
      key: "summary", label: "สรุปผล", align: "center",
      exportText: (r) => r.summary ?? "",
    },
    {
      key: "nextAction", label: "การดำเนินการต่อ", align: "center",
      exportText: (r) => r.nextAction ?? "",
    },
    { key: "_createdAt", label: "วันที่บันทึก", onlyExport: true, exportText: (r) => r.createdAt ? r.createdAt.slice(0, 10) : "" },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (r) => (
        canEdit("/visitlog") ? (
          <a href={`/visitlog/edit?id=${r.id}`}
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
    <PermissionGuard menuUrl="/visitlog">
      <ComponentCard title="">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">บันทึกการเยี่ยมบ้าน (Visit Log)</h3>
        </div>
        <DataTableWrapper<VisitLog>
          data={tableData}
          columns={columns}
          idKey="id"
          addUrl="/visitlog/add"
          canAdd={canAdd("/visitlog")}
          canDelete={canDelete("/visitlog")}
          canExport={canView("/visitlog")}
          onDeleteSelected={handleDeleteSelected}
          exportFilename="visit_logs"
          loading={loading}
          emptyText="ไม่มีบันทึกการเยี่ยมบ้าน"
        />
      </ComponentCard>
    </PermissionGuard>
  );
}
