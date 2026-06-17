"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import axios from "@/lib/axios";
import { useVillage } from "@/context/VillageContext";

interface AlertItem {
  id: string;
  level: "red" | "orange" | "yellow" | "green";
  icon: string;
  title: string;
  detail: string;
}

const LEVEL_DOT: Record<string, string> = {
  red: "bg-red-500", orange: "bg-orange-400",
  yellow: "bg-yellow-400", green: "bg-emerald-500",
};
const LEVEL_BG: Record<string, string> = {
  red: "bg-red-50 dark:bg-red-900/20", orange: "bg-orange-50 dark:bg-orange-900/20",
  yellow: "bg-yellow-50 dark:bg-yellow-900/20", green: "bg-emerald-50 dark:bg-emerald-900/20",
};
const DISMISSED_KEY = "notif_dismissed";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 ชั่วโมง

function loadDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    const parsed: Record<string, number> = JSON.parse(raw);
    const cutoff = Date.now() - TTL_MS;
    return new Set(Object.entries(parsed).filter(([, ts]) => ts > cutoff).map(([id]) => id));
  } catch { return new Set(); }
}

function saveDismissed(ids: Set<string>) {
  try {
    const now = Date.now();
    const obj: Record<string, number> = {};
    ids.forEach(id => { obj[id] = now; });
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(obj));
  } catch {}
}

export default function NotificationDropdown() {
  const { village } = useVillage();
  const [isOpen,      setIsOpen]      = useState(false);
  const [alerts,      setAlerts]      = useState<AlertItem[]>([]);
  const [dismissed,   setDismissed]   = useState<Set<string>>(loadDismissed);
  const [lastFetched, setLastFetched] = useState(0);

  const fetchAlerts = useCallback(async () => {
    if (Date.now() - lastFetched < 60_000) return;
    try {
      const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
      const params = role === "ADMIN" && village ? { villageId: village.villageId } : {};

      const [statsRes, issuesRes, personsRes] = await Promise.all([
        axios.get<{ children03: number }>("/dashboard/population", { params }),
        axios.get<{ id: number; status?: string; severity?: number }[]>("/community-issues", { params }),
        axios.get<{ isBedridden?: boolean | null; incomePerMonth?: number | null; isDisabled?: boolean | null; isElderly?: boolean | null }[]>("/persons", { params }),
      ]);

      const stats   = statsRes.data;
      const issues  = issuesRes.data;
      const persons = personsRes.data;

      const totalPersons   = persons.length;
      const totalBedridden = persons.filter(p => p.isBedridden === true).length;
      const totalDisabled  = persons.filter(p => p.isDisabled  === true).length;
      const totalElderly   = persons.filter(p => p.isElderly   === true).length;
      const totalPoor      = persons.filter(p => p.incomePerMonth != null && (p.incomePerMonth ?? Infinity) < 3000).length;

      const open         = issues.filter(i => ["เปิด","open","pending"].includes((i.status||"").toLowerCase())).length;
      const inProgress   = issues.filter(i => ["กำลังดำเนินการ","inprogress","in_progress"].includes((i.status||"").toLowerCase().replace(/\s/g,""))).length;
      const resolved     = issues.filter(i => ["แก้ไขแล้ว","resolved","closed","done"].includes((i.status||"").toLowerCase().replace(/\s/g,""))).length;
      const highSeverity = issues.filter(i => (i.severity ?? 0) >= 4 && !["แก้ไขแล้ว","resolved","closed"].includes((i.status||"").toLowerCase())).length;

      const list: AlertItem[] = [];

      if (totalBedridden > 0)
        list.push({ id: "bedridden", level: "red", icon: "🏥",
          title: `ผู้ป่วยติดเตียง ${totalBedridden} ราย`,
          detail: "ต้องการการเยี่ยมบ้านอย่างต่อเนื่อง" });

      if (highSeverity > 0)
        list.push({ id: "highSeverity", level: "red", icon: "🚨",
          title: `ปัญหาเร่งด่วน ${highSeverity} รายการ`,
          detail: "ระดับความรุนแรง ≥ 4 ยังไม่แก้ไข" });

      if (open > 0)
        list.push({ id: "openIssues", level: "orange", icon: "⚠️",
          title: `ปัญหาที่ยังไม่ดำเนินการ ${open} รายการ`,
          detail: "รอการมอบหมายและแก้ไข" });

      if (inProgress > 0)
        list.push({ id: "inProgress", level: "yellow", icon: "🔧",
          title: `กำลังดำเนินการแก้ไข ${inProgress} รายการ`,
          detail: "ติดตามความคืบหน้า" });

      if (totalPersons > 0 && totalElderly / totalPersons >= 0.2)
        list.push({ id: "elderlyRatio", level: "yellow", icon: "👴",
          title: `ผู้สูงอายุ ${((totalElderly / totalPersons) * 100).toFixed(0)}% ของประชากร`,
          detail: "สูงเกินเกณฑ์ 20% — ควรเตรียมการดูแล" });

      if (totalPoor > 0)
        list.push({ id: "poorHouseholds", level: "yellow", icon: "📉",
          title: `ครัวเรือนรายได้ต่ำ ${totalPoor} หลัง`,
          detail: "รายได้ต่ำกว่า 3,000 บาท/เดือน" });

      if (totalDisabled > 0)
        list.push({ id: "disabled", level: "yellow", icon: "♿",
          title: `ผู้พิการ ${totalDisabled} ราย`,
          detail: "ตรวจสอบสิทธิ์สวัสดิการ" });

      if (stats.children03 > 0)
        list.push({ id: "children03", level: "green", icon: "👶",
          title: `เด็กอายุ 0–3 ปี ${stats.children03} ราย`,
          detail: "ติดตามพัฒนาการและวัคซีน" });

      if (resolved > 0)
        list.push({ id: "resolved", level: "green", icon: "✅",
          title: `แก้ไขปัญหาสำเร็จแล้ว ${resolved} รายการ`,
          detail: `จากทั้งหมด ${issues.length} รายการ` });

      if (list.length === 0)
        list.push({ id: "noAlert", level: "green", icon: "🎉",
          title: "ไม่มีการแจ้งเตือนในขณะนี้", detail: "ระบบทำงานปกติ" });

      setAlerts(list);
      setLastFetched(Date.now());
    } catch {
      // silent fail
    }
  }, [village, lastFetched]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));
  const unread = visibleAlerts.filter(a => a.level === "red" || a.level === "orange").length;

  function dismiss(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDismissed(prev => {
      const next = new Set([...prev, id]);
      saveDismissed(next);
      return next;
    });
  }

  function dismissAll() {
    const all = new Set(alerts.map(a => a.id));
    saveDismissed(all);
    setDismissed(all);
  }

  function toggleDropdown() { setIsOpen(prev => !prev); }
  function closeDropdown()  { setIsOpen(false); }

  const handleBellClick = () => {
    toggleDropdown();
    fetchAlerts();
  };

  return (
    <div className="relative">
      {/* Bell */}
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleBellClick}
      >
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 z-10 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {unread > 9 ? "9+" : unread}
            <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping" />
          </span>
        )}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">การแจ้งเตือน</h5>
            {unread > 0 && (
              <span className="text-xs font-semibold bg-red-500 text-white rounded-full px-2 py-0.5">{unread}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {visibleAlerts.length > 0 && visibleAlerts[0].id !== "noAlert" && (
              <button onClick={dismissAll} className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                ล้างทั้งหมด
              </button>
            )}
            <button onClick={toggleDropdown} className="dropdown-toggle text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Alert list */}
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar gap-1">
          {alerts.length === 0 ? (
            <li className="flex items-center justify-center h-32 text-sm text-gray-400">กำลังโหลด...</li>
          ) : visibleAlerts.length === 0 ? (
            <li className="flex flex-col items-center justify-center h-32 gap-1">
              <p className="text-sm text-gray-400">ไม่มีการแจ้งเตือนที่ค้างอยู่</p>
            </li>
          ) : (
            visibleAlerts.map((alert) => (
              <li key={alert.id}>
                <div
                  className={`flex gap-3 rounded-xl px-3 py-2.5 cursor-default ${LEVEL_BG[alert.level]}`}
                >
                  <div className="flex-shrink-0 flex items-start gap-2 pt-0.5">
                    <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${LEVEL_DOT[alert.level]}`} />
                    <span className="text-base">{alert.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-snug">{alert.title}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{alert.detail}</p>
                  </div>
                  <button
                    onClick={(e) => dismiss(alert.id, e)}
                    className="flex-shrink-0 self-start mt-0.5 text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 transition-colors rounded p-0.5"
                    title="ปิดการแจ้งเตือนนี้"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
