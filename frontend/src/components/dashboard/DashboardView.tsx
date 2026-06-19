"use client";
import dynamic from "next/dynamic";
import type { HouseholdMarker } from "@/components/dashboard/VillageMap";

const VillageMap = dynamic(() => import("@/components/dashboard/VillageMap"), {
  ssr: false,
  loading: () => (
    <div className="h-72 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <p className="text-sm text-gray-400">กำลังโหลดแผนที่...</p>
    </div>
  ),
});

export interface HouseholdData {
  householdId: number;
  villageId?: number;
  houseNo: string;
  moo?: string;
  houseCondition: string;
  internetAccess: boolean;
  waterSystem: string;
  remark: string;
  gpsLat?: number;
  gpsLng?: number;
}

export interface PersonData {
  personId: number;
  firstName: string;
  lastName: string;
  householdId: number;
  gender?: string;
  age?: number;
  isElderly: boolean | null;
  isDisabled: boolean | null;
  isBedridden: boolean | null;
  isSick: boolean | null;
  incomePerMonth: number | null;
  occupation: string;
}

interface ScopeBanner {
  icon: string;
  title: string;
  subtitle?: string;
  badge?: { text: string; className: string };
}

interface Props {
  households: HouseholdData[];
  persons: PersonData[];
  loading: boolean;
  scopeBanner: ScopeBanner;
}

const COLOR_MAP: Record<string, { text: string; badge: string }> = {
  emerald: { text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-50 dark:bg-emerald-900/30" },
  amber:   { text: "text-amber-600 dark:text-amber-400",     badge: "bg-amber-50 dark:bg-amber-900/30"   },
  purple:  { text: "text-purple-600 dark:text-purple-400",   badge: "bg-purple-50 dark:bg-purple-900/30"  },
  red:     { text: "text-red-600 dark:text-red-400",         badge: "bg-red-50 dark:bg-red-900/30"       },
  blue:    { text: "text-blue-600 dark:text-blue-400",       badge: "bg-blue-50 dark:bg-blue-900/30"     },
};

export default function DashboardView({ households, persons, loading, scopeBanner }: Props) {
  const totalHouseholds = households.length;
  const totalPersons    = persons.length;
  const totalElderly    = persons.filter((p) => p.isElderly   === true).length;
  const totalDisabled   = persons.filter((p) => p.isDisabled  === true).length;
  const totalBedridden  = persons.filter((p) => p.isBedridden === true).length;
  const totalPoor       = persons.filter((p) => p.incomePerMonth !== null && p.incomePerMonth < 3000).length;

  const mapMarkers: HouseholdMarker[] = households
    .filter((h) => h.gpsLat && h.gpsLng)
    .map((h) => {
      const members = persons.filter((p) => p.householdId === h.householdId);
      const hasBedridden = members.some((p) => p.isBedridden === true);
      const hasDisabled  = members.some((p) => p.isDisabled  === true);
      const hasSick      = members.some((p) => p.isSick      === true);
      const hasElderly   = members.some((p) => p.isElderly   === true);

      let healthTier = 0;
      if (hasBedridden) healthTier = 4;
      else if (hasDisabled) healthTier = 3;
      else if (hasSick) healthTier = 2;
      else if (hasElderly) healthTier = 1;

      return {
        householdId: h.householdId,
        houseNo: h.houseNo,
        moo: h.moo,
        lat: h.gpsLat!,
        lng: h.gpsLng!,
        healthTier,
        hasBedridden,
        hasDisabled,
        hasElderly,
        villageId: h.villageId,
      };
    });

  const kpiCards = [
    { label: "ครัวเรือนทั้งหมด", value: totalHouseholds, icon: "🏠",       color: "emerald", sub: "หลังคาเรือน" },
    { label: "ประชากรทั้งหมด",   value: totalPersons,    icon: "👨‍👩‍👧‍👦", color: "emerald", sub: "คน" },
    { label: "ผู้สูงอายุ",       value: totalElderly,    icon: "👴",       color: "amber",   sub: "คน (60 ปีขึ้นไป)" },
    { label: "ผู้พิการ",         value: totalDisabled,   icon: "♿",       color: "purple",  sub: "คน" },
    { label: "ผู้ป่วยติดเตียง",  value: totalBedridden,  icon: "🏥",       color: "red",     sub: "คน" },
    { label: "ครัวเรือนยากจน",   value: totalPoor,       icon: "📉",       color: "red",     sub: "หลังคาเรือน (< 3,000/เดือน)" },
  ];

  return (
    <div className="space-y-5">
      {/* Scope Banner */}
      <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-lg">
            {scopeBanner.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{scopeBanner.title}</p>
            {scopeBanner.subtitle && <p className="text-xs text-gray-400">{scopeBanner.subtitle}</p>}
          </div>
        </div>
        {scopeBanner.badge && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${scopeBanner.badge.className}`}>
            {scopeBanner.badge.text}
          </span>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {kpiCards.map((card) => {
          const c = COLOR_MAP[card.color];
          return (
            <div key={card.label} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${c.badge}`}>{card.icon}</div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                {loading ? (
                  <div className="h-7 w-14 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-1" />
                ) : (
                  <p className={`text-2xl font-bold ${c.text}`}>{card.value.toLocaleString()}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
