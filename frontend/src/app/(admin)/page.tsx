"use client"
import { useEffect, useMemo, useState } from "react";
import { useVillage } from "@/context/VillageContext";
import axios from "@/lib/axios";
import DashboardView, { HouseholdData, PersonData } from "@/components/dashboard/DashboardView";

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
  const [households, setHouseholds] = useState<HouseholdData[]>([]);
  const [persons, setPersons] = useState<PersonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [scopeId, setScopeId] = useState<string | null>(null);

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

  const roleLabel = ROLE_LABEL[userRole || ""] || userRole || "—";
  const badgeClass =
    userRole === "ADMIN" ? "bg-purple-100 text-purple-700" :
    userRole === "VILLAGE" ? "bg-green-100 text-green-700" :
    "bg-blue-100 text-blue-700";

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
    <DashboardView
      households={households}
      persons={persons}
      loading={loading}
      scopeBanner={{
        icon: userRole === "ADMIN" ? "🛡️" : userRole === "VILLAGE" ? "🏘️" : "📍",
        title: userName ? `สวัสดี, ${userName}` : "สวัสดี",
        subtitle: `${roleLabel}${userRole !== "ADMIN" && scopeId ? ` · หมู่บ้าน ID: ${scopeId}` : ""}${userRole === "ADMIN" ? " · เห็นข้อมูลทั้งหมด" : " · เห็นข้อมูลเฉพาะขอบเขตของคุณ"}`,
        badge: { text: roleLabel, className: badgeClass },
      }}
    />
  );
}
