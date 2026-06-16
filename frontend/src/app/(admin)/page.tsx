"use client"
import { useEffect, useMemo, useState } from "react";
import { useVillage } from "@/context/VillageContext";
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

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="h-52 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />,
});

// ── Interfaces ──────────────────────────────────────────────────────────────
interface HouseholdData {
  householdId: number; houseNo: string; moo?: string;
  houseCondition: string; internetAccess: boolean;
  waterSystem: string; remark: string;
  gpsLat?: number; gpsLng?: number;
}
interface PersonData {
  personId: number; firstName: string; lastName: string;
  householdId: number; gender?: string; age?: number;
  isElderly: boolean | null; isDisabled: boolean | null;
  isBedridden: boolean | null; isSick: boolean | null;
  incomePerMonth: number | null; occupation: string;
}
interface CommunityIssue {
  id: number; issueType?: string; status?: string;
  severity?: number; area?: string; createdAt?: string;
}
interface VisitLog {
  id: number; personId?: number; householdId?: number;
  visitDate?: string; visitor?: string;
  visitReason?: string; summary?: string; createdAt?: string;
}
interface Training {
  id: number; trainingName?: string; trainingType?: string;
  startDate?: string; endDate?: string;
  location?: string; organizer?: string;
}
interface KpiItem {
  label: string; value: number | string;
  icon: string; color: string; sub: string; mock?: boolean;
}
interface AlertItem { level: "red" | "orange" | "yellow"; message: string; }

// ── Constants ───────────────────────────────────────────────────────────────
const ROLE_LABEL: Record<string, string> = {
  ADMIN: "ผู้ดูแลระบบ", PROVINCE: "ผู้ใช้ระดับจังหวัด",
  AMPHUR: "ผู้ใช้ระดับอำเภอ", TAMBON: "ผู้ใช้ระดับตำบล",
  VILLAGE: "ผู้ใช้ระดับหมู่บ้าน",
};

const COLOR_MAP: Record<string, { text: string; badge: string }> = {
  emerald: { text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-50 dark:bg-emerald-900/30" },
  amber:   { text: "text-amber-600 dark:text-amber-400",     badge: "bg-amber-50 dark:bg-amber-900/30"   },
  purple:  { text: "text-purple-600 dark:text-purple-400",   badge: "bg-purple-50 dark:bg-purple-900/30"  },
  red:     { text: "text-red-600 dark:text-red-400",         badge: "bg-red-50 dark:bg-red-900/30"       },
  blue:    { text: "text-blue-600 dark:text-blue-400",       badge: "bg-blue-50 dark:bg-blue-900/30"     },
  orange:  { text: "text-orange-600 dark:text-orange-400",   badge: "bg-orange-50 dark:bg-orange-900/30" },
  indigo:  { text: "text-indigo-600 dark:text-indigo-400",   badge: "bg-indigo-50 dark:bg-indigo-900/30" },
};

const ALERT_STYLE = {
  red:    { border: "border-red-200 dark:border-red-800",       bg: "bg-red-50 dark:bg-red-900/20",       dot: "bg-red-500",    text: "text-red-700 dark:text-red-300"       },
  orange: { border: "border-orange-200 dark:border-orange-800", bg: "bg-orange-50 dark:bg-orange-900/20", dot: "bg-orange-400", text: "text-orange-700 dark:text-orange-300" },
  yellow: { border: "border-yellow-200 dark:border-yellow-800", bg: "bg-yellow-50 dark:bg-yellow-900/20", dot: "bg-yellow-400", text: "text-yellow-700 dark:text-yellow-300" },
};

function normalizeIssueStatus(s?: string): string {
  if (!s) return "เปิด";
  const l = s.toLowerCase().replace(/[\s_-]/g, "");
  if (["open","เปิด","pending","new","ยังไม่แก้","ยังไม่ได้แก้"].includes(l))               return "เปิด";
  if (["inprogress","กำลังดำเนินการ","doing","ongoing","กำลังทำ","กำลังดำเนิน"].includes(l)) return "กำลังดำเนินการ";
  if (["resolved","แก้ไขแล้ว","closed","done","completed","แก้แล้ว","เสร็จแล้ว"].includes(l)) return "แก้ไขแล้ว";
  return "อื่นๆ";
}

// ── Component ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { village } = useVillage();
  const [households,  setHouseholds]  = useState<HouseholdData[]>([]);
  const [persons,     setPersons]     = useState<PersonData[]>([]);
  const [issues,      setIssues]      = useState<CommunityIssue[]>([]);
  const [visitLogs,   setVisitLogs]   = useState<VisitLog[]>([]);
  const [trainings,   setTrainings]   = useState<Training[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showKpiModal,   setShowKpiModal]   = useState(false);
  const [showAiSummary,  setShowAiSummary]  = useState(false);
  const [userRole,    setUserRole]    = useState<string | null>(null);
  const [userName,    setUserName]    = useState<string | null>(null);
  const [scopeId,     setScopeId]     = useState<string | null>(null);

  useEffect(() => {
    document.title = "Smart Village | Dashboard";
    setUserRole(localStorage.getItem("role"));
    setUserName(localStorage.getItem("fullName") || localStorage.getItem("username"));
    setScopeId(localStorage.getItem("scopeId"));
  }, []);

  // re-fetch ทุกครั้งที่ village เปลี่ยน (หรือ load ครั้งแรก)
  useEffect(() => {
    const role = localStorage.getItem("role");
    // ADMIN: pass villageId เฉพาะเมื่อเลือก village แล้ว
    // non-ADMIN: backend filter by JWT scopeId อยู่แล้ว ไม่ต้องส่ง param
    const params = role === "ADMIN" && village ? { villageId: village.villageId } : {};
    setLoading(true);
    Promise.all([
      axios.get<HouseholdData[]>("/households", { params }),
      axios.get<PersonData[]>("/persons", { params }),
      axios.get<CommunityIssue[]>("/community-issues", { params }),
      axios.get<VisitLog[]>("/visit-logs", { params }),
      axios.get<Training[]>("/training-events", { params }),
    ])
      .then(([hR, pR, iR, vR, tR]) => {
        setHouseholds(hR.data);
        setPersons(pR.data);
        setIssues(iR.data);
        setVisitLogs(vR.data);
        setTrainings(tR.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [village]);

  // ── Derived KPI ──────────────────────────────────────────────────────────
  const totalHouseholds = households.length;
  const totalPersons    = persons.length;
  const totalElderly    = persons.filter((p) => p.isElderly   === true).length;
  const totalDisabled   = persons.filter((p) => p.isDisabled  === true).length;
  const totalBedridden  = persons.filter((p) => p.isBedridden === true).length;
  const totalPoor       = persons.filter((p) => p.incomePerMonth !== null && (p.incomePerMonth ?? Infinity) < 3000).length;

  const openIssues       = issues.filter((i) => normalizeIssueStatus(i.status) === "เปิด").length;
  const inProgressIssues = issues.filter((i) => normalizeIssueStatus(i.status) === "กำลังดำเนินการ").length;
  const resolvedIssues   = issues.filter((i) => normalizeIssueStatus(i.status) === "แก้ไขแล้ว").length;
  const otherIssues      = issues.length - openIssues - inProgressIssues - resolvedIssues;

  const visitsThisMonth = useMemo(() => {
    const n = new Date();
    return visitLogs.filter((v) => {
      const d = new Date(v.visitDate || v.createdAt || "");
      return !isNaN(d.getTime()) && d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
    }).length;
  }, [visitLogs]);

  // ── Gender ───────────────────────────────────────────────────────────────
  const genderMale   = useMemo(() => persons.filter((p) => ["ชาย","male","m"].includes((p.gender||"").toLowerCase().trim())).length, [persons]);
  const genderFemale = useMemo(() => persons.filter((p) => ["หญิง","female","f"].includes((p.gender||"").toLowerCase().trim())).length, [persons]);
  const genderOther  = totalPersons - genderMale - genderFemale;

  // ── Age groups ───────────────────────────────────────────────────────────
  const ageGroups = useMemo(() => {
    const g = [0,0,0,0,0];
    persons.forEach((p) => {
      const a = p.age ?? 0;
      if      (a <= 15) g[0]++;
      else if (a <= 30) g[1]++;
      else if (a <= 45) g[2]++;
      else if (a <= 60) g[3]++;
      else              g[4]++;
    });
    return g;
  }, [persons]);

  // ── Monthly visits ───────────────────────────────────────────────────────
  const monthLabels = useMemo(() => {
    const n = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(n.getFullYear(), n.getMonth() - (5 - i), 1);
      return d.toLocaleDateString("th-TH", { month: "short" });
    });
  }, []);

  const monthCounts = useMemo(() => {
    const n = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(n.getFullYear(), n.getMonth() - (5 - i), 1);
      return visitLogs.filter((v) => {
        const vd = new Date(v.visitDate || v.createdAt || "");
        return !isNaN(vd.getTime()) && vd.getFullYear() === d.getFullYear() && vd.getMonth() === d.getMonth();
      }).length;
    });
  }, [visitLogs]);

  // ── Map markers ──────────────────────────────────────────────────────────
  const mapMarkers: HouseholdMarker[] = households
    .filter((h) => h.gpsLat && h.gpsLng)
    .map((h) => {
      const members = persons.filter((p) => p.householdId === h.householdId);
      return {
        householdId: h.householdId, houseNo: h.houseNo, moo: h.moo,
        lat: h.gpsLat!, lng: h.gpsLng!,
        hasBedridden: members.some((p) => p.isBedridden === true),
        hasDisabled:  members.some((p) => p.isDisabled  === true),
        hasElderly:   members.some((p) => p.isElderly   === true),
      };
    });

  // ── Recent data ──────────────────────────────────────────────────────────
  const recentVisits = useMemo(() =>
    [...visitLogs]
      .sort((a, b) => new Date(b.visitDate||b.createdAt||"").getTime() - new Date(a.visitDate||a.createdAt||"").getTime())
      .slice(0, 5), [visitLogs]);

  const pendingIssues = useMemo(() =>
    issues
      .filter((i) => normalizeIssueStatus(i.status) !== "แก้ไขแล้ว")
      .sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0))
      .slice(0, 5), [issues]);

  const upcomingTrainings = useMemo(() => {
    const n = new Date();
    return trainings
      .filter((t) => t.startDate && new Date(t.startDate) >= n)
      .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
      .slice(0, 3);
  }, [trainings]);

  // ── KPI cards ────────────────────────────────────────────────────────────
  const allKpi: KpiItem[] = [
    { label: "ครัวเรือนทั้งหมด",      value: totalHouseholds,               icon: "🏠",       color: "emerald", sub: "หลังคาเรือน" },
    { label: "ประชากรทั้งหมด",         value: totalPersons,                  icon: "👨‍👩‍👧‍👦", color: "emerald", sub: "คน" },
    { label: "ผู้สูงอายุ",             value: totalElderly,                  icon: "👴",       color: "amber",   sub: "คน (60 ปีขึ้นไป)" },
    { label: "ผู้พิการ",               value: totalDisabled,                 icon: "♿",       color: "purple",  sub: "คน" },
    { label: "ผู้ป่วยติดเตียง",        value: totalBedridden,                icon: "🏥",       color: "red",     sub: "คน" },
    { label: "ครัวเรือนยากจน",         value: totalPoor,                     icon: "📉",       color: "red",     sub: "หลังคาเรือน (< 3,000/เดือน)" },
    { label: "ปัญหาชุมชนค้างอยู่",    value: openIssues + inProgressIssues, icon: "⚠️",       color: "orange",  sub: "รายการ" },
    { label: "เยี่ยมบ้านเดือนนี้",    value: visitsThisMonth,               icon: "📋",       color: "indigo",  sub: "ครั้ง" },
  ];
  const topKpi = allKpi.slice(0, 3);

  // ── Real alerts ──────────────────────────────────────────────────────────
  const alerts = useMemo((): AlertItem[] => {
    const list: AlertItem[] = [];
    if (totalBedridden > 0)
      list.push({ level: "red",    message: `ผู้ป่วยติดเตียง ${totalBedridden} ราย ต้องการการดูแลอย่างต่อเนื่อง` });
    if (openIssues > 0)
      list.push({ level: "orange", message: `ปัญหาชุมชนที่ยังค้างอยู่ ${openIssues} รายการ รอการดำเนินการ` });
    if (inProgressIssues > 0)
      list.push({ level: "yellow", message: `กำลังดำเนินการแก้ไขปัญหา ${inProgressIssues} รายการ` });
    if (upcomingTrainings.length > 0)
      list.push({ level: "yellow", message: `การอบรม "${upcomingTrainings[0].trainingName}" — ${upcomingTrainings[0].startDate ? new Date(upcomingTrainings[0].startDate).toLocaleDateString("th-TH") : "-"}` });
    if (totalPersons > 0 && (totalElderly / totalPersons) >= 0.2)
      list.push({ level: "yellow", message: `สัดส่วนผู้สูงอายุ ${((totalElderly/totalPersons)*100).toFixed(0)}% ของประชากรทั้งหมด` });
    return list.length > 0 ? list : [{ level: "yellow", message: "ไม่มีการแจ้งเตือนในขณะนี้" }];
  }, [totalBedridden, openIssues, inProgressIssues, upcomingTrainings, totalElderly, totalPersons]);

  // ── ApexChart options ─────────────────────────────────────────────────────
  const genderOpts = {
    chart: { type: "donut" as const, toolbar: { show: false } },
    labels: ["ชาย", "หญิง", "ไม่ระบุ"],
    colors: ["#3b82f6", "#ec4899", "#9ca3af"],
    legend: { position: "bottom" as const, fontSize: "12px" },
    plotOptions: { pie: { donut: { size: "65%" } } },
    dataLabels: { enabled: true, formatter: (v: number) => `${v.toFixed(0)}%` },
    tooltip: { y: { formatter: (v: number) => `${v} คน` } },
  };

  const ageOpts = {
    chart: { type: "bar" as const, toolbar: { show: false } },
    xaxis: { categories: ["0–15", "16–30", "31–45", "46–60", "60+"] },
    colors: ["#10b981"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v: number) => `${v} คน` } },
    yaxis: { labels: { formatter: (v: number) => `${Math.round(v)}` }, min: 0 },
    grid: { borderColor: "#f1f5f9" },
  };

  // Issue donut — สร้าง dynamic labels/series/colors เพื่อซ่อน slice ที่เป็น 0
  const issueSlices = useMemo(() => {
    const all = [
      { label: "เปิด",            count: openIssues,       color: "#ef4444" },
      { label: "กำลังดำเนินการ", count: inProgressIssues, color: "#f59e0b" },
      { label: "แก้ไขแล้ว",      count: resolvedIssues,   color: "#10b981" },
      { label: "อื่นๆ",          count: otherIssues,       color: "#9ca3af" },
    ];
    const filtered = all.filter(s => s.count > 0);
    return filtered.length > 0 ? filtered : [{ label: "ไม่มีข้อมูล", count: 1, color: "#e5e7eb" }];
  }, [openIssues, inProgressIssues, resolvedIssues, otherIssues]);

  const issueOpts = useMemo(() => ({
    chart: { type: "donut" as const, toolbar: { show: false } },
    labels: issueSlices.map(s => s.label),
    colors: issueSlices.map(s => s.color),
    legend: { position: "bottom" as const, fontSize: "12px" },
    plotOptions: { pie: { donut: { size: "65%" } } },
    dataLabels: { enabled: true, formatter: (v: number) => `${v.toFixed(0)}%` },
    tooltip: { y: { formatter: (v: number) => `${v} รายการ` } },
  }), [issueSlices]);

  const visitTrendOpts = {
    chart: { type: "area" as const, toolbar: { show: false } },
    xaxis: { categories: monthLabels },
    colors: ["#6366f1"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02 } },
    stroke: { curve: "smooth" as const, width: 2 },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v: number) => `${v} ครั้ง` } },
    grid: { borderColor: "#f1f5f9" },
    yaxis: { min: 0, labels: { formatter: (v: number) => `${Math.round(v)}` } },
  };

  // ── Village index score (computed) ────────────────────────────────────────
  const villageScore = useMemo(() => {
    if (totalPersons === 0) return 0;
    let score = 100;
    if (totalBedridden > 0)  score -= Math.min(15, totalBedridden * 3);
    if (totalPoor > 0)       score -= Math.min(15, Math.round((totalPoor / totalHouseholds) * 30));
    if (openIssues > 0)      score -= Math.min(10, openIssues * 2);
    const internetPct = households.length > 0
      ? households.filter(h => h.internetAccess).length / households.length : 0;
    score += Math.round(internetPct * 10);
    return Math.max(0, Math.min(100, score));
  }, [totalBedridden, totalPoor, totalHouseholds, openIssues, households, totalPersons]);

  const scoreColor = villageScore >= 80 ? "#10b981" : villageScore >= 60 ? "#f59e0b" : "#ef4444";
  const scoreLabel = villageScore >= 80 ? "🟢 เข้มแข็ง" : villageScore >= 60 ? "🟡 พัฒนาได้" : "🔴 ต้องดูแล";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ===== SCOPE BANNER ===== */}
      <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-lg">
            {userRole === "ADMIN" ? "🛡️" : userRole === "VILLAGE" ? "🏘️" : "📍"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              {userName ? `สวัสดี, ${userName}` : "สวัสดี"}
            </p>
            <p className="text-xs text-gray-400">
              {ROLE_LABEL[userRole || ""] || userRole}
              {village
                ? ` · ${village.villageName}${village.moo ? ` หมู่ ${village.moo}` : ""}`
                : userRole !== "ADMIN" && scopeId ? ` · หมู่บ้าน ID: ${scopeId}` : ""}
              {userRole === "ADMIN"
                ? village ? " · กรองตามหมู่บ้านที่เลือก" : " · เห็นข้อมูลทั้งหมด"
                : " · เห็นข้อมูลเฉพาะขอบเขตของคุณ"}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          userRole === "ADMIN" ? "bg-purple-100 text-purple-700" :
          userRole === "VILLAGE" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
        }`}>
          {ROLE_LABEL[userRole || ""] || userRole || "—"}
        </span>
      </div>

      {/* ===== AI SUMMARY ===== */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowAiSummary(!showAiSummary)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">สรุปภาพรวมชุมชน</span>
            {!showAiSummary && !loading && (
              <span className="text-xs text-gray-400 ml-1">
                — {totalPersons} คน · {totalHouseholds} ครัวเรือน · ผู้สูงอายุ {totalElderly} คน · ปัญหา {openIssues + inProgressIssues} รายการ
              </span>
            )}
          </div>
          <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showAiSummary ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showAiSummary && (
          <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800">
            {loading ? (
              <div className="space-y-2 pt-4">
                {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ width: `${80 - i*10}%` }} />)}
              </div>
            ) : (
              <ul className="space-y-2 pt-4">
                <li className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <span className="text-emerald-500 font-bold text-sm mt-0.5">•</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    หมู่บ้านมีประชากรทั้งหมด <strong>{totalPersons.toLocaleString()} คน</strong> ใน <strong>{totalHouseholds} ครัวเรือน</strong>
                    {totalPersons > 0 && ` · เฉลี่ย ${(totalPersons/Math.max(totalHouseholds,1)).toFixed(1)} คน/ครัวเรือน`}
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                  <span className="text-amber-500 font-bold text-sm mt-0.5">•</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    ผู้สูงอายุ <strong>{totalElderly} คน</strong>
                    {totalPersons > 0 && ` (${((totalElderly/totalPersons)*100).toFixed(1)}%)`}
                    · ผู้พิการ <strong>{totalDisabled} คน</strong>
                    · ผู้ป่วยติดเตียง <strong>{totalBedridden} คน</strong>
                  </span>
                </li>
                {(openIssues + inProgressIssues) > 0 && (
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                    <span className="text-orange-500 font-bold text-sm mt-0.5">•</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      ปัญหาชุมชนรอดำเนินการ <strong>{openIssues + inProgressIssues} รายการ</strong>
                      {resolvedIssues > 0 && ` · แก้ไขแล้ว ${resolvedIssues} รายการ`}
                    </span>
                  </li>
                )}
                {totalPoor > 0 && (
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <span className="text-red-500 font-bold text-sm mt-0.5">•</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      ครัวเรือนรายได้ต่ำกว่า 3,000 บาท/เดือน <strong>{totalPoor} หลังคาเรือน</strong>
                      {totalHouseholds > 0 && ` (${((totalPoor/totalHouseholds)*100).toFixed(1)}%)`}
                    </span>
                  </li>
                )}
                {visitsThisMonth > 0 && (
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                    <span className="text-indigo-500 font-bold text-sm mt-0.5">•</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      เยี่ยมบ้านเดือนนี้ <strong>{visitsThisMonth} ครั้ง</strong>
                      {visitLogs.length > 0 && ` · รวมทั้งหมด ${visitLogs.length} ครั้ง`}
                    </span>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ===== KPI TOP 3 + Village Index ===== */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        <div className="col-span-12 xl:col-span-9 flex flex-col">
          <div className="flex items-center justify-between mb-3 min-h-[34px]">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ตัวชี้วัดหลัก (KPI)</h2>
            <button
              onClick={() => setShowKpiModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              ดูทั้งหมด ({allKpi.length})
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {topKpi.map((card) => {
              const c = COLOR_MAP[card.color];
              return (
                <div key={card.label} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4 h-full">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${c.badge}`}>{card.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                    {loading ? <div className="h-7 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-1" /> : (
                      <p className={`text-2xl font-bold ${c.text}`}>{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{card.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Village Index */}
        <div className="col-span-12 xl:col-span-3 flex flex-col mt-8 xl:mt-0">
          <div className="flex items-center mb-3 min-h-[34px]">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ดัชนีหมู่บ้าน</h2>
          </div>
          <div className="flex-1 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Village Index</p>
            <div className="relative flex items-center justify-center my-1">
              <svg width="84" height="84" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="58" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                <circle cx="70" cy="70" r="58" fill="none" stroke={scoreColor} strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 58 * (villageScore / 100)} ${2 * Math.PI * 58}`}
                  strokeDashoffset={2 * Math.PI * 58 * 0.25}
                  transform="rotate(-90 70 70)" />
              </svg>
              <div className="absolute text-center">
                <p className="text-2xl font-bold" style={{ color: scoreColor }}>{loading ? "—" : villageScore}</p>
                <p className="text-[10px] text-gray-400">/ 100</p>
              </div>
            </div>
            <p className="text-xs font-semibold" style={{ color: scoreColor }}>{loading ? "กำลังคำนวณ..." : scoreLabel}</p>
          </div>
        </div>
      </div>

      {/* ===== CHARTS ROW 1: Gender + Age ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">ข้อมูลประชากร</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Gender donut */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">สัดส่วนเพศ</p>
            <p className="text-xs text-gray-400 mb-3">ชาย / หญิง / ไม่ระบุ</p>
            {loading ? <div className="h-52 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" /> : (
              totalPersons === 0
                ? <div className="h-52 flex items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูล</div>
                : <ReactApexChart type="donut" options={genderOpts} series={[genderMale, genderFemale, genderOther]} height={210} />
            )}
          </div>
          {/* Age bar */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">ช่วงอายุประชากร</p>
            <p className="text-xs text-gray-400 mb-3">จำนวนคน (ปี)</p>
            {loading ? <div className="h-52 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" /> : (
              totalPersons === 0
                ? <div className="h-52 flex items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูล</div>
                : <ReactApexChart type="bar" options={ageOpts} series={[{ name: "จำนวนคน", data: ageGroups }]} height={210} />
            )}
          </div>
        </div>
      </div>

      {/* ===== MAP + ALERTS ===== */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">แผนที่หมู่บ้าน</h2>
          </div>
          <VillageMap markers={mapMarkers} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">การแจ้งเตือน</h2>
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-3">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)
            ) : alerts.map((alert, i) => {
              const s = ALERT_STYLE[alert.level];
              return (
                <div key={i} className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${s.bg} ${s.border}`}>
                  <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <p className={`text-xs font-medium leading-relaxed ${s.text}`}>{alert.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== CHARTS ROW 2: Issues + Visit Trend ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">ปัญหาชุมชน &amp; การเยี่ยมบ้าน</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Issues donut */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">สถานะปัญหาชุมชน</p>
            <p className="text-xs text-gray-400 mb-3">รวม {issues.length} รายการ</p>
            {loading ? <div className="h-52 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" /> : (
              issues.length === 0
                ? <div className="h-52 flex items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูล</div>
                : <ReactApexChart type="donut" options={issueOpts} series={issueSlices.map(s => s.count)} height={210} />
            )}
          </div>
          {/* Visit trend */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">จำนวนการเยี่ยมบ้านรายเดือน</p>
            <p className="text-xs text-gray-400 mb-3">ย้อนหลัง 6 เดือน</p>
            {loading ? <div className="h-52 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" /> : (
              <ReactApexChart type="area" options={visitTrendOpts} series={[{ name: "การเยี่ยมบ้าน", data: monthCounts }]} height={210} />
            )}
          </div>
        </div>
      </div>

      {/* ===== RECENT ACTIVITY ===== */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">กิจกรรมล่าสุด</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent visits */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">การเยี่ยมบ้านล่าสุด</p>
              <a href="/visitlog" className="text-xs text-brand-500 hover:underline">ดูทั้งหมด</a>
            </div>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
            ) : recentVisits.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีข้อมูล</p>
            ) : (
              <div className="space-y-2.5">
                {recentVisits.map((v) => (
                  <div key={v.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm flex-shrink-0">📋</div>
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

          {/* Pending issues */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">ปัญหาชุมชนค้างอยู่</p>
              <a href="/communityissue" className="text-xs text-brand-500 hover:underline">ดูทั้งหมด</a>
            </div>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
            ) : pendingIssues.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">ไม่มีปัญหาค้างอยู่ 🎉</p>
            ) : (
              <div className="space-y-2.5">
                {pendingIssues.map((issue) => {
                  const status = normalizeIssueStatus(issue.status);
                  const badge = status === "เปิด" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600";
                  return (
                    <div key={issue.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm flex-shrink-0">⚠️</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{issue.issueType || "ปัญหาชุมชน"}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge}`}>{status}</span>
                          {issue.area && <span className="text-[11px] text-gray-400 truncate">{issue.area}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming trainings */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">การอบรมที่กำลังจะมาถึง</p>
              <a href="/training" className="text-xs text-brand-500 hover:underline">ดูทั้งหมด</a>
            </div>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
            ) : upcomingTrainings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">ไม่มีการอบรมที่กำลังจะมาถึง</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingTrainings.map((t) => (
                  <div key={t.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm flex-shrink-0">🎓</div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{t.trainingName || "การอบรม"}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {t.startDate ? new Date(t.startDate).toLocaleDateString("th-TH") : "—"}
                        {t.location && ` · ${t.location}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== KPI MODAL ===== */}
      {showKpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowKpiModal(false); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">ตัวชี้วัดทั้งหมด</h3>
                <p className="text-xs text-gray-400 mt-0.5">Smart Village KPI Overview</p>
              </div>
              <button onClick={() => setShowKpiModal(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allKpi.map((card) => {
                const c = COLOR_MAP[card.color];
                return (
                  <div key={card.label} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-2 ${c.badge}`}>{card.icon}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 leading-tight">{card.label}</p>
                    {loading ? <div className="h-6 w-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mx-auto" /> : (
                      <p className={`text-2xl font-bold ${c.text}`}>{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{card.sub}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setShowKpiModal(false)}
                className="px-5 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
