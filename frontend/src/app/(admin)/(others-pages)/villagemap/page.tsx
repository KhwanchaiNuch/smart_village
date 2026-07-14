"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import axios from "@/lib/axios";
import { useVillage } from "@/context/VillageContext";
import { useGeoScope } from "@/context/GeoScopeContext";
import PermissionGuard from "@/components/common/PermissionGuard";
import type { HouseholdMarker } from "@/components/dashboard/VillageMap";

const VillageMap = dynamic(() => import("@/components/dashboard/VillageMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[700px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center">
      <p className="text-sm text-gray-400">กำลังโหลดแผนที่...</p>
    </div>
  ),
});

interface MapMarkerRaw {
  household_id: number;
  house_no: string;
  moo?: string;
  gps_lat?: number;
  gps_lng?: number;
  house_image_url?: string;
  health_tier: number;
  village_id?: number;
  village_name?: string;
}

const TIER_CONFIG = [
  { cls: "bg-emerald-500", label: "ปกติ" },
  { cls: "bg-blue-500",    label: "ผู้สูงอายุ" },
  { cls: "bg-yellow-400",  label: "ป่วยเรื้อรัง" },
  { cls: "bg-orange-500",  label: "พิการ" },
  { cls: "bg-red-500",     label: "ติดเตียง" },
];

function VillageMapPageContent() {
  const { village, loaded } = useVillage();
  const { activeVillageId, activeTambonId, activeAmphurId, activeProvinceId } = useGeoScope();
  const [rawData, setRawData] = useState<MapMarkerRaw[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!loaded) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeVillageId)         params.villageId  = String(activeVillageId);
      else if (activeTambonId)     params.tambonId   = String(activeTambonId);
      else if (activeAmphurId)     params.amphurId   = String(activeAmphurId);
      else if (activeProvinceId)   params.provinceId = String(activeProvinceId);
      else if (village?.villageId) params.villageId  = String(village.villageId);

      const res = await axios.get<MapMarkerRaw[]>("/households/map-markers", { params });
      setRawData(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [loaded, village, activeVillageId, activeTambonId, activeAmphurId, activeProvinceId]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | แผนที่หมู่บ้าน";
    fetchData();
  }, [fetchData]);

  const mapMarkers: HouseholdMarker[] = useMemo(
    () =>
      rawData
        .filter((h) => h.gps_lat && h.gps_lng)
        .map((h) => ({
          householdId:   h.household_id,
          houseNo:       h.house_no,
          moo:           h.moo ?? "",
          lat:           h.gps_lat!,
          lng:           h.gps_lng!,
          healthTier:    Number(h.health_tier ?? 0),
          houseImageUrl: h.house_image_url ?? undefined,
          villageId:     h.village_id,
          villageName:   h.village_name ?? "",
        })),
    [rawData]
  );

  const withoutGps = rawData.length - mapMarkers.length;
  const counts = [
    mapMarkers.filter((m) => m.healthTier === 0).length,
    mapMarkers.filter((m) => m.healthTier === 1).length,
    mapMarkers.filter((m) => m.healthTier === 2).length,
    mapMarkers.filter((m) => m.healthTier === 3).length,
    mapMarkers.filter((m) => m.healthTier >= 4).length,
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            แผนที่หมู่บ้าน
            {village?.villageName && (
              <span className="ml-2 text-base font-normal text-gray-400">
                {village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            คลิกที่หมุดเพื่อดูรายละเอียดหรือแก้ไขข้อมูลครัวเรือน
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          โหลดใหม่
        </button>
      </div>

      {/* Map */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-[700px] bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
            <p className="text-sm text-gray-400">กำลังโหลดแผนที่...</p>
          </div>
        ) : (
          <VillageMap markers={mapMarkers} />
        )}
      </div>

      {/* Legend + counts */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">รายละเอียดสีสัญลักษณ์</p>
        <div className="flex flex-wrap gap-x-8 gap-y-2.5">
          {TIER_CONFIG.map((t, i) => (
            <div key={t.label} className="flex items-center gap-2.5">
              <span className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm flex-shrink-0 ${t.cls}`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t.label} <span className="text-gray-400">({counts[i]})</span>
              </span>
            </div>
          ))}
          {withoutGps > 0 && (
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-gray-300 border-2 border-white shadow-sm flex-shrink-0" />
              <span className="text-sm text-gray-400">ไม่มีข้อมูล GPS ({withoutGps} หลัง)</span>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-gray-400">ดับเบิลคลิกที่หมุดเพื่อดูรายละเอียด • คลิกครั้งเดียวเพื่อไปหน้าแก้ไขรายละเอียดครัวเรือน</p>
      </div>
    </div>
  );
}

export default function VillageMapPage() {
  return (
    <PermissionGuard menuUrl="/household">
      <VillageMapPageContent />
    </PermissionGuard>
  );
}
