"use client"
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useVillage } from "@/context/VillageContext";

interface VillageResource {
  resourceId: number;
  villageCode: string | null;
  resourceType: string | null;
  resourceName: string | null;
  description: string | null;
  resourceCategories: string | null;
  gpsLat: number | null;
  gpsLng: number | null;
  createdAt: string | null;
  [key: string]: unknown;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "แหล่งน้ำ":        { bg: "bg-blue-100",   text: "text-blue-700" },
  "ป่าไม้":           { bg: "bg-green-100",  text: "text-green-700" },
  "ที่ดิน":           { bg: "bg-yellow-100", text: "text-yellow-700" },
  "วัด/ศาสนสถาน":     { bg: "bg-purple-100", text: "text-purple-700" },
  "โรงเรียน":         { bg: "bg-pink-100",   text: "text-pink-700" },
  "สถานพยาบาล":       { bg: "bg-red-100",    text: "text-red-700" },
  "ตลาด/ร้านค้า":     { bg: "bg-orange-100", text: "text-orange-700" },
  "สิ่งก่อสร้าง":     { bg: "bg-gray-100",   text: "text-gray-700" },
};
const DEFAULT_COLOR = { bg: "bg-indigo-100", text: "text-indigo-700" };

export default function VillageResourcePage() {
  const { village, loaded } = useVillage();
  const { canAdd, canEdit, canDelete, canView } = usePermission();
  const [resources, setResources] = useState<VillageResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const vid = village?.villageId;
      const res = await axios.get<VillageResource[]>(vid ? `/village-resources?villageId=${vid}` : "/village-resources");
      setResources(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: msg || "กรุณาลองใหม่" });
    } finally {
      setLoading(false);
    }
  }, [village]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | ทรัพยากรชุมชน";
    if (!loaded) return;
    fetchData();
  }, [fetchData, loaded]);

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    if (ids.length === 0) return;
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบข้อมูล <b>${ids.length}</b> รายการ`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await Promise.allSettled(ids.map((id) => axios.delete(`/village-resources/${id}`)));
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const allTypes = Array.from(new Set(resources.map((r) => r.resourceType).filter(Boolean))) as string[];
  const filtered = filterType ? resources.filter((r) => r.resourceType === filterType) : resources;

  const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  const toolbarExtra = (
    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selCls}>
      <option value="">ทุกประเภท</option>
      {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  );

  const columns: DtColumn<VillageResource>[] = [
    { key: "villageCode",       label: "รหัสหมู่บ้าน",  onlyExport: true, exportText: (r) => r.villageCode ?? "" },
    { key: "resourceCategories",label: "หมวดหมู่",       onlyExport: true, exportText: (r) => r.resourceCategories ?? "" },
    { key: "gpsLatRaw",         label: "พิกัดละติจูด",  onlyExport: true, exportText: (r) => r.gpsLat != null ? String(r.gpsLat) : "" },
    { key: "gpsLngRaw",         label: "พิกัดลองจิจูด", onlyExport: true, exportText: (r) => r.gpsLng != null ? String(r.gpsLng) : "" },
    { key: "_createdAt",        label: "วันที่บันทึก",   onlyExport: true, exportText: (r) => r.createdAt ? r.createdAt.slice(0, 10) : "" },
    {
      key: "resourceName", label: "ชื่อทรัพยากร",
      exportText: (r) => r.resourceName ?? "",
    },
    {
      key: "resourceType", label: "ประเภท", align: "center",
      searchText: (r) => r.resourceType ?? "",
      exportText: (r) => r.resourceType ?? "",
      render: (r) => {
        if (!r.resourceType) return <span>-</span>;
        const clr = TYPE_COLORS[r.resourceType] || DEFAULT_COLOR;
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${clr.bg} ${clr.text}`}>
            {r.resourceType}
          </span>
        );
      },
    },
    {
      key: "description", label: "รายละเอียด",
      exportText: (r) => r.description ?? "",
      render: (r) => <span className="max-w-[200px] truncate block">{r.description || "-"}</span>,
    },
    {
      key: "gpsLat", label: "พิกัด GPS", align: "center", sortable: false,
      searchText: (r) => r.gpsLat != null ? `${r.gpsLat},${r.gpsLng}` : "",
      exportText: (r) => r.gpsLat != null ? `${r.gpsLat}, ${r.gpsLng}` : "",
      render: (r) => r.gpsLat != null && r.gpsLng != null ? (
        <a href={`https://maps.google.com/?q=${r.gpsLat},${r.gpsLng}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          ดูแผนที่
        </a>
      ) : <span className="text-gray-400">-</span>,
    },
    {
      key: "villageCode", label: "รหัสหมู่บ้าน", align: "center",
      exportText: (r) => r.villageCode ?? "",
      render: (r) => <span className="text-xs text-gray-500">{r.villageCode || "-"}</span>,
    },
    {
      key: "createdAt", label: "วันที่บันทึก", align: "center",
      exportText: (r) => r.createdAt ? r.createdAt.slice(0, 10) : "",
      render: (r) => <span>{r.createdAt ? r.createdAt.slice(0, 10) : "-"}</span>,
    },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (r) => (
        canEdit("/villageresource") ? (
          <a href={`/villageresource/edit?id=${r.resourceId}`}
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
    <PermissionGuard menuUrl="/villageresource">
      <ComponentCard title="">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ทรัพยากรชุมชน</h3>
        </div>
        <DataTableWrapper<VillageResource>
          data={filtered}
          columns={columns}
          idKey="resourceId"
          addUrl="/villageresource/add"
          canAdd={canAdd("/villageresource")}
          canDelete={canDelete("/villageresource")}
          canExport={true}
          onDeleteSelected={handleDeleteSelected}
          exportFilename="village_resources"
          loading={loading}
          emptyText="ไม่มีข้อมูลทรัพยากรชุมชน"
          toolbarExtra={toolbarExtra}
        />
      </ComponentCard>
    </PermissionGuard>
  );
}
