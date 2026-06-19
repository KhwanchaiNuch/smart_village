"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVillage } from "@/context/VillageContext";
import { useGeoScope } from "@/context/GeoScopeContext";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="h-40 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-lg border border-gray-200 dark:border-gray-700" />,
});

// ── Interfaces ──────────────────────────────────────────────────────────────
interface ScopedVillage {
  villageId: number;
  tambonId: number;
  villageName: string;
  moo: string | null;
}

interface GeoProvince { provinceId: number; nameTh: string }
interface GeoAmphur   { amphurId: number;   provinceId: number; nameTh: string }
interface GeoTambon   { tambonId: number;   amphurId: number;   nameTh: string }

interface HouseholdData {
  householdId: number;
  houseNo: string;
  moo?: string;
  houseCondition: string;
  internetAccess: boolean;
  waterSystem: string;
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

interface VillageIndex {
  total: number;
  incomeScore: number;
  employmentScore: number;
  housingScore: number;
  elderlyAloneScore: number;
  healthScore: number;
  utilitiesScore: number;
}

interface IncomeSummary {
  totalPoor: number;
  incomeHistory: { year: string; total: number }[];
}

interface HealthIndex {
  total: number;
  sickScore: number;
  recordScore: number;
  visitScore: number;
  sickCount: number;
  atRiskCount: number;
  visitedCount: number;
}

interface IssuesSummary {
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  otherCount: number;
  totalCount: number;
}

function ReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { village } = useVillage();
  const { role } = useGeoScope();

  // URL Query parameter
  const queryVillageId = searchParams.get("villageId");

  // Geocoding & Village database lists
  const [provinces, setProvinces] = useState<GeoProvince[]>([]);
  const [amphurs, setAmphurs] = useState<GeoAmphur[]>([]);
  const [tambons, setTambons] = useState<GeoTambon[]>([]);
  const [scopedVillages, setScopedVillages] = useState<ScopedVillage[]>([]);
  const [geoLoaded, setGeoLoaded] = useState(false);

  // Selected scope state
  const [selectedVillageId, setSelectedVillageId] = useState<number | "">("");

  // Statistics State
  const [households, setHouseholds] = useState<HouseholdData[]>([]);
  const [popStats, setPopStats] = useState<PopStats | null>(null);
  const [villageIndex, setVillageIndex] = useState<VillageIndex | null>(null);
  const [incomeSummary, setIncomeSummary] = useState<IncomeSummary | null>(null);
  const [healthIndex, setHealthIndex] = useState<HealthIndex | null>(null);
  const [issuesSummary, setIssuesSummary] = useState<IssuesSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch geographic databases and scoped villages on mount
  useEffect(() => {
    document.title = "Smart Village | Report Summary";
    setLoading(true);

    Promise.all([
      axios.get<GeoProvince[]>("/provinces"),
      axios.get<GeoAmphur[]>("/amphurs/all"),
      axios.get<GeoTambon[]>("/tambons/all"),
      axios.get<ScopedVillage[]>("/villages/scoped"),
    ])
      .then(([pRes, aRes, tRes, vRes]) => {
        setProvinces(pRes.data);
        setAmphurs(aRes.data);
        setTambons(tRes.data);
        setScopedVillages(vRes.data);
        setGeoLoaded(true);

        // Determine initial village selection
        if (queryVillageId) {
          setSelectedVillageId(Number(queryVillageId));
        } else if (vRes.data.length === 1) {
          setSelectedVillageId(vRes.data[0].villageId);
        } else if (village?.villageId) {
          setSelectedVillageId(village.villageId);
        } else {
          setSelectedVillageId(""); // "ทุกหมู่บ้าน" (All villages)
        }
      })
      .catch((err) => {
        console.error("Failed to load geographic metadata:", err);
        Swal.fire({ icon: "error", title: "โหลดข้อมูลแผนที่และขอบเขตพื้นที่ไม่สำเร็จ" });
      });
  }, [queryVillageId, village]);

  // 2. Fetch report statistics when selection changes
  useEffect(() => {
    if (!geoLoaded) return;

    const params: Record<string, number> = {};
    if (selectedVillageId !== "") {
      params.villageId = Number(selectedVillageId);
    }

    setLoading(true);
    Promise.all([
      axios.get<HouseholdData[]>("/households", { params }),
      axios.get<PopStats>("/dashboard/population", { params }),
      axios.get<VillageIndex>("/dashboard/village-index", { params }),
      axios.get<IncomeSummary>("/dashboard/income-summary", { params }),
      axios.get<HealthIndex>("/dashboard/health-index", { params }),
      axios.get<IssuesSummary>("/dashboard/issues-summary", { params }),
    ])
      .then(([hRes, popRes, viRes, incRes, hiRes, issueRes]) => {
        setHouseholds(hRes.data);
        setPopStats(popRes.data);
        setVillageIndex(viRes.data);
        setIncomeSummary(incRes.data);
        setHealthIndex(hiRes.data);
        setIssuesSummary(issueRes.data);
      })
      .catch((err) => {
        console.error("Failed to load report data:", err);
        Swal.fire({ icon: "error", title: "โหลดข้อมูลสรุปสถิติไม่สำเร็จ" });
      })
      .finally(() => setLoading(false));
  }, [selectedVillageId, geoLoaded]);

  // 3. Resolve parent names for the selected village
  const resolvedGeo = useMemo(() => {
    if (!selectedVillageId) return null;
    const v = scopedVillages.find((x) => x.villageId === Number(selectedVillageId));
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
  }, [selectedVillageId, scopedVillages, tambons, amphurs, provinces]);

  const handlePrint = () => {
    window.print();
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedVillageId(val === "" ? "" : Number(val));
    // sync with URL query param silently
    const newUrl = val === "" ? "/report" : `/report?villageId=${val}`;
    window.history.replaceState(null, "", newUrl);
  };

  // Evaluation labels
  const getRatingLabel = (score: number) => {
    if (score >= 80) return "ดีเยี่ยม (Excellent)";
    if (score >= 60) return "ผ่านเกณฑ์ (Pass)";
    return "ควรปรับปรุง (Needs Improvement)";
  };

  const getRatingLabelBadge = (score: number) => {
    if (score >= 80) return <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[9px] print:bg-emerald-100 print:text-emerald-800">ดีเยี่ยม (Excellent)</span>;
    if (score >= 60) return <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold text-[9px] print:bg-blue-100 print:text-blue-800">ผ่านเกณฑ์ (Pass)</span>;
    return <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold text-[9px] print:bg-red-100 print:text-red-800">ควรปรับปรุง (Needs Improvement)</span>;
  };

  // Derived variables
  const totalHouseholds = households.length;
  const poorHouseholds = incomeSummary?.totalPoor ?? 0;
  const poorPercentage = totalHouseholds > 0 ? ((poorHouseholds / totalHouseholds) * 100).toFixed(1) : "0.0";
  const internetAccessCount = households.filter((h) => h.internetAccess === true).length;
  const internetPercentage = totalHouseholds > 0 ? ((internetAccessCount / totalHouseholds) * 100).toFixed(1) : "0.0";
  const conditionChanut = households.filter((h) => h.houseCondition === "ชำรุด" || h.houseCondition === "ทรุดโทรม").length;

  // ── ApexCharts Colored Configurations ──────────────────────────────────────
  const fontColor = "#111827"; 

  const popYearOpts: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent", animations: { enabled: false } },
    colors: ["#3b82f6", "#ec4899"], // Blue (Male), Pink (Female)
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 2 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["#ffffff"] },
    xaxis: {
      categories: popStats?.populationByYear.map((r) => r.year) || [],
      labels: { style: { colors: fontColor, fontSize: "10px", fontWeight: "bold" } },
    },
    yaxis: { labels: { style: { colors: fontColor, fontSize: "10px" } } },
    legend: { show: true, position: "top", labels: { colors: fontColor } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 2 },
  };

  const popYearSeries = [
    { name: "ชาย", data: popStats?.populationByYear.map((r) => r.male) || [] },
    { name: "หญิง", data: popStats?.populationByYear.map((r) => r.female) || [] },
  ];

  const ageOpts: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent", animations: { enabled: false } },
    colors: ["#3b82f6", "#ec4899"], // Blue (Male), Pink (Female)
    plotOptions: { bar: { horizontal: true, barHeight: "60%", borderRadius: 2 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: popStats?.ageGroups.map((g) => g.label) || [],
      labels: { style: { colors: fontColor, fontSize: "10px" } },
    },
    yaxis: { labels: { style: { colors: fontColor, fontSize: "10px", fontWeight: "bold" } } },
    legend: { show: true, position: "top", labels: { colors: fontColor } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 2 },
  };

  const ageSeries = [
    { name: "ชาย", data: popStats?.ageGroups.map((g) => g.male) || [] },
    { name: "หญิง", data: popStats?.ageGroups.map((g) => g.female) || [] },
  ];

  const incomeOpts: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, background: "transparent", animations: { enabled: false } },
    colors: ["#10b981"], // Emerald Green
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 95]
      }
    },
    markers: { size: 4, colors: ["#10b981"] },
    xaxis: {
      categories: incomeSummary?.incomeHistory.map((r) => r.year) || [],
      labels: { style: { colors: fontColor, fontSize: "10px", fontWeight: "bold" } },
    },
    yaxis: {
      labels: {
        style: { colors: fontColor, fontSize: "10px" },
        formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`,
      },
    },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 2 },
  };

  const incomeSeries = [{ name: "รายได้รวม (บาท)", data: incomeSummary?.incomeHistory.map((r) => Number(r.total)) || [] }];

  const issueSlices = useMemo(() => {
    const all = [
      { label: "ยังไม่แก้ไข", count: issuesSummary?.openCount || 0, color: "#ef4444" }, // Red
      { label: "กำลังแก้ไข", count: issuesSummary?.inProgressCount || 0, color: "#f59e0b" }, // Amber
      { label: "แก้ไขเสร็จสิ้น", count: issuesSummary?.resolvedCount || 0, color: "#10b981" }, // Emerald
    ];
    const filtered = all.filter((s) => s.count > 0);
    return filtered.length > 0 ? filtered : [{ label: "ไม่มีรายงาน", count: 1, color: "#f3f4f6" }];
  }, [issuesSummary]);

  const issueOpts: ApexOptions = {
    chart: { type: "donut", animations: { enabled: false } },
    labels: issueSlices.map((s) => s.label),
    colors: issueSlices.map((s) => s.color),
    legend: { position: "bottom", labels: { colors: fontColor } },
    stroke: { width: 1, colors: ["#ffffff"] },
    plotOptions: { pie: { donut: { size: "60%" } } },
    dataLabels: { enabled: true, style: { colors: ["#ffffff"] } },
  };

  return (
    <PermissionGuard menuUrl="/household">
      <>
        {/* Print Style Overrides */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            aside, header, .no-print, button, .breadcrumb {
              display: none !important;
            }
            body, html, main, .flex-1, .p-4, .p-6 {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            .lg\\:ml-\\[290px\\], .lg\\:ml-\\[90px\\], .ml-0 {
              margin-left: 0 !important;
            }
            .print-page {
              padding: 10mm 15mm !important;
              width: 210mm;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
            }
            .print-break {
              page-break-before: always;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            th, td {
              border: 1px solid #e2e8f0 !important;
            }
            th {
              background-color: #f0fdf4 !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}} />

        {/* Action Header Menu */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 no-print">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">เลือกพื้นที่ออกรายงาน:</label>
            <select
              value={selectedVillageId}
              onChange={handleVillageChange}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {role !== "VILLAGE" && <option value="">-- สรุปผลทุกหมู่บ้าน --</option>}
              {scopedVillages.map((v) => (
                <option key={v.villageId} value={v.villageId}>
                  {v.villageName} {v.moo ? `(หมู่ ${v.moo})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
            >
              กลับหน้าหลัก
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm cursor-pointer transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.821V21m0 0H18m-11.28 0h3.96m0 0V13.821m0 0h4.86M18 10.179V21m0 0H18m0 0h1.8M18 21h-2.1m0 0V10.179M3 10.179h18M6.72 6.72h10.56M12 3v3.72" />
              </svg>
              พิมพ์รายงานสรุป (PDF)
            </button>
          </div>
        </div>

        {/* Report Document Wrapper */}
        <div className="mx-auto max-w-[210mm] border border-gray-200 bg-white p-12 text-black print-page rounded-none shadow-sm dark:border-gray-800 font-sans">
          
          {/* 1. Header Metadata Section */}
          <div className="border-b-4 border-double border-emerald-600 pb-5 text-center mb-8">
            <h1 className="text-xl font-bold uppercase tracking-wider mb-2 text-emerald-800">รายงานสรุปผลคุณภาพชีวิตและการพัฒนาหมู่บ้านอัจฉริยะ</h1>
            <p className="text-sm font-bold text-gray-700">ประจำโครงการหมู่บ้านอัจฉริยะ (Smart Village)</p>
            
            <div className="mt-5 text-sm space-y-1.5 text-left max-w-2xl mx-auto border border-emerald-500 p-3.5 bg-emerald-50/10 rounded-lg">
              {resolvedGeo ? (
                <div className="grid grid-cols-2 gap-y-2 text-emerald-950">
                  <p><strong>หมู่บ้าน:</strong> {resolvedGeo.villageName}</p>
                  <p><strong>หมู่ที่:</strong> {resolvedGeo.moo}</p>
                  <p><strong>ตำบล:</strong> {resolvedGeo.tambonName}</p>
                  <p><strong>อำเภอ:</strong> {resolvedGeo.amphurName}</p>
                  <p className="col-span-2"><strong>จังหวัด:</strong> {resolvedGeo.provinceName}</p>
                </div>
              ) : (
                <p className="text-center font-bold text-emerald-900">ขอบเขต: ทุกหมู่บ้านในเขตพื้นที่รับผิดชอบ</p>
              )}
              <p className="text-xs text-emerald-600 pt-1 border-t border-emerald-200">
                วันที่ออกเอกสาร: {new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <p className="animate-pulse text-sm">กำลังรวบรวมข้อมูลและจำลองแผนภูมิสำหรับจัดทำรายงาน...</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* 2. Demographics KPI cards (Color-coded Borders and Backgrounds) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-emerald-600 text-emerald-800 pb-1">1. ข้อมูลสถิติโครงสร้างประชากรและครัวเรือน</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-emerald-500 bg-emerald-50/20 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-emerald-700 font-bold uppercase">ครัวเรือนทั้งหมด</p>
                    <p className="text-xl font-black text-emerald-900 mt-0.5">{totalHouseholds} หลัง</p>
                  </div>
                  <div className="border border-emerald-500 bg-emerald-50/20 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-emerald-700 font-bold uppercase">ประชากรทั้งหมด</p>
                    <p className="text-xl font-black text-emerald-900 mt-0.5">{popStats?.totalPersons || 0} คน</p>
                  </div>
                  <div className="border border-blue-500 bg-blue-50/20 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-blue-700 font-bold uppercase">เด็กแรกเกิด (0-3 ปี)</p>
                    <p className="text-xl font-black text-blue-900 mt-0.5">{popStats?.children03 || 0} คน</p>
                  </div>
                  <div className="border border-amber-500 bg-amber-50/20 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-amber-700 font-bold uppercase">ผู้สูงอายุ (60 ปีขึ้นไป)</p>
                    <p className="text-xl font-black text-amber-900 mt-0.5">{popStats?.totalElderly || 0} คน</p>
                  </div>
                  <div className="border border-purple-500 bg-purple-50/20 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-purple-700 font-bold uppercase">ผู้พิการในชุมชน</p>
                    <p className="text-xl font-black text-purple-900 mt-0.5">{popStats?.totalDisabled || 0} คน</p>
                  </div>
                  <div className="border border-red-500 bg-red-50/20 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-red-700 font-bold uppercase">ผู้ป่วยติดเตียง</p>
                    <p className="text-xl font-black text-red-900 mt-0.5">{popStats?.totalBedridden || 0} คน</p>
                  </div>
                </div>
              </div>

              {/* 3. Dashboard Vector Charts (Print layout) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 border-b border-emerald-600 text-emerald-800 pb-1">2. แผนภูมิจำลองโครงสร้างสถิติชุมชน (Vector Dashboard Printout)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[10px] font-bold text-center mb-1.5 uppercase text-gray-700">สถิติประชากรย้อนหลังรายปี (แยก ชาย-หญิง)</p>
                    {popStats?.populationByYear && popStats.populationByYear.length > 0 ? (
                      <ReactApexChart type="bar" options={popYearOpts} series={popYearSeries} height={160} />
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-10">ไม่มีข้อมูลย้อนหลัง</p>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[10px] font-bold text-center mb-1.5 uppercase text-gray-700">โครงสร้างอายุประชากรในพื้นที่ (แยก ชาย-หญิง)</p>
                    {popStats?.ageGroups && popStats.totalPersons > 0 ? (
                      <ReactApexChart type="bar" options={ageOpts} series={ageSeries} height={160} />
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-10">ไม่มีข้อมูลโครงสร้างอายุ</p>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[10px] font-bold text-center mb-1.5 uppercase text-gray-700">สถิติรายได้รวมชุมชนรายปี (บาท)</p>
                    {incomeSummary?.incomeHistory && incomeSummary.incomeHistory.length > 0 ? (
                      <ReactApexChart type="area" options={incomeOpts} series={incomeSeries} height={160} />
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-10">ไม่มีประวัติรายได้ครัวเรือน</p>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[10px] font-bold text-center mb-1.5 uppercase text-gray-700">สัดส่วนและสถานะการจัดการปัญหาชุมชน</p>
                    {issuesSummary && issuesSummary.totalCount > 0 ? (
                      <ReactApexChart type="donut" options={issueOpts} series={issueSlices.map((s) => s.count)} height={160} />
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-10">ไม่มีปัญหาชุมชนที่บันทึก</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Page break to keep tables clean on page 2 */}
              <div className="print-break" />

              {/* 4. Tabular Data sheets (Option B table layouts) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-emerald-600 text-emerald-800 pb-1">3. ดัชนีการพัฒนาและดัชนีภาพรวมสุขภาวะชุมชน</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Village strong index table */}
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[11px] font-bold mb-2 uppercase text-center border-b border-emerald-600 text-emerald-800 pb-1">คะแนนดัชนีหมู่บ้านเข้มแข็ง (Strong Village Index)</p>
                    {villageIndex ? (
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-emerald-200 bg-emerald-50/50">
                            <th className="text-left font-bold py-1 px-2 text-emerald-950">มิติประเมิน</th>
                            <th className="text-center font-bold py-1 px-2 text-emerald-950">คะแนนเต็ม</th>
                            <th className="text-right font-bold py-1 px-2 text-emerald-950">ได้</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                            <td className="py-1 px-2 text-gray-700">ด้านที่อยู่อาศัย (Housing)</td>
                            <td className="text-center text-gray-600">100</td>
                            <td className="text-right font-semibold text-gray-800">{villageIndex.housingScore}</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                            <td className="py-1 px-2 text-gray-700">ด้านรายได้ครัวเรือน (Income)</td>
                            <td className="text-center text-gray-600">100</td>
                            <td className="text-right font-semibold text-gray-800">{villageIndex.incomeScore}</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                            <td className="py-1 px-2 text-gray-700">ด้านการจ้างงาน (Employment)</td>
                            <td className="text-center text-gray-600">100</td>
                            <td className="text-right font-semibold text-gray-800">{villageIndex.employmentScore}</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                            <td className="py-1 px-2 text-gray-700">ด้านสาธารณูปโภค (Utilities)</td>
                            <td className="text-center text-gray-600">100</td>
                            <td className="text-right font-semibold text-gray-800">{villageIndex.utilitiesScore}</td>
                          </tr>
                          <tr className="border-b border-emerald-200 hover:bg-gray-50/30">
                            <td className="py-1 px-2 text-gray-700">ด้านสังคมผู้สูงอายุ (Social)</td>
                            <td className="text-center text-gray-600">100</td>
                            <td className="text-right font-semibold text-gray-800">{villageIndex.elderlyAloneScore}</td>
                          </tr>
                          <tr className="font-bold bg-emerald-50/30 text-emerald-900">
                            <td className="py-1 px-2">คะแนนดัชนีหมู่บ้านรวม</td>
                            <td className="text-center">100</td>
                            <td className="text-right">{villageIndex.total}</td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-[10px] text-center text-gray-400 py-6">ไม่มีข้อมูลดัชนี</p>
                    )}
                    <p className="text-[9px] mt-2.5 font-bold text-center border-t border-emerald-100 pt-1.5 flex items-center justify-center gap-1.5 text-gray-700">
                      <span>ระดับการประเมิน:</span> {getRatingLabelBadge(villageIndex?.total || 0)}
                    </p>
                  </div>

                  {/* Public health index table */}
                  <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <p className="text-[11px] font-bold mb-2 uppercase text-center border-b border-emerald-600 text-emerald-800 pb-1">คะแนนดัชนีสุขภาวะและระบบสุขภาพชุมชน</p>
                    {healthIndex ? (
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-emerald-200 bg-emerald-50/50">
                            <th className="text-left font-bold py-1 px-2 text-emerald-950">มิติประเมิน</th>
                            <th className="text-center font-bold py-1 px-2 text-emerald-950">คะแนนเต็ม</th>
                            <th className="text-right font-bold py-1 px-2 text-emerald-950">ได้</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                            <td className="py-1 px-2 text-gray-700">ด้านสุขภาวะประชากร</td>
                            <td className="text-center text-gray-600">40</td>
                            <td className="text-right font-semibold text-gray-800">{healthIndex.sickScore}</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                            <td className="py-1 px-2 text-gray-700">ความครอบคลุมการลงบันทึกประวัติ</td>
                            <td className="text-center text-gray-600">40</td>
                            <td className="text-right font-semibold text-gray-800">{healthIndex.recordScore}</td>
                          </tr>
                          <tr className="border-b border-emerald-200 hover:bg-gray-50/30">
                            <td className="py-1 px-2 text-gray-700">การออกติดตามเยี่ยมบ้านกลุ่มเสี่ยง</td>
                            <td className="text-center text-gray-600">20</td>
                            <td className="text-right font-semibold text-gray-800">{healthIndex.visitScore}</td>
                          </tr>
                          <tr className="font-bold bg-emerald-50/30 text-emerald-900">
                            <td className="py-1 px-2">คะแนนดัชนีสุขภาพรวม</td>
                            <td className="text-center">100</td>
                            <td className="text-right">{healthIndex.total}</td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-[10px] text-center text-gray-400 py-6">ไม่มีข้อมูลดัชนีสุขภาพ</p>
                    )}
                    <p className="text-[9px] mt-2.5 font-bold text-center border-t border-emerald-100 pt-1.5 flex items-center justify-center gap-1.5 text-gray-700">
                      <span>ระดับการประเมิน:</span> {getRatingLabelBadge(healthIndex?.total || 0)}
                    </p>
                  </div>
                </div>

                {/* Additional Tabular QoL Indicators */}
                <div className="mt-5 border border-emerald-200 rounded-xl overflow-hidden shadow-sm bg-white">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-emerald-50 border-b border-emerald-200 text-emerald-800">
                        <th className="px-3 py-2 font-bold text-left border-r border-emerald-100">รายการดัชนีวิเคราะห์สถานการณ์</th>
                        <th className="px-3 py-2 text-center font-bold border-r border-emerald-100 w-28">จำนวนเคส</th>
                        <th className="px-3 py-2 text-center font-bold border-r border-emerald-100 w-28">ร้อยละ (%)</th>
                        <th className="px-3 py-2 font-bold text-left">ข้อเสนอแนะเชิงประเมินเบื้องต้น</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                        <td className="px-3 py-2 border-r border-gray-100 text-gray-700 font-medium">ครัวเรือนยากจน (รายได้ต่ำกว่า 3,000 บาท/เดือน)</td>
                        <td className="px-3 py-2 text-center border-r border-gray-100">
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${poorHouseholds > 0 ? "bg-red-50 text-red-700 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                            {poorHouseholds} ครัวเรือน
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center border-r border-gray-100">
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${poorHouseholds > 0 ? "bg-red-50 text-red-700 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                            {poorPercentage}%
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold">
                          {poorHouseholds > 0 ? (
                            <span className="text-red-600 flex items-center gap-1">⚠️ ควรเฝ้าระวัง ส่งเสริมทักษะอาชีพคู่ขนาน</span>
                          ) : (
                            <span className="text-emerald-600 flex items-center gap-1">✅ สถานการณ์ปกติ</span>
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                        <td className="px-3 py-2 border-r border-gray-100 text-gray-700 font-medium">บ้านพักอาศัยชำรุด/ชำรุดทรุดโทรมมาก</td>
                        <td className="px-3 py-2 text-center border-r border-gray-100">
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${conditionChanut > 0 ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                            {conditionChanut} หลัง
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center border-r border-gray-100">
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${conditionChanut > 0 ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                            {totalHouseholds > 0 ? ((conditionChanut / totalHouseholds) * 100).toFixed(1) : 0}%
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold">
                          {conditionChanut > 0 ? (
                            <span className="text-amber-600 flex items-center gap-1">⚠️ ควรเสนอโครงการพัฒนาท้องถิ่นเพื่อปรับปรุงกายภาพ</span>
                          ) : (
                            <span className="text-emerald-600 flex items-center gap-1">✅ สถานการณ์ปกติ</span>
                          )}
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/30">
                        <td className="px-3 py-2 border-r border-gray-100 text-gray-700 font-medium">การเข้าถึงเครือข่ายดิจิทัลอินเทอร์เน็ต</td>
                        <td className="px-3 py-2 text-center border-r border-gray-100">
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${Number(internetPercentage) >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                            {internetAccessCount} หลัง
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center border-r border-gray-100">
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${Number(internetPercentage) >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                            {internetPercentage}%
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold">
                          {Number(internetPercentage) >= 80 ? (
                            <span className="text-emerald-600 flex items-center gap-1">✅ การเข้าถึงระบบข้อมูลดีเยี่ยม</span>
                          ) : (
                            <span className="text-amber-600 flex items-center gap-1">⚠️ ควรพิจารณาขยายจุดบริการอินเทอร์เน็ตชุมชน</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Policy Advice & Signature Block */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-emerald-600 text-emerald-800 pb-1">4. ข้อพิจารณาและมาตรการพัฒนาช่วยเหลือเชิงรุก</h3>
                  
                  <div className="space-y-2 mt-3 text-xs">
                    {poorHouseholds > 0 && (
                      <div className="flex gap-2.5 items-start p-2.5 rounded-lg border border-red-100 bg-red-50/20">
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">1</span>
                        <p className="text-gray-800 leading-relaxed">
                          <strong className="text-red-900">มิติด้านเศรษฐกิจ:</strong> ดำเนินนโยบายส่งเสริมสัมมาชีพชุมชน และจับคู่บุคคลที่มีทักษะตรงกับความต้องการตลาด (Skill Matching) แก่ครัวเรือนยากจนเป้าหมายจำนวน <span className="font-bold text-red-700">{poorHouseholds} ครัวเรือน</span>
                        </p>
                      </div>
                    )}
                    {conditionChanut > 0 && (
                      <div className="flex gap-2.5 items-start p-2.5 rounded-lg border border-amber-100 bg-amber-50/20">
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">2</span>
                        <p className="text-gray-800 leading-relaxed">
                          <strong className="text-amber-900">มิติด้านสุขาภิบาลและที่อยู่อาศัย:</strong> เสนอขอรับงบประมาณสงเคราะห์ปรับปรุงบ้านผู้สูงอายุ/ผู้ยากไร้ จากกระทรวงการพัฒนาสังคมฯ สำหรับบ้านสภาพชำรุดทรุดโทรมจำนวน <span className="font-bold text-amber-700">{conditionChanut} หลังคาเรือน</span>
                        </p>
                      </div>
                    )}
                    {healthIndex && healthIndex.sickCount > 0 && (
                      <div className="flex gap-2.5 items-start p-2.5 rounded-lg border border-blue-100 bg-blue-50/20">
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">3</span>
                        <p className="text-gray-800 leading-relaxed">
                          <strong className="text-blue-900">มิติด้านสุขภาวะชุมชน:</strong> มอบหมายให้อาสาสมัครสาธารณสุข (อสม.) ออกแผนเยี่ยมบ้านและเฝ้าระวังกลุ่มผู้สูงอายุและผู้ป่วยติดเตียงรวมจำนวน <span className="font-bold text-blue-700">{healthIndex.sickCount + (popStats?.totalBedridden || 0)} คน</span> อย่างต่อเนื่องในทุกรอบเดือน
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2.5 items-start p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/20">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        { (poorHouseholds > 0 ? 1 : 0) + (conditionChanut > 0 ? 1 : 0) + (healthIndex && healthIndex.sickCount > 0 ? 1 : 0) + 1 }
                      </span>
                      <p className="text-gray-800 leading-relaxed">
                        <strong className="text-emerald-950">การยกระดับฐานข้อมูล:</strong> ประชาสัมพันธ์รณรงค์เก็บบันทึกข้อมูลของบุคคลและครอบครัวเพิ่มเติมเพื่อให้ข้อมูลเกิดความครอบคลุมร้อยละ 100 ส่งผลดีต่อความแม่นยำในการวางแผนจัดทำแผนพัฒนาชุมชนท้องถิ่นต่อไป
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signature Table Blocks */}
                <div className="pt-10">
                  <div className="flex justify-between text-xs text-center">
                    <div className="w-64">
                      <p>ลงชื่อ....................................................................</p>
                      <p className="mt-2 font-bold text-emerald-950">ผู้จัดทำและประมวลผลรายงานสรุป</p>
                      <p className="text-gray-500 mt-1"> ( ตำแหน่ง: เจ้าหน้าที่ อสม. / ผู้บันทึกข้อมูล )</p>
                    </div>
                    <div className="w-64">
                      <p>ลงชื่อ....................................................................</p>
                      <p className="mt-2 font-bold text-emerald-950">ผู้ตรวจสอบและรับรองผลรายงานสรุป</p>
                      <p className="text-gray-500 mt-1"> ( ตำแหน่ง: ผู้ใหญ่บ้าน / ผู้นำชุมชน )</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </>
    </PermissionGuard>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p className="animate-pulse">กำลังโหลด...</p>
      </div>
    }>
      <ReportPageContent />
    </Suspense>
  );
}
