"use client"
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
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

interface HouseholdData {
  householdId: number;
  houseNo: string;
  moo?: string;
  houseCondition: string;
  internetAccess: boolean;
  waterSystem: string;
  remark: string;
  gpsLat?: number;
  gpsLng?: number;
}

interface PersonData {
  personId: number;
  firstName: string;
  lastName: string;
  householdId: number;
  isElderly: boolean | null;
  isDisabled: boolean | null;
  isBedridden: boolean | null;
  isSick: boolean | null;
  incomePerMonth: number | null;
  occupation: string;
}

interface KpiItem {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  sub: string;
  mock?: boolean;
}

interface Alert {
  level: "red" | "orange" | "yellow";
  message: string;
}

export default function Dashboard() {
  const [households, setHouseholds] = useState<HouseholdData[]>([]);
  const [persons, setPersons] = useState<PersonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKpiModal, setShowKpiModal] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);

  useEffect(() => {
    document.title = "Smart Village | Dashboard";
    Promise.all([
      axios.get<HouseholdData[]>("/households"),
      axios.get<PersonData[]>("/persons"),
    ])
      .then(([hRes, pRes]) => {
        setHouseholds(hRes.data);
        setPersons(pRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalHouseholds = households.length;
  const totalPersons = persons.length;
  const totalElderly = persons.filter((p) => p.isElderly === true).length;
  const totalDisabled = persons.filter((p) => p.isDisabled === true).length;
  const totalBedridden = persons.filter((p) => p.isBedridden === true).length;
  const totalPoor = persons.filter((p) => p.incomePerMonth !== null && p.incomePerMonth < 3000).length;
  const internetPct = households.length > 0
    ? Math.round((households.filter((h) => h.internetAccess).length / households.length) * 100)
    : 0;

  const mapMarkers: HouseholdMarker[] = households
    .filter((h) => h.gpsLat && h.gpsLng)
    .map((h) => {
      const members = persons.filter((p) => p.householdId === h.householdId);
      return {
        householdId: h.householdId,
        houseNo: h.houseNo,
        moo: h.moo,
        lat: h.gpsLat!,
        lng: h.gpsLng!,
        hasBedridden: members.some((p) => p.isBedridden === true),
        hasDisabled: members.some((p) => p.isDisabled === true),
        hasElderly: members.some((p) => p.isElderly === true),
      };
    });

  // KPI ทั้งหมด
  const allKpi: KpiItem[] = [
    { label: "ครัวเรือนทั้งหมด", value: totalHouseholds, icon: "🏠", color: "emerald", sub: "หลังคาเรือน" },
    { label: "ประชากรทั้งหมด", value: totalPersons, icon: "👨‍👩‍👧‍👦", color: "emerald", sub: "คน" },
    { label: "ผู้สูงอายุ", value: totalElderly, icon: "👴", color: "amber", sub: "คน (60 ปีขึ้นไป)" },
    { label: "ผู้พิการ", value: totalDisabled, icon: "♿", color: "purple", sub: "คน" },
    { label: "ผู้ป่วยติดเตียง", value: totalBedridden, icon: "🏥", color: "red", sub: "คน" },
    { label: "ครัวเรือนยากจน", value: totalPoor, icon: "📉", color: "red", sub: "หลังคาเรือน (< 3,000/เดือน)" },
    { label: "อสม.", value: 12, icon: "💊", color: "blue", sub: "คน", mock: true },
    { label: "อปพร.", value: 8, icon: "🛡️", color: "blue", sub: "คน", mock: true },
  ];

  // แสดงแค่ 3 ใบบนสุด
  const topKpi = allKpi.slice(0, 3);

  const alerts: Alert[] = [
    { level: "red", message: "ผู้ป่วยติดเตียง 3 ราย ไม่ได้รับการเยี่ยมเกิน 30 วัน" },
    { level: "orange", message: "ผู้สูงอายุ 5 ราย ครบกำหนดติดตามสุขภาพ" },
    { level: "red", message: "ครัวเรือนยากจนเพิ่มขึ้นจากเดือนที่แล้ว" },
    { level: "yellow", message: "ข้อมูลบุคคล 8 รายยังไม่สมบูรณ์" },
  ];

  const colorMap: Record<string, { bg: string; text: string; badge: string; icon: string }> = {
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-50 dark:bg-emerald-900/30", icon: "text-emerald-500" },
    amber:   { bg: "bg-amber-400",   text: "text-amber-600 dark:text-amber-400",   badge: "bg-amber-50 dark:bg-amber-900/30",   icon: "text-amber-500" },
    purple:  { bg: "bg-purple-500",  text: "text-purple-600 dark:text-purple-400",  badge: "bg-purple-50 dark:bg-purple-900/30",  icon: "text-purple-500" },
    red:     { bg: "bg-red-500",     text: "text-red-600 dark:text-red-400",     badge: "bg-red-50 dark:bg-red-900/30",     icon: "text-red-500" },
    blue:    { bg: "bg-blue-500",    text: "text-blue-600 dark:text-blue-400",    badge: "bg-blue-50 dark:bg-blue-900/30",    icon: "text-blue-500" },
  };

  const alertStyle = {
    red:    { border: "border-red-200 dark:border-red-800",    bg: "bg-red-50 dark:bg-red-900/20",    dot: "bg-red-500",    text: "text-red-700 dark:text-red-300" },
    orange: { border: "border-orange-200 dark:border-orange-800", bg: "bg-orange-50 dark:bg-orange-900/20", dot: "bg-orange-400", text: "text-orange-700 dark:text-orange-300" },
    yellow: { border: "border-yellow-200 dark:border-yellow-800", bg: "bg-yellow-50 dark:bg-yellow-900/20", dot: "bg-yellow-400", text: "text-yellow-700 dark:text-yellow-300" },
  };

  return (
    <div className="space-y-5">

      {/* ===== AI SUMMARY — หุบได้ ===== */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowAiSummary(!showAiSummary)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">AI วิเคราะห์ชุมชน</span>
            {!showAiSummary && !loading && (
              <span className="text-xs text-gray-400 ml-1">
                — {totalPersons} คน · {totalHouseholds} ครัวเรือน · ผู้สูงอายุ {totalElderly} คน
              </span>
            )}
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showAiSummary ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAiSummary && (
          <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800">
            {loading ? (
              <div className="space-y-2 pt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ width: `${80 - i * 10}%` }} />
                ))}
              </div>
            ) : (
              <ul className="space-y-2 pt-4">
                <li className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <span className="text-emerald-500 font-bold text-sm mt-0.5">•</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    หมู่บ้านมีประชากรทั้งหมด <strong>{totalPersons.toLocaleString()} คน</strong> ใน <strong>{totalHouseholds} ครัวเรือน</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                  <span className="text-amber-500 font-bold text-sm mt-0.5">•</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    ผู้สูงอายุ <strong>{totalElderly} คน</strong> คิดเป็น <strong>{totalPersons > 0 ? ((totalElderly / totalPersons) * 100).toFixed(1) : 0}%</strong> ของประชากรทั้งหมด
                  </span>
                </li>
                {totalBedridden > 0 && (
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <span className="text-red-500 font-bold text-sm mt-0.5">•</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      ผู้ป่วยติดเตียง <strong>{totalBedridden} ราย</strong> ต้องการการดูแลเป็นพิเศษและการเยี่ยมบ้านสม่ำเสมอ
                    </span>
                  </li>
                )}
                {totalPoor > 0 && (
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                    <span className="text-orange-500 font-bold text-sm mt-0.5">•</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      ครัวเรือนที่มีรายได้ต่ำกว่า 3,000 บาท/เดือน จำนวน <strong>{totalPoor} หลังคาเรือน</strong> ควรติดตามสวัสดิการ
                    </span>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ===== KPI TOP 3 + Village Index ===== */}
      <div className="grid grid-cols-12 gap-4">
        {/* KPI 3 ใบ */}
        <div className="col-span-12 xl:col-span-9">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ตัวชี้วัดหลัก (KPI)
            </h2>
            <button
              onClick={() => setShowKpiModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              ดูทั้งหมด ({allKpi.length})
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topKpi.map((card) => {
              const c = colorMap[card.color];
              return (
                <div key={card.label} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${c.badge}`}>
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                    {loading ? (
                      <div className="h-7 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-1" />
                    ) : (
                      <p className={`text-2xl font-bold ${c.text}`}>
                        {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{card.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Village Index — ขวา */}
        <div className="col-span-12 xl:col-span-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col items-center justify-center mt-8 xl:mt-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Village Index</p>
          <div className="relative flex items-center justify-center my-2">
            <svg width="110" height="110" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="#f3f4f6" strokeWidth="12" />
              <circle cx="70" cy="70" r="58" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58 * 0.72} ${2 * Math.PI * 58}`}
                strokeDashoffset={2 * Math.PI * 58 * 0.25}
                transform="rotate(-90 70 70)" />
            </svg>
            <div className="absolute text-center">
              <p className="text-2xl font-bold text-emerald-600">72</p>
              <p className="text-[10px] text-gray-400">/ 100</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-emerald-600">🟢 เข้มแข็ง</p>
        </div>
      </div>

      {/* ===== แผนที่ + แจ้งเตือน ===== */}
      <div className="grid grid-cols-12 gap-5">

        {/* แผนที่ */}
        <div className="col-span-12 xl:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              แผนที่หมู่บ้าน
            </h2>
          </div>
          <VillageMap markers={mapMarkers} />
        </div>

        {/* แจ้งเตือน */}
        <div className="col-span-12 xl:col-span-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            การแจ้งเตือน
          </h2>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-3">
            {alerts.map((alert, i) => {
              const s = alertStyle[alert.level];
              return (
                <div key={i} className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${s.bg} ${s.border}`}>
                  <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <p className={`text-xs font-medium leading-relaxed ${s.text}`}>{alert.message}</p>
                </div>
              );
            })}
            <p className="text-center text-xs text-gray-400 pt-1">แจ้งเตือนอัตโนมัติ — mock data</p>
          </div>
        </div>
      </div>

      {/* ===== KPI MODAL ===== */}
      {showKpiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowKpiModal(false); }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-gray-100 dark:border-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">ตัวชี้วัดทั้งหมด</h3>
                <p className="text-xs text-gray-400 mt-0.5">Smart Village KPI Overview</p>
              </div>
              <button
                onClick={() => setShowKpiModal(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allKpi.map((card) => {
                const c = colorMap[card.color];
                return (
                  <div key={card.label} className={`rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center relative ${card.mock ? "opacity-70" : ""}`}>
                    {card.mock && (
                      <span className="absolute top-1.5 right-1.5 text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-400 rounded px-1">mock</span>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-2 ${c.badge}`}>
                      {card.icon}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 leading-tight">{card.label}</p>
                    {loading ? (
                      <div className="h-6 w-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mx-auto" />
                    ) : (
                      <p className={`text-2xl font-bold ${c.text}`}>
                        {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{card.sub}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setShowKpiModal(false)}
                className="px-5 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
