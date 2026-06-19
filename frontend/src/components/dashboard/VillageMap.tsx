"use client";
import React from "react";
import dynamic from "next/dynamic";

export interface HouseholdMarker {
  householdId: number;
  houseNo: string;
  moo?: string;
  lat: number;
  lng: number;
  healthTier: number;
  houseImageUrl?: string;
  villageId?: number;
  villageName?: string;
}

export function tierColor(tier: number): string {
  if (tier >= 4) return "#ef4444";
  if (tier >= 3) return "#f97316";
  if (tier >= 2) return "#eab308";
  if (tier >= 1) return "#3b82f6";
  return "#10b981";
}

export function tierLabel(tier: number): string {
  if (tier >= 4) return "ติดเตียง";
  if (tier >= 3) return "พิการ";
  if (tier >= 2) return "ป่วยเรื้อรัง";
  if (tier >= 1) return "ผู้สูงอายุ";
  return "ปกติ";
}

interface Props {
  markers: HouseholdMarker[];
}

const LeafletMap = dynamic(() => import("./VillageMapLeaflet"), { ssr: false });
const GoogleMap  = dynamic(() => import("./VillageMapGoogle"),  { ssr: false });

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const LEGEND_ITEMS = [
  { cls: "bg-emerald-500", label: "ปกติ" },
  { cls: "bg-blue-500",    label: "ผู้สูงอายุ" },
  { cls: "bg-yellow-400",  label: "ป่วยเรื้อรัง" },
  { cls: "bg-orange-500",  label: "พิการ" },
  { cls: "bg-red-500",     label: "ติดเตียง" },
];

function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-xs">
      <span className="font-semibold text-gray-500 dark:text-gray-400">สัญลักษณ์:</span>
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-full ${item.cls} inline-block flex-shrink-0`} />
          <span className="text-gray-600 dark:text-gray-300 font-medium">{item.label}</span>
        </span>
      ))}
    </div>
  );
}

export default function VillageMap({ markers }: Props) {
  if (markers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center p-6">
        <span className="text-4xl mb-3">&#x1F5FA;&#xFE0F;</span>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ไม่มีครัวเรือนที่มีข้อมูล GPS</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">กรุณาระบุ gps_lat / gps_lng ในครัวเรือน</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <MapLegend />
      {GOOGLE_MAPS_API_KEY ? (
        <GoogleMap markers={markers} apiKey={GOOGLE_MAPS_API_KEY} />
      ) : (
        <LeafletMap markers={markers} />
      )}
    </div>
  );
}
