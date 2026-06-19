"use client"
import { useEffect, useMemo, useState } from "react";
import { useVillage } from "@/context/VillageContext";
import { useGeoScope } from "@/context/GeoScopeContext";
import axios from "@/lib/axios";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="h-52 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />,
});

// ── Interfaces ──────────────────────────────────────────────────────────────
interface HouseholdData {
  householdId: number; houseNo: string; moo?: string;
  houseCondition: string; internetAccess: boolean;
  electricityAccess?: boolean;
  waterSystem: string; remark: string;
}

interface PopStats {
  totalPersons: number;
  totalElderly: number;
  totalDisabled: number;
  totalBedridden: number;
  children03: number;
  populationByYear: { year: string; male: number; female: number }[];
  ageGroups: { label: string; male: number; female: number; other: number }[];
}

interface IssuesSummary {
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  otherCount: number;
  totalCount: number;
  pendingList: {
    id: number; issueType?: string; status?: string;
    severity?: number; area?: string; createdAt?: string;
    imageUrl?: string;
  }[];
}

interface VisitStats {
  visitsThisMonth: number;
  recentVisits: {
    id: number; visitReason?: string; visitor?: string; visitDate?: string;
  }[];
}

interface IncomeSummary {
  totalPoor: number;
  incomeHistory: { year: string; total: number }[];
}

interface HealthIndex {
  total: number; sickScore: number; recordScore: number; visitScore: number;
  totalPersons: number; sickCount: number; atRiskCount: number; visitedCount: number; hrCoveredCount: number;
}

interface ActionableData {
  overdueHouseholds: {
    householdId: number; houseNo: string; moo?: string;
    hasBedridden: boolean; hasElderlyAlone: boolean;
    lastVisitDate?: string; daysSinceVisit?: number | null;
  }[];
  stalledIssues: {
    id: number; issueType?: string; status?: string;
    severity?: number; area?: string; daysStalled?: number | null;
  }[];
}

// ── Constants ───────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, { text: string; badge: string; border: string }> = {
  emerald: { text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-50 dark:bg-emerald-900/30", border: "border-l-emerald-400" },
  amber: { text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-50 dark:bg-amber-900/30", border: "border-l-amber-400" },
  purple: { text: "text-purple-600 dark:text-purple-400", badge: "bg-purple-50 dark:bg-purple-900/30", border: "border-l-purple-400" },
  red: { text: "text-red-600 dark:text-red-400", badge: "bg-red-50 dark:bg-red-900/30", border: "border-l-red-400" },
  blue: { text: "text-blue-600 dark:text-blue-400", badge: "bg-blue-50 dark:bg-blue-900/30", border: "border-l-blue-400" },
  orange: { text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-50 dark:bg-orange-900/30", border: "border-l-orange-400" },
  indigo: { text: "text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-50 dark:bg-indigo-900/30", border: "border-l-indigo-400" },
  teal: { text: "text-teal-600 dark:text-teal-400", badge: "bg-teal-50 dark:bg-teal-900/30", border: "border-l-teal-400" },
};

export default function Dashboard() {
  const { village } = useVillage();
  const { 
    activeVillageId, 
    activeTambonId, 
    activeAmphurId, 
    activeProvinceId,
    villages,
    tambons,
    amphurs,
    provinces
  } = useGeoScope();
  const [households, setHouseholds] = useState<HouseholdData[]>([]);
  const [popStats, setPopStats] = useState<PopStats>({
    totalPersons: 0, totalElderly: 0, totalDisabled: 0, totalBedridden: 0,
    children03: 0, populationByYear: [], ageGroups: [],
  });
  const [villageIndex, setVillageIndex] = useState({
    total: 0, incomeScore: 0, employmentScore: 0,
    housingScore: 0, elderlyAloneScore: 0, healthScore: 0, utilitiesScore: 0,
  });
  const [actionable, setActionable] = useState<ActionableData>({ overdueHouseholds: [], stalledIssues: [] });
  const [actionTab, setActionTab] = useState(0);
  const [issuesSummary, setIssuesSummary] = useState<IssuesSummary>({
    openCount: 0, inProgressCount: 0, resolvedCount: 0, otherCount: 0, totalCount: 0, pendingList: [],
  });
  const [visitStats, setVisitStats] = useState<VisitStats>({ visitsThisMonth: 0, recentVisits: [] });
  const [incomeSummary, setIncomeSummary] = useState<IncomeSummary>({ totalPoor: 0, incomeHistory: [] });
  const [healthIndex, setHealthIndex] = useState<HealthIndex>({
    total: 0, sickScore: 0, recordScore: 0, visitScore: 0,
    totalPersons: 0, sickCount: 0, atRiskCount: 0, visitedCount: 0, hrCoveredCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const resolvedGeo = useMemo(() => {
    const effectiveVillageId = activeVillageId ?? village?.villageId ?? null;
    if (!effectiveVillageId) return null;
    const v = villages.find((x) => x.villageId === effectiveVillageId);
    if (!v) return null;

    const t = tambons.find((x) => x.tambonId === v.tambonId);
    const a = t ? amphurs.find((x) => x.amphurId === t.amphurId) : null;
    const p = a ? provinces.find((x) => x.provinceId === a.provinceId) : null;

    return {
      villageName: v.villageName,
      moo: v.moo || "-",
      tambonName: t?.nameTh || "-",
      amphurName: a?.nameTh || "-",
      provinceName: p?.nameTh || "-",
    };
  }, [activeVillageId, village, villages, tambons, amphurs, provinces]);

  useEffect(() => { document.title = "Smart Village | Dashboard"; }, []);

 useEffect(() => {
  const effectiveVillageId = activeVillageId ?? village?.villageId ?? null;
  const params: Record<string, number> = {};
  
  if (effectiveVillageId)  params.villageId  = effectiveVillageId;
  if (activeTambonId)      params.tambonId   = activeTambonId;
  if (activeAmphurId)      params.amphurId   = activeAmphurId;
  if (activeProvinceId)    params.provinceId = activeProvinceId;

  setLoading(true);
  Promise.all([
    // ✅ เพิ่มพารามิเตอร์ params เข้าไปด้วยเพื่อให้ดึงข้อมูลครัวเรือนตาม Scope พื้นที่ได้ถูกต้อง
    axios.get<HouseholdData[]>("/households", { params }), 
    axios.get<PopStats>("/dashboard/population", { params }),
    axios.get("/dashboard/village-index", { params }),
    axios.get<ActionableData>("/dashboard/actionable", { params }),
    axios.get<IssuesSummary>("/dashboard/issues-summary", { params }),
    axios.get<VisitStats>("/dashboard/visit-stats", { params }),
    axios.get<IncomeSummary>("/dashboard/income-summary", { params }),
    axios.get<HealthIndex>("/dashboard/health-index", { params }),
  ])
    .then(([hR, popR, viR, acR, isR, vsR, incR, hiR]) => {
      setHouseholds(hR.data);
      setPopStats(popR.data);
      setVillageIndex(viR.data);
      setActionable(acR.data);
      setIssuesSummary(isR.data);
      setVisitStats(vsR.data);
      setIncomeSummary(incR.data);
      setHealthIndex(hiR.data);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, [village, activeVillageId, activeTambonId, activeAmphurId, activeProvinceId]);

  // ── Derived KPIs ─────────────────────────────────────────────────────────
  const totalHouseholds = households.length;
  const totalPersons = popStats.totalPersons;
  const totalElderly = popStats.totalElderly;
  const totalDisabled = popStats.totalDisabled;
  const totalBedridden = popStats.totalBedridden;
  const children03 = popStats.children03;

  const openIssues = issuesSummary.openCount;
  const inProgressIssues = issuesSummary.inProgressCount;
  const resolvedIssues = issuesSummary.resolvedCount;
  const otherIssues = issuesSummary.otherCount;

  // ── Chart data ────────────────────────────────────────────────────────────
  const popYears = popStats.populationByYear;
  const ageData = popStats.ageGroups;
  const incomeData = incomeSummary.incomeHistory;

  const issueSlices = useMemo(() => {
    const all = [
      { label: "ยังไม่แก้", count: openIssues, color: "#ef4444" },
      { label: "กำลังดำเนินการ", count: inProgressIssues, color: "#f59e0b" },
      { label: "แก้ไขแล้ว", count: resolvedIssues, color: "#10b981" },
      { label: "อื่นๆ", count: otherIssues, color: "#9ca3af" },
    ];
    const filtered = all.filter(s => s.count > 0);
    return filtered.length > 0 ? filtered : [{ label: "ไม่มีข้อมูล", count: 1, color: "#e5e7eb" }];
  }, [openIssues, inProgressIssues, resolvedIssues, otherIssues]);

  // ── Health Index derived ───────────────────────────────────────────────────
  const hiScore = healthIndex.total;
  const hiColor = hiScore >= 80 ? "#10b981" : hiScore >= 60 ? "#f59e0b" : "#ef4444";
  const hiLabel = hiScore >= 80 ? "สุขภาพดี" : hiScore >= 60 ? "ปานกลาง" : "ต้องดูแล";
  const hiBreakdown = [
    { label: "คนไม่ป่วย/ติดเตียง", value: healthIndex.sickScore, max: 40, color: "bg-teal-400" },
    { label: "ความครอบคลุมประวัติสุขภาพ", value: healthIndex.recordScore, max: 40, color: "bg-blue-400" },
    { label: "เยี่ยมบ้านกลุ่มเสี่ยง", value: healthIndex.visitScore, max: 20, color: "bg-amber-400" },
  ];

  const kpiCards = [
    { label: "ครัวเรือนทั้งหมด", value: totalHouseholds, color: "emerald", sub: "หลังคาเรือน" },
    { label: "ประชากรทั้งหมด", value: totalPersons, color: "emerald", sub: "คน" },
    { label: "เด็กอายุ 0–3 ปี", value: children03, color: "blue", sub: "คน" },
    { label: "ผู้สูงอายุ", value: totalElderly, color: "amber", sub: "คน (60 ปีขึ้นไป)" },
    { label: "ผู้พิการ", value: totalDisabled, color: "purple", sub: "คน" },
    { label: "ผู้ป่วยติดเตียง", value: totalBedridden, color: "red", sub: "คน" },
  ];

  const villageScore = villageIndex.total;
  const scoreColor = villageScore >= 80 ? "#10b981" : villageScore >= 60 ? "#f59e0b" : "#ef4444";
  const scoreLabel = villageScore >= 80 ? "เข้มแข็ง" : villageScore >= 60 ? "พัฒนาได้" : "ต้องดูแล";

  const breakdown = [
    { label: "รายได้ครัวเรือน", value: villageIndex.incomeScore, color: "bg-emerald-400" },
    { label: "การจ้างงาน", value: villageIndex.employmentScore, color: "bg-blue-400" },
    { label: "สภาพบ้าน", value: villageIndex.housingScore, color: "bg-amber-400" },
    { label: "ผู้สูงอายุอยู่ลำพัง", value: villageIndex.elderlyAloneScore, color: "bg-purple-400" },
    { label: "สุขภาพประชาชน", value: villageIndex.healthScore, color: "bg-red-400" },
    { label: "สาธารณูปโภค", value: villageIndex.utilitiesScore, color: "bg-indigo-400" },
  ];

  // ── Chart options ──────────────────────────────────────────────────────────
  const popYearOpts: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    colors: ["#3b82f6", "#f472b6"],
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 4, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 3, colors: ["transparent"] },
    xaxis: {
      categories: popYears.map((r) => r.year),
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: "#9ca3af", fontSize: "11px" } },
    },
    yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "11px" }, formatter: (v: number) => `${Math.round(v)}` } },
    legend: { show: true, position: "top", horizontalAlign: "left", labels: { colors: "#6b7280" } },
    grid: { borderColor: "#f3f4f6", yaxis: { lines: { show: true } } },
    tooltip: { y: { formatter: (v: number) => `${v} คน` } },
    fill: { opacity: 1 },
  };
  const popYearSeries = [
    { name: "ชาย", data: popYears.map((r) => r.male) },
    { name: "หญิง", data: popYears.map((r) => r.female) },
  ];

  const ageOpts: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    colors: ["#3b82f6", "#f472b6"],
    plotOptions: { bar: { horizontal: true, barHeight: "60%", borderRadius: 3, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ageData.map((g) => g.label),
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: "#9ca3af", fontSize: "11px" } },
    },
    yaxis: { labels: { style: { colors: "#6b7280", fontSize: "12px" } } },
    legend: { show: true, position: "top", horizontalAlign: "left", labels: { colors: "#6b7280" } },
    grid: { borderColor: "#f3f4f6", xaxis: { lines: { show: true } } },
    tooltip: { y: { formatter: (v: number) => `${v} คน` } },
  };
  const ageSeries = [
    { name: "ชาย", data: ageData.map((g) => g.male) },
    { name: "หญิง", data: ageData.map((g) => g.female) },
  ];

  const incomeOpts: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, background: "transparent" },
    colors: ["#10b981"],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0.0 } },
    markers: { size: 4, colors: ["#10b981"], strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: incomeData.map((r) => r.year),
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: "#9ca3af", fontSize: "11px" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af", fontSize: "11px" },
        formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`,
      },
    },
    grid: { borderColor: "#f3f4f6", yaxis: { lines: { show: true } } },
    tooltip: { y: { formatter: (v: number) => `฿${v.toLocaleString()}` } },
  };
  const incomeSeries = [{ name: "รายได้รวม (บาท)", data: incomeData.map((r) => Number(r.total)) }];

  const issueOpts = useMemo((): ApexOptions => ({
    chart: { type: "donut", toolbar: { show: false } },
    labels: issueSlices.map(s => s.label),
    colors: issueSlices.map(s => s.color),
    legend: { position: "bottom", fontSize: "12px" },
    plotOptions: { pie: { donut: { size: "65%" } } },
    dataLabels: { enabled: true, formatter: (v: number) => `${v.toFixed(0)}%` },
    tooltip: { y: { formatter: (v: number) => `${v} รายการ` } },
  }), [issueSlices]);

  return (
    <div className="space-y-5">
      {/* Dashboard Scope Header Banner */}
      {resolvedGeo && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              หมู่บ้าน{resolvedGeo.villageName}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              หมู่ที่ {resolvedGeo.moo} ตำบล{resolvedGeo.tambonName} อำเภอ{resolvedGeo.amphurName} จังหวัด{resolvedGeo.provinceName}
            </p>
          </div>
          <a
            href={`/report?villageId=${activeVillageId ?? village?.villageId}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 hover:bg-black dark:bg-gray-100 dark:hover:bg-white px-4 py-2.5 text-xs font-semibold text-white dark:text-gray-900 shadow-theme-xs transition-colors whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.821V21m0 0H18m-11.28 0h3.96m0 0V13.821m0 0h4.86M18 10.179V21m0 0H18m0 0h1.8M18 21h-2.1m0 0V10.179M3 10.179h18M6.72 6.72h10.56M12 3v3.72" />
            </svg>
            พิมพ์รายงานสรุป (PDF)
          </a>
        </div>
      )}

      {/* ===== ตัวชี้วัดหลัก + ดัชนี ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">ตัวชี้วัดหลัก</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px_360px] gap-4">
          <div className="grid grid-cols-2 gap-3">
            {kpiCards.map((card) => {
              const c = COLOR_MAP[card.color] ?? COLOR_MAP["emerald"];
              return (
                <div key={card.label} className={`rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 border-l-4 ${c.border} shadow-sm p-4 flex flex-col gap-0.5`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                  {loading ? (
                    <div className="h-7 w-14 bg-gray-100 dark:bg-gray-800 rounded animate-pulse my-1" />
                  ) : (
                    <p className={`text-2xl font-bold ${c.text}`}>{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
                  )}
                  <p className="text-xs text-gray-400 truncate">{card.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Health Index panel */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-3">ดัชนีสุขภาพ</p>
            <div className="flex flex-col items-center mb-3">
              <div className="relative flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#f3f4f6" className="dark:stroke-gray-800" strokeWidth="12" />
                  <circle cx="70" cy="70" r="58" fill="none" stroke={hiColor} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - (loading ? 0 : hiScore) / 100)}
                    transform="rotate(-90 70 70)"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-xl font-bold" style={{ color: hiColor }}>{loading ? "—" : hiScore}</p>
                  <p className="text-[9px] text-gray-400">/ 100</p>
                </div>
              </div>
              <p className="text-xs font-semibold mt-1" style={{ color: hiColor }}>{loading ? "..." : hiLabel}</p>
            </div>
            <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-2.5">
              {hiBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{item.label}</span>
                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 ml-1 flex-shrink-0">
                      {loading ? "—" : `${item.value}/${item.max}`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                      style={{ width: loading ? "0%" : `${Math.min((item.value / item.max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Village Index panel */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-3">ดัชนีหมู่บ้าน</p>
            <div className="flex flex-col items-center mb-3">
              <div className="relative flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#f3f4f6" className="dark:stroke-gray-800" strokeWidth="12" />
                  <circle cx="70" cy="70" r="58" fill="none" stroke={scoreColor} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - (loading ? 0 : villageScore) / 100)}
                    transform="rotate(-90 70 70)"
                    className="transition-all duration-700 ease-out" 
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-xl font-bold" style={{ color: scoreColor }}>{loading ? "—" : villageScore}</p>
                  <p className="text-[9px] text-gray-400">/ 100</p>
                </div>
              </div>
              <p className="text-xs font-semibold mt-1" style={{ color: scoreColor }}>{loading ? "..." : scoreLabel}</p>
            </div>
            <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-2.5">
              {breakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{item.label}</span>
                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 ml-1 flex-shrink-0">{loading ? "—" : `${item.value}`}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                      style={{ width: loading ? "0%" : `${Math.min(item.value, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== ต้องดำเนินการ ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ต้องดำเนินการ</h2>
          {!loading && (actionable.overdueHouseholds.length + actionable.stalledIssues.length) > 0 && (
            <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
              {actionable.overdueHouseholds.length + actionable.stalledIssues.length} รายการ
            </span>
          )}
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            <button onClick={() => setActionTab(0)}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${actionTab === 0
                ? "border-b-2 border-red-500 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}>
              <span>ต้องเยี่ยมบ้าน</span>
              {!loading && actionable.overdueHouseholds.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                  {actionable.overdueHouseholds.length}
                </span>
              )}
            </button>
            <button onClick={() => setActionTab(1)}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${actionTab === 1
                ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}>
              <span>ปัญหาค้างนาน</span>
              {!loading && actionable.stalledIssues.length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                  {actionable.stalledIssues.length}
                </span>
              )}
            </button>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
              </div>
            ) : actionTab === 0 ? (
              actionable.overdueHouseholds.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">ไม่มีครัวเรือนที่ค้างการเยี่ยม 🎉</div>
              ) : (
                <div className="space-y-2">
                  {actionable.overdueHouseholds.map((hh) => (
                    <div key={hh.householdId} className="flex items-center gap-3 p-3 rounded-xl bg-red-50/60 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                      <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-base flex-shrink-0">
                        {hh.hasBedridden ? "🏥" : "👴"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          บ้านเลขที่ {hh.houseNo}{hh.moo ? ` หมู่ ${hh.moo}` : ""}
                        </p>
                        <p className="text-xs text-gray-500">
                          {hh.hasBedridden ? "ผู้ป่วยติดเตียง" : ""}
                          {hh.hasBedridden && hh.hasElderlyAlone ? " · " : ""}
                          {hh.hasElderlyAlone ? "ผู้สูงอายุอยู่ลำพัง" : ""}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                        {hh.daysSinceVisit == null ? "ยังไม่เคยเยี่ยม" : `${hh.daysSinceVisit} วันแล้ว`}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              actionable.stalledIssues.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">ไม่มีปัญหาค้างอยู่นาน 🎉</div>
              ) : (
                <div className="space-y-2">
                  {actionable.stalledIssues.map((issue) => {
                    const isUrgent = (issue.severity ?? 0) >= 4;
                    return (
                      <div key={issue.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isUrgent
                        ? "bg-red-50/60 dark:bg-red-900/10 border-red-100 dark:border-red-900/20"
                        : "bg-orange-50/60 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20"
                        }`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${isUrgent ? "bg-red-100 dark:bg-red-900/30" : "bg-orange-100 dark:bg-orange-900/30"
                          }`}><span className="text-xs font-bold text-current">!</span></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                            {issue.issueType || "ปัญหาชุมชน"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {issue.status || "เปิด"}
                            {issue.area ? ` · ${issue.area}` : ""}
                            {issue.severity ? ` · ระดับ ${issue.severity}` : ""}
                          </p>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${isUrgent
                          ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                          : "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30"
                          }`}>
                          {issue.daysStalled ?? "?"} วัน
                        </span>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ===== ข้อมูลประชากร ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">ข้อมูลประชากร</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">จำนวนประชากรย้อนหลัง 5 ปี</p>
            <p className="text-xs text-gray-400 mb-3">แยกชายหญิง — นับสะสมจากปีที่บันทึก</p>
            {loading ? <div className="h-52 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" /> : (
              popYears.length === 0
                ? <div className="h-52 flex items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูล</div>
                : <ReactApexChart type="bar" options={popYearOpts} series={popYearSeries} height={210} />
            )}
          </div>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">ช่วงอายุประชากร (แยกชายหญิง)</p>
            <p className="text-xs text-gray-400 mb-3">จำนวนคนแยกตามช่วงอายุ</p>
            {loading ? <div className="h-52 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" /> : (
              totalPersons === 0
                ? <div className="h-52 flex items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูล</div>
                : <ReactApexChart type="bar" options={ageOpts} series={ageSeries} height={210} />
            )}
          </div>
        </div>
      </div>

      {/* ===== กิจกรรมและปัญหาชุมชน ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">กิจกรรมและปัญหาชุมชน</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* 1. การเยี่ยมบ้านล่าสุด */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">การเยี่ยมบ้านล่าสุด</p>
              <a href="/visitlog" className="text-xs text-blue-500 hover:underline">ดูทั้งหมด</a>
            </div>
            {loading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
            ) : visitStats.recentVisits.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 flex-1 flex items-center justify-center">ยังไม่มีข้อมูล</p>
            ) : (
              <div className="space-y-2.5">
                {visitStats.recentVisits.map((v) => (
                  <div key={v.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm flex-shrink-0"><span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">บ้าน</span></div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{v.visitReason || "เยี่ยมบ้าน"}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {v.visitor || "—"} · {v.visitDate ? new Date(v.visitDate).toLocaleDateString("th-TH") : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. ปัญหาชุมชนค้างอยู่ */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">ปัญหาชุมชนค้างอยู่</p>
              <a href="/communityissue" className="text-xs text-blue-500 hover:underline">ดูทั้งหมด</a>
            </div>
            {loading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
            ) : issuesSummary.pendingList.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 flex-1 flex items-center justify-center">ไม่มีปัญหาค้างอยู่ 🎉</p>
            ) : (
              <div className="space-y-2.5">
                {issuesSummary.pendingList.map((issue) => {
                  const st = (issue.status || "").toLowerCase().replace(/[\s_-]/g, "");
                  const isOpen = ["open", "เปิด", "pending", "new"].includes(st);
                  const badge = isOpen ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600";
                  const thumbUrl = issue.imageUrl
                    ? issue.imageUrl.startsWith("http")
                      ? issue.imageUrl
                      : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/smart_village/api").replace(/\/api$/, "") + issue.imageUrl
                    : null;
                  return (
                    <a key={issue.id} href={`/communityissue/detail?id=${issue.id}`} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-orange-500">!</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{issue.issueType || "-"}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge}`}>{issue.status}</span>
                          <span className="text-[10px] text-gray-400">{issue.area}</span>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-gray-300 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. สถิติปัญหาชุมชน (Donut Chart) */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">สัดส่วนปัญหาตามสถานะ</p>
            {loading ? (
              <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
            ) : issuesSummary.totalCount === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูล</div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <ReactApexChart type="donut" options={issueOpts} series={issueSlices.map(s => s.count)} height={220} width="100%" />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ===== สถิติรายได้ (Full Width) ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">สถิติแนวโน้ม</h2>
        
        {/* แนวโน้มรายได้ชุมชน (Area Chart) */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">รายได้ชุมชน (ย้อนหลัง)</p>
                <p className="text-xs text-gray-400 mt-1">ภาพรวมรายได้เฉลี่ยของคนในชุมชน</p>
              </div>
            </div>
            
            {loading ? (
              <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl mt-4" />
            ) : incomeData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-gray-400">ยังไม่มีข้อมูลรายได้</div>
            ) : (
              <div className="mt-4">
                {/* ปรับความสูงกราฟให้เหมาะสมกับการกางเต็มหน้าจอ */}
                <ReactApexChart type="area" options={incomeOpts} series={incomeSeries} height={280} width="100%" />
              </div>
            )}
          </div>

          {!loading && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                <span className="text-xs text-gray-500">ครัวเรือนยากจน (รายได้ต่ำกว่าเกณฑ์)</span>
              </div>
              <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                {incomeSummary.totalPoor.toLocaleString()} ครัวเรือน
              </span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}