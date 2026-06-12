"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Checkbox from "@/components/form/input/Checkbox";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

interface TrainingEvent {
  id: number;
  trainingName: string;
  trainingType: string;
  organizer: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

interface TrainingParticipant {
  id: number;
  trainingId: number;
}

export default function TrainingPage() {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [countMap, setCountMap] = useState<Map<number, number>>(new Map());
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, participantsRes] = await Promise.all([
        axios.get<TrainingEvent[]>("/training-events"),
        axios.get<TrainingParticipant[]>("/training-participants"),
      ]);
      const sorted = [...eventsRes.data].sort((a, b) => a.id - b.id);
      setEvents(sorted);
      setSelectedIds([]);
      const map = new Map<number, number>();
      eventsRes.data.forEach((e) => map.set(e.id, 0));
      participantsRes.data.forEach((p) => {
        map.set(p.trainingId, (map.get(p.trainingId) || 0) + 1);
      });
      setCountMap(map);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message || "กรุณาลองใหม่" });
    }
  }, []);

  useEffect(() => {
    document.title = "Smart Village | Training";
    fetchData();
  }, [fetchData]);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.trainingName || "").toLowerCase().includes(q) ||
      (e.trainingType || "").toLowerCase().includes(q) ||
      (e.organizer || "").toLowerCase().includes(q) ||
      (e.location || "").toLowerCase().includes(q)
    );
  });

  const isAllSelected = filtered.length > 0 && filtered.every((e) => selectedIds.includes(e.id));
  const toggleSelectAll = (checked: boolean) => setSelectedIds(checked ? filtered.map((e) => e.id) : []);
  const toggleSelectOne = (id: number, checked: boolean) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ?",
      html: `ลบโครงการอบรม <b>${selectedIds.length}</b> รายการ`,
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await Promise.allSettled(selectedIds.map((id) => axios.delete(`/training-events/${id}`)));
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const typeColor = (type: string) => {
    const map: Record<string, string> = {
      อาชีพ: "bg-blue-100 text-blue-700",
      สุขภาพ: "bg-green-100 text-green-700",
      การเงิน: "bg-yellow-100 text-yellow-700",
      สิ่งแวดล้อม: "bg-teal-100 text-teal-700",
    };
    return map[type] || "bg-gray-100 text-gray-600";
  };

  return (
    <ComponentCard title="">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          โครงการอบรมพัฒนา (Training Events)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="ค้นหา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
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
          <a
            href="/training/add"
            className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Add
          </a>
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
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">ชื่อโครงการ</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs">หมวด</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs">หน่วยจัด</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs">วันที่จัด</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs">สถานที่</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs">ผู้เข้าร่วม</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filtered.map((ev) => {
                  const isSelected = selectedIds.includes(ev.id);
                  const count = countMap.get(ev.id) || 0;
                  return (
                    <TableRow key={ev.id} className={isSelected ? "bg-red-50 dark:bg-red-500/10" : ""}>
                      <TableCell className="px-4 py-3 text-center">
                        <Checkbox checked={isSelected} onChange={(c) => toggleSelectOne(ev.id, c)} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-800 dark:text-white font-medium text-theme-sm">
                        {ev.trainingName || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${typeColor(ev.trainingType)}`}>
                          {ev.trainingType || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm">{ev.organizer || "-"}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm">
                        {ev.startDate || "-"}{ev.endDate && ev.endDate !== ev.startDate ? ` – ${ev.endDate}` : ""}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm">{ev.location || "-"}</TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                          👥 {count} คน
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`/training/detail?id=${ev.id}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600"
                            title="ดูรายละเอียด / จัดการผู้เข้าร่วม"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                          </a>
                          <a
                            href={`/training/edit?id=${ev.id}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600"
                          >
                            <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
                            </svg>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell className="px-4 py-6 text-center text-gray-400 text-theme-sm">ไม่มีข้อมูลโครงการอบรม</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
