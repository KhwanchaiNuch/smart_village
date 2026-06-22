"use client"
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useVillage } from "@/context/VillageContext";

interface TrainingEvent {
  id: number;
  trainingName: string;
  trainingType: string;
  organizer: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  participantCount?: number;
  [key: string]: unknown;
}

interface TrainingParticipant {
  id: number;
  trainingId: number;
}

const TYPE_COLORS: Record<string, string> = {
  อาชีพ: "bg-blue-100 text-blue-700",
  สุขภาพ: "bg-green-100 text-green-700",
  การเงิน: "bg-yellow-100 text-yellow-700",
  สิ่งแวดล้อม: "bg-teal-100 text-teal-700",
};

export default function TrainingPage() {
  const { village, loaded } = useVillage();
  const { canAdd, canEdit, canDelete, canView } = usePermission();
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const vid = village?.villageId;
      const [eventsRes, participantsRes] = await Promise.all([
        axios.get<TrainingEvent[]>(vid ? `/training-events?villageId=${vid}` : "/training-events"),
        axios.get<TrainingParticipant[]>("/training-participants"),
      ]);
      const countMap = new Map<number, number>();
      eventsRes.data.forEach((e) => countMap.set(e.id, 0));
      participantsRes.data.forEach((p) => {
        countMap.set(p.trainingId, (countMap.get(p.trainingId) || 0) + 1);
      });
      const sorted = [...eventsRes.data]
        .sort((a, b) => a.id - b.id)
        .map((e) => ({ ...e, participantCount: countMap.get(e.id) ?? 0 }));
      setEvents(sorted);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: msg || "กรุณาลองใหม่" });
    }
  }, [village]);

  useEffect(() => {
    document.title = "Smart Village | Training";
    if (!loaded) return;
    fetchData();
  }, [fetchData, loaded]);

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    if (ids.length === 0) return;
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบโครงการอบรม <b>${ids.length}</b> รายการ`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await Promise.allSettled(ids.map((id) => axios.delete(`/training-events/${id}`)));
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const columns: DtColumn<TrainingEvent>[] = [
    {
      key: "startDateRaw", label: "วันที่เริ่มโครงการ", onlyExport: true,
      exportText: (r) => r.startDate ?? "",
    },
    {
      key: "endDateRaw", label: "วันที่สิ้นสุดโครงการ", onlyExport: true,
      exportText: (r) => r.endDate ?? "",
    },
    {
      key: "trainingName", label: "ชื่อโครงการ",
      exportText: (r) => r.trainingName ?? "",
    },
    {
      key: "trainingType", label: "หมวด", align: "center",
      searchText: (r) => r.trainingType ?? "",
      exportText: (r) => r.trainingType ?? "",
      render: (r) => r.trainingType ? (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[r.trainingType] ?? "bg-gray-100 text-gray-600"}`}>
          {r.trainingType}
        </span>
      ) : <span>-</span>,
    },
    {
      key: "organizer", label: "หน่วยจัด", align: "center",
      exportText: (r) => r.organizer ?? "",
    },
    {
      key: "startDate", label: "วันที่จัด", align: "center",
      exportText: (r) => r.startDate ? `${r.startDate}${r.endDate && r.endDate !== r.startDate ? ` – ${r.endDate}` : ""}` : "",
      render: (r) => (
        <span>{r.startDate || "-"}{r.endDate && r.endDate !== r.startDate ? ` – ${r.endDate}` : ""}</span>
      ),
    },
    {
      key: "location", label: "สถานที่", align: "center",
      exportText: (r) => r.location ?? "",
    },
    {
      key: "description", label: "รายละเอียด",
      exportText: (r) => r.description ?? "",
      render: (r) => <span className="max-w-[200px] truncate block text-xs text-gray-600">{r.description || "-"}</span>,
    },
    {
      key: "participantCount", label: "ผู้เข้าร่วม", align: "center",
      searchText: (r) => `${r.participantCount ?? 0} คน`,
      exportText: (r) => `${r.participantCount ?? 0}`,
      render: (r) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
          {r.participantCount ?? 0} คน
        </span>
      ),
    },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
          <a href={`/training/detail?id=${r.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-600" title="ดูรายละเอียด">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </a>
          {canEdit("/training") && (
            <a href={`/training/edit?id=${r.id}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white hover:bg-amber-600">
              <svg className="fill-current" width="14" height="14" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206Z" />
              </svg>
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <PermissionGuard menuUrl="/training">
      <ComponentCard title="">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">โครงการอบรมพัฒนา (Training Events)</h3>
        </div>
        <DataTableWrapper<TrainingEvent>
          data={events}
          columns={columns}
          idKey="id"
          addUrl="/training/add"
          canAdd={canAdd("/training")}
          canDelete={canDelete("/training")}
          canExport={canView("/training")}
          onDeleteSelected={handleDeleteSelected}
          exportFilename="training_events"
          loading={loading}
          emptyText="ไม่มีข้อมูลโครงการอบรม"
        />
      </ComponentCard>
    </PermissionGuard>
  );
}
