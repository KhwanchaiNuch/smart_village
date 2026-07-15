"use client";

import { useEffect } from "react";
import Image from "next/image";
import "./promo.css";

const FILTER_RAIL_ICONS = [
  "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
  "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1",
  "M4 4v5h5M20 20v-5h-5M4.5 9a8 8 0 0113.9-3M19.5 15a8 8 0 01-13.9 3",
  "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
];

function HeroMapFilterPanel() {
  const compact = true;
  return (
    <div className="absolute inset-y-0 left-0 z-20 flex pointer-events-none">
      {/* Icon rail */}
      <div className={`flex flex-col items-center gap-3 bg-gradient-to-b from-[#075b38] to-[#063b28] py-4 flex-shrink-0 shadow-lg pointer-events-auto ${compact ? "w-12" : "w-14"}`}>
        {FILTER_RAIL_ICONS.map((d, i) => (
          <div
            key={i}
            className={`rounded-lg flex items-center justify-center ${compact ? "w-8 h-8" : "w-10 h-10"} ${i === 1 ? "bg-green-600" : ""}`}
          >
            <svg className={compact ? "w-4 h-4" : "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: "white" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d={d} />
            </svg>
          </div>
        ))}
      </div>
      {/* Filter panel */}
      <div className={`ml-2 mt-14 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl flex-shrink-0 overflow-y-auto pointer-events-auto ${compact ? "w-36 h-[300px] p-2.5" : "w-40 p-3"}`}>
        <div className={`font-bold text-gray-700 mb-2 ${compact ? "text-[10px]" : "text-xs"}`}>ตัวกรอง</div>
        {[
          ["หมู่บ้าน", "หมู่ที่ 5 บ้านหนองบัว"],
          ["หมวดครัวเรือน", "ทั้งหมด"],
          ["สถานะเยี่ยมบ้าน", "ทั้งหมด"],
          ["กลุ่มประชากร", "ทั้งหมด"],
        ].map(([label, value]) => (
          <div key={label} className="mb-1.5">
            <div className={`text-gray-400 mb-0.5 ${compact ? "text-[8px]" : "text-[9px]"}`}>{label}</div>
            <div className={`flex items-center justify-between border border-gray-200 rounded-md text-gray-600 ${compact ? "px-1.5 py-1 text-[8px]" : "px-1.5 py-1 text-[9px]"}`}>
              {value}
              <svg className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        ))}
        <label className={`flex items-center gap-1.5 text-gray-500 mb-2 ${compact ? "text-[7px]" : "text-[8px]"}`}>
          <input type="checkbox" className="w-2.5 h-2.5" readOnly />
          เฉพาะครัวเรือนที่มีปัญหา
        </label>
        <button className={`w-full bg-green-700 text-white rounded-md font-semibold ${compact ? "text-[9px] py-1" : "text-[10px] py-1.5"}`}>ค้นหา</button>
      </div>
    </div>
  );
}

function MapFilterPanel() {
  const compact = false;

  return (
    <div className="absolute inset-y-0 left-0 z-20 flex pointer-events-none">
      {/* Icon rail */}
      <div className={`flex flex-col items-center gap-3 bg-gradient-to-b from-[#075b38] to-[#063b28] py-4 flex-shrink-0 shadow-lg pointer-events-auto ${compact ? "w-11" : "w-14"}`}>
        {FILTER_RAIL_ICONS.map((d, i) => (
          <div
            key={i}
            className={`rounded-lg flex items-center justify-center ${compact ? "w-8 h-8" : "w-10 h-10"} ${i === 1 ? "bg-green-600" : ""}`}
          >
            <svg className={compact ? "w-4 h-4" : "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: "white" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d={d} />
            </svg>
          </div>
        ))}
      </div>
      {/* Filter panel */}
      <div className={`self-start ml-2 mt-14 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl flex-shrink-0 overflow-y-auto pointer-events-auto ${compact ? "w-36 h-[300px] p-2.5" : "w-40 p-3"}`}>
        <div className={`font-bold text-gray-700 mb-2 ${compact ? "text-[10px]" : "text-xs"}`}>ตัวกรอง</div>
        {[
          ["หมู่บ้าน", "หมู่ที่ 5 บ้านหนองบัว"],
          ["หมวดครัวเรือน", "ทั้งหมด"],
          ["สถานะเยี่ยมบ้าน", "ทั้งหมด"],
          ["กลุ่มประชากร", "ทั้งหมด"],
        ].map(([label, value]) => (
          <div key={label} className="mb-1.5">
            <div className={`text-gray-400 mb-0.5 ${compact ? "text-[8px]" : "text-[9px]"}`}>{label}</div>
            <div className={`flex items-center justify-between border border-gray-200 rounded-md text-gray-600 ${compact ? "px-1.5 py-1 text-[8px]" : "px-1.5 py-1 text-[9px]"}`}>
              {value}
              <svg className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        ))}
        <label className={`flex items-center gap-1.5 text-gray-500 mb-2 ${compact ? "text-[7px]" : "text-[8px]"}`}>
          <input type="checkbox" className="w-2.5 h-2.5" readOnly />
          เฉพาะครัวเรือนที่มีปัญหา
        </label>
        <button className={`w-full bg-green-700 text-white rounded-md font-semibold ${compact ? "text-[9px] py-1" : "text-[10px] py-1.5"}`}>ค้นหา</button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".promo-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("promo-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -50px 0px", threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="promo-page text-slate-900 bg-white antialiased relative overflow-hidden">
      
      {/* Background glow blobs */}
      <div className="absolute top-[10%] left-[-10%] w-96 h-96 rounded-full bg-green-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[-10%] w-[450px] h-[450px] rounded-full bg-yellow-500/6 blur-[130px] pointer-events-none z-0"></div>

      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-6xl mx-auto px-6 h-[76px] flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <Image
              src="/images/logo/smart-village-logo.png"
              alt="หมู่บ้านดิจิตอล"
              width={38}
              height={38}
              className="object-contain"
            />
            <span className="font-bold text-[19px] text-[#14532d] tracking-tight">
              หมู่บ้าน<span className="text-yellow-500">ดิจิตอล</span>
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <li><a href="#features" className="hover:text-green-700 transition-colors">ฟีเจอร์</a></li>
            <li><a href="#howitworks" className="hover:text-green-700 transition-colors">การทำงาน</a></li>
            <li><a href="#benefits" className="hover:text-green-700 transition-colors">ประโยชน์</a></li>
            <li><a href="#contact" className="hover:text-green-700 transition-colors">ติดต่อเรา</a></li>
          </ul>

          <a
            href="/signin"
            className="inline-flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm"
          >
            ขอชมระบบ
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </a>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-[76px] bg-white/40 flex items-center overflow-hidden relative" id="home font-sans">
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16 w-full">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-14 items-start">
            {/* Left */}
            <div className="promo-reveal lg:pt-12 relative z-10">
              
              {/* Tech Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[11px] font-semibold tracking-wide uppercase text-green-700 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Smart Village Platform 3.0
              </div>

              <h1 className="font-bold text-3xl xs:text-4xl sm:text-5xl lg:text-[4rem] leading-[1.16] mb-6 text-slate-900">
                <span className="block whitespace-nowrap">ข้อมูลทุกครัวเรือน</span>
                <span className="block text-[#15803d] whitespace-nowrap">มองเห็นได้บนแผนที่</span>
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-lg">
                ระบบบริการข้อมูลชุมชน สำหรับผู้นำหมู่บ้าน<br />
                และองค์กรปกครองส่วนท้องถิ่น
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <a
                  href="/signin"
                  className="inline-flex items-center justify-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white font-bold px-7 py-3 rounded-full transition-all duration-200 text-sm shadow-sm"
                >
                  ขอชมระบบ
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-bold px-7 py-3 rounded-full border border-slate-200 transition-all duration-200 text-sm shadow-sm"
                >
                  ดูฟีเจอร์
                </a>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col items-start text-left">
                  <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="font-bold text-slate-800 text-sm mb-1">ปลอดภัย</span>
                  <span className="text-xs text-slate-400 leading-snug font-medium">มาตรฐานความปลอดภัยตามกฎหมาย PDPA</span>
                </div>
                <div className="flex flex-col items-start text-left">
                  <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 001-9.9 6 6 0 00-11.6 2.1A4 4 0 003 15z" />
                    </svg>
                  </div>
                  <span className="font-bold text-slate-800 text-sm mb-1">ใช้งานง่าย</span>
                  <span className="text-xs text-slate-400 leading-snug font-medium">ออกแบบเพื่อผู้ใช้งานทุกระดับ</span>
                </div>
                <div className="flex flex-col items-start text-left">
                  <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.5 9a8 8 0 0113.9-3M19.5 15a8 8 0 01-13.9 3" />
                    </svg>
                  </div>
                  <span className="font-bold text-slate-800 text-sm mb-1">อัปเดตเรียลไทม์</span>
                  <span className="text-xs text-slate-400 leading-snug font-medium">ข้อมูลถูกต้อง ทันสมัย ทำงานร่วมกันได้</span>
                </div>
              </div>
            </div>

            {/* Right — Map mockup */}
            <div className="promo-reveal hidden lg:block relative">
              <div className="absolute -inset-10 rounded-full bg-gradient-to-tr from-green-400/10 to-yellow-400/6 blur-3xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                {/* Map area */}
                <div className="relative flex" style={{ height: "600px" }}>
                  <HeroMapFilterPanel />
                  <div
                    className="relative bg-green-900 bg-cover bg-center flex-1"
                    style={{ backgroundImage: "url('/images/promo/village-aerial-map.png')" }}
                  >
                    {/* Subtle darken tint */}
                    <div className="absolute inset-0 bg-green-950/10" />
                    {/* House pin markers */}
                    {[
                      { x: 30, y: 28, color: "#ef4444" },
                      { x: 50, y: 42, color: "#22c55e" },
                      { x: 68, y: 22, color: "#22c55e" },
                      { x: 18, y: 52, color: "#f59e0b" },
                      { x: 40, y: 68, color: "#3b82f6" },
                      { x: 80, y: 50, color: "#22c55e" },
                      { x: 60, y: 78, color: "#22c55e" },
                    ].map((m, i) => (
                      <div
                        key={i}
                        className="absolute"
                        style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -100%)" }}
                      >
                        <svg width="18" height="23" viewBox="0 0 22 28" className="drop-shadow-md">
                          <path d="M11 0C4.9 0 0 4.9 0 11c0 8 11 17 11 17s11-9 11-17C22 4.9 17.1 0 11 0z" fill={m.color} />
                          <circle cx="11" cy="11" r="4" fill="white" />
                        </svg>
                      </div>
                    ))}

                    {/* Search bar overlay */}
                    <div className="absolute top-3 left-[52px] right-3 flex gap-2">
                      <div className="flex-1 bg-white rounded-lg px-3 py-2 text-xs text-gray-400 flex items-center gap-2 shadow">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        ค้นหาบ้าน / เจ้าบ้าน / เลขที่บ้าน
                      </div>
                      <div className="bg-white rounded-lg w-9 flex items-center justify-center shadow">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/></svg>
                      </div>
                      <div className="bg-white rounded-lg w-9 flex items-center justify-center shadow">
                        <svg className="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>
                      </div>
                    </div>

                    {/* Household detail popup */}
                    <div className="absolute top-14 right-3 w-40 bg-white rounded-xl shadow-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-gray-700">ครัวเรือน</span>
                        <span className="text-gray-400 text-xs leading-none">×</span>
                      </div>
                      <div className="text-[7px] text-gray-400 mb-1.5">S-005-0123/1</div>
                      <div className="text-[10px] font-bold text-green-700 mb-1">นายสมชาย ใจดี</div>
                      <div className="text-[7px] text-gray-400 leading-snug mb-2">123 หมู่ 5 บ้านหนองบัว ต.หนองบัว อ.เมือง จ.อุดรธานี</div>
                      <div className="space-y-1 text-[8px] border-t border-gray-100 pt-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">สมาชิกในครัวเรือน</span>
                          <span className="font-bold">4 คน</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">กลุ่มเป้าหมาย</span>
                          <span className="bg-orange-100 text-orange-600 rounded-full px-1.5 text-[7px] font-semibold">ผู้สูงอายุ</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">สถานะเยี่ยมบ้าน</span>
                          <span className="bg-green-100 text-green-700 rounded-full px-1.5 text-[7px] font-semibold">เยี่ยมแล้ว</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">เยี่ยมล่าสุด</span>
                          <span className="font-bold">12 พ.ค. 2567</span>
                        </div>
                      </div>
                      <button className="mt-2 w-full py-1.5 border border-green-600 text-green-700 text-[9px] rounded-lg font-semibold">ดูรายละเอียด</button>
                    </div>
                  </div>
                </div>

                {/* Stats bar */}
                <div className="absolute z-10 bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-3.5 shadow-lg border border-white/80">
                  {[
                    { label: "ทั้งหมด", value: "356", color: "text-green-700", bg: "bg-green-100", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" },
                    { label: "เยี่ยมแล้ว", value: "248", color: "text-green-700", bg: "bg-green-100", icon: "M5 13l4 4L19 7" },
                    { label: "ค้างเยี่ยม", value: "68", color: "text-orange-500", bg: "bg-orange-100", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                    { label: "มีปัญหา", value: "40", color: "text-red-500", bg: "bg-red-100", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}>
                        <svg className={`w-3 h-3 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                      </div>
                      <div>
                        <div className="text-[7.5px] text-gray-400 leading-none mb-0.5">{s.label}</div>
                        <div className={`text-sm font-bold leading-none ${s.color}`}>{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 bg-slate-50/50 relative overflow-hidden" id="features">
        
        {/* Glow blobs in features background */}
        <div className="absolute top-[30%] left-[20%] w-72 h-72 rounded-full bg-green-500/5 blur-[90px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-yellow-500/4 blur-[100px] pointer-events-none z-0"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-14 promo-reveal title-lookthung-dark text-slate-800">
            เครื่องมือทำงานชุมชนในระบบเดียว
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                ),
                color: "bg-green-500/10 text-green-700",
                title: "แผนที่ครัวเรือน",
                desc: "แสดงตำแหน่งบ้านและแผนที่ มองเห็นทุกครัวเรือนในพื้นที่",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                ),
                color: "bg-yellow-500/10 text-yellow-700",
                title: "ฐานข้อมูลครัวเรือน",
                desc: "จัดเก็บข้อมูลรายครัวเรือน สมาชิก เงินช่วยเหลือ ค้าขาย และโรคประจำตัว",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                ),
                color: "bg-yellow-500/10 text-yellow-700",
                title: "การเยี่ยมบ้าน",
                desc: "บันทึกการเยี่ยมบ้าน พร้อมภาพถ่าย และรายงานพิกัดที่แท้จริง",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                ),
                color: "bg-orange-500/10 text-orange-600",
                title: "ติดตามปัญหา",
                desc: "บันทึกปัญหาความต้องการช่วยเหลือ ติดตามผลการช่วยเหลือได้จนเสร็จสิ้น",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                ),
                color: "bg-green-500/10 text-green-700",
                title: "การวางแผนกิจกรรม",
                desc: "โครงการกิจกรรม จัดลำดับความสำคัญ กลุ่มเป้าหมาย",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
                color: "bg-yellow-500/10 text-yellow-700",
                title: "รายงานสรุปผล",
                desc: "สรุปผลการจัดเก็บข้อมูลและการทำงาน ครบครันและละเอียดทันที",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="promo-reveal tech-glass-card tech-glass-card-hover rounded-2xl p-6 flex gap-4 items-start"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl ${f.color} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-[30px] h-[30px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    {f.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1 text-[15px]">{f.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAP SECTION ===== */}
      <section className="py-24 bg-white" id="howitworks">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">
            {/* Map mockup left */}
            <div className="promo-reveal rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="relative flex" style={{ height: "450px" }}>
                <MapFilterPanel />
                <div
                  className="relative bg-green-900 bg-cover bg-center flex-1"
                  style={{ backgroundImage: "url('/images/promo/village-aerial-map.png')" }}
                >
                  <div className="absolute inset-0 bg-green-950/10" />
                  {/* Village boundary */}
                  <div className="absolute inset-6 border-2 border-dashed border-white/70 rounded-[40%] pointer-events-none" />
                  {[
                    { x: 44, y: 33, color: "#ef4444" },
                    { x: 58, y: 24, color: "#22c55e" },
                    { x: 70, y: 40, color: "#3b82f6" },
                    { x: 31, y: 45, color: "#f59e0b" },
                    { x: 79, y: 29, color: "#22c55e" },
                    { x: 53, y: 53, color: "#3b82f6" },
                    { x: 40, y: 62, color: "#22c55e" },
                    { x: 66, y: 60, color: "#ef4444" },
                    { x: 25, y: 30, color: "#f59e0b" },
                    { x: 60, y: 75, color: "#22c55e" },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -100%)" }}
                    >
                      <svg width="20" height="26" viewBox="0 0 22 28" className="drop-shadow-md">
                        <path d="M11 0C4.9 0 0 4.9 0 11c0 8 11 17 11 17s11-9 11-17C22 4.9 17.1 0 11 0z" fill={m.color} />
                        <circle cx="11" cy="11" r="4" fill="white" />
                      </svg>
                    </div>
                  ))}
                  {/* Search bar overlay */}
                  <div className="absolute top-3 left-14 right-3 flex gap-2">
                    <div className="flex-1 bg-white rounded-lg px-3 py-2 text-xs text-gray-400 flex items-center gap-2 shadow">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      ค้นหาบ้าน / เจ้าบ้าน / เลขที่บ้าน
                    </div>
                    <div className="bg-white rounded-lg w-9 flex items-center justify-center shadow">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/></svg>
                    </div>
                    <div className="bg-white rounded-lg w-9 flex items-center justify-center shadow">
                      <svg className="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="absolute z-10 bottom-4 left-14 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] shadow-lg">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"/><span>เยี่ยมแล้ว</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"/><span>ยังไม่เยี่ยม</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/><span>มีปัญหา</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/><span>กำลังช่วยเหลือ</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-500"/><span>อื่นๆ</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right text */}
            <div className="promo-reveal">
              <h2 className="font-bold text-4xl lg:text-5xl text-slate-900 mb-8 leading-tight">
                รู้พื้นที่ รู้ปัญหา<br />
                <span className="text-[#15803d]">เข้าถึงทุกครัวเรือน</span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
                    title: "ค้นหาบ้านและแผนที่",
                    desc: "ค้นหาและแสดงข้อมูลอย่างรวดเร็ว ด้วยแผนที่ระบุพิกัดอย่างครอบคลุม",
                  },
                  {
                    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                    title: "ดูข้อมูลและประวัติการเยี่ยม",
                    desc: "ดูประวัติการเยี่ยมบ้าน ประวัติการเยียวยา และเอกสารที่เกี่ยวข้องในพื้นที่เดียว",
                  },
                  {
                    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                    title: "ติดตามความช่วยเหลือ",
                    desc: "ติดตามสถานะปัญหาและการช่วยเหลือ จนกว่าจะได้รับการแก้ไข",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full border border-green-500/20 bg-green-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm mb-0.5">{item.title}</div>
                      <div className="text-xs text-slate-400 leading-relaxed font-medium">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE + TRAINING SECTION ===== */}
      <section className="py-20 bg-slate-50/50 relative overflow-hidden">
        
        {/* Glow blobs in mobile section background */}
        <div className="absolute top-[40%] right-[10%] w-72 h-72 rounded-full bg-yellow-500/4 blur-[90px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[20%] left-[5%] w-80 h-80 rounded-full bg-green-500/5 blur-[100px] pointer-events-none z-0"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="font-bold text-3xl lg:text-4xl text-center text-slate-800 mb-14 promo-reveal">
            จากการลงพื้นที่ สู่ข้อมูลที่ติดตามได้
          </h2>
          
          <div className="grid lg:grid-cols-[1.9fr_1fr] gap-10 items-start">
            
            {/* Left Column: Visiting details, Phone Mockup, Timeline */}
            <div className="grid md:grid-cols-[1.1fr_1.3fr_1.1fr] gap-8 items-center tech-glass-card border border-slate-100 rounded-3xl p-8 lg:p-10 shadow-md promo-reveal">
              
              {/* 1. Text Details & Checklist */}
              <div>
                <h3 className="font-bold text-2xl text-slate-800 mb-3">บันทึกการเยี่ยมบ้าน</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                  บันทึกข้อมูลเจ้าหน้าที่ทำงาน พร้อมแสดงแผนที่ และจัดประเภทกิจกรรม
                </p>
                <ul className="space-y-4">
                  {[
                    "บันทึกข้อมูลและพิกัดได้ทันที",
                    "แนบภาพถ่ายขณะลงเยี่ยมบ้าน",
                    "ตรวจสอบข้อมูลประวัติเก่าได้",
                    "ติดตามสถานะการเยี่ยมบ้าน"
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                      <svg className="w-5 h-5 text-green-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Phone Mockup */}
              <div className="flex justify-center">
                {/* Real Phone Outer Titanium Bezel */}
                <div className="relative mx-auto rounded-[2.8rem] bg-gradient-to-b from-[#8e8e93] via-[#e5e5ea] to-[#8e8e93] p-[3px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex-shrink-0 w-[245px] h-[450px]">
                  
                  {/* Action Button (Left) */}
                  <div className="absolute -left-[3px] top-[55px] w-[3px] h-[15px] bg-[#8e8e93] rounded-l"></div>
                  
                  {/* Volume Buttons (Left) */}
                  <div className="absolute -left-[3px] top-[85px] w-[3px] h-[30px] bg-[#8e8e93] rounded-l"></div>
                  <div className="absolute -left-[3px] top-[125px] w-[3px] h-[30px] bg-[#8e8e93] rounded-l"></div>
                  
                  {/* Power Button (Right) */}
                  <div className="absolute -right-[3px] top-[110px] w-[3px] h-[50px] bg-[#8e8e93] rounded-r"></div>

                  {/* Black Screen Border (Inner Bezel) */}
                  <div className="w-full h-full bg-black rounded-[2.6rem] p-[8px] relative flex flex-col justify-between shadow-inner">
                    
                    {/* Ear Speaker */}
                    <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-10 h-[1px] bg-zinc-800 rounded-full z-30"></div>
                    
                    {/* Dynamic Island */}
                    <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-15 h-4 bg-black rounded-full z-30 flex items-center justify-end px-1.5 gap-0.5 border border-zinc-900 shadow-inner">
                      {/* Lens reflection */}
                      <div className="w-1.5 h-1.5 bg-[#0b1b3d] rounded-full mr-0.5 opacity-85"></div>
                    </div>

                    {/* Inner Screen */}
                    <div className="bg-white rounded-[2rem] overflow-hidden w-full h-full flex flex-col justify-between relative shadow-inner" style={{ height: "430px" }}>
                      
                      {/* Status Bar (Simulated iPhone Status Bar) */}
                      <div className="absolute top-0 inset-x-0 h-6 px-5 flex items-center justify-between text-[8px] font-semibold text-white z-20 select-none pointer-events-none">
                        <span className="leading-none text-white/90">12:30</span>
                        <div className="flex items-center gap-1.5 opacity-90">
                          {/* Signal */}
                          <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 24 24"><path d="M12 3c-1.2 0-2.4.2-3.6.7L18.7 14c.5-1.2.7-2.4.7-3.6 0-4.1-3.3-7.4-7.4-7.4z"/></svg>
                          {/* Wifi */}
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01"/></svg>
                          {/* Battery */}
                          <div className="w-3.5 h-1.5 border border-white/80 rounded-[3px] p-[0.5px] flex items-center">
                            <div className="h-full w-1.5 bg-white rounded-[1px]"></div>
                          </div>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="bg-[#15803d] px-4 pt-8 pb-3 text-white flex items-center justify-between z-10 flex-shrink-0 shadow-sm">
                        <span className="text-xs font-bold tracking-tight">บันทึกการเยี่ยมบ้าน</span>
                        <svg className="w-3.5 h-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between text-xs overflow-y-auto">
                        <div>
                          <div className="font-bold text-gray-700 mb-1 border-b border-gray-100 pb-1 text-xs">ข้อมูลครัวเรือน</div>
                          <div className="flex justify-between text-gray-400 text-[10px] mb-1.5">
                            <span>รหัสบ้าน: S-005-0123/1</span>
                            <span>12 พ.ค. 2567</span>
                          </div>
                          <div className="font-bold text-[#15803d] text-sm mb-2">นายสมชาย ใจดี</div>
                          
                          {/* Dummy house image */}
                          <div className="w-full h-24 rounded-xl overflow-hidden bg-gray-100 relative mb-2.5 shadow-sm border border-gray-100">
                            <Image
                              src="/images/promo/thai_wooden_house.jpg"
                              alt="House photo"
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Badges */}
                          <div className="flex gap-1.5 mb-2.5 flex-wrap text-[10px]">
                            <span className="bg-green-50 text-[#15803d] border border-green-200 px-2 py-0.5 rounded-full font-semibold">เยี่ยมแล้ว</span>
                            <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">ต้องการช่วยเหลือ</span>
                          </div>
                        </div>

                        <button className="w-full py-2 bg-[#15803d] text-white font-bold rounded-lg hover:bg-green-800 transition-colors shadow-md mt-2 flex-shrink-0 text-xs">
                          บันทึกข้อมูล
                        </button>
                      </div>

                      {/* Home Indicator Bar (Simulated iPhone Bottom Bar) */}
                      <div className="bg-white py-1.5 flex-shrink-0 z-10">
                        <div className="w-20 h-1 bg-gray-300 rounded-full mx-auto"></div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Timeline Card */}
              <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
                <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-4 border-b border-gray-100 pb-2.5">ประวัติการเยี่ยม</h4>
                <div className="relative border-l border-green-200 pl-6 space-y-6 text-xs py-1.5">
                  {[
                    { date: "12 พ.ค. 2567", status: "เยี่ยมแล้ว", by: "โดย ผู้ใหญ่บ้าน" },
                    { date: "20 เม.ย. 2567", status: "เยี่ยมแล้ว", by: "โดย อสม." },
                    { date: "15 มี.ค. 2567", status: "ย้ายเข้าในพื้นที่", by: "โดย ผู้ใหญ่บ้าน" }
                  ].map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Circle indicator */}
                      <span className="absolute -left-[30px] top-0.5 w-3 h-3 rounded-full bg-[#15803d] border-2 border-white flex-shrink-0 shadow-sm" />
                      <div>
                        <div className="text-gray-400 text-[10px] font-semibold">{item.date}</div>
                        <div className="font-bold text-gray-800 text-sm mt-0.5">{item.status}</div>
                        <div className="text-gray-500 text-[10.5px] mt-0.5">{item.by}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Training checklist & Activity box */}
            <div className="space-y-6 promo-reveal">
              <div>
                <h3 className="font-bold text-2xl text-gray-800 mb-3">จัดการกิจกรรมและโครงการ</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  วางแผนกิจกรรม จัดลำดับความสำคัญ แก่กลุ่มเป้าหมาย
                </p>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                  {[
                    "กำหนดเป้าหมายและผู้ร่วมกิจกรรม",
                    "บันทึกงบประมาณการดูแล",
                    "เลือกช่วงเวลา / ผู้รับผิดชอบ",
                    "สรุปภาพรวมประเมินผลลัพธ์"
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activity event card with donut chart side-by-side */}
              <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm text-xs">
                <div className="bg-gray-900 text-white px-4 py-3 font-bold text-sm tracking-wide">
                  โครงการส่งเสริมอาชีพชุมชน
                </div>
                <div className="p-4.5">
                  <div className="flex gap-4 items-center justify-between border-b border-gray-100 pb-3.5 mb-3.5">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-gray-500 flex-1 leading-normal text-xs">
                      <span>วันที่</span><span className="text-right font-bold text-gray-800">18 พ.ค. 2567</span>
                      <span>สถานที่</span><span className="text-right font-bold text-gray-800">ศาลาประชาคมบ้าน</span>
                      <span>เป้าหมาย</span><span className="text-right font-bold text-gray-800">120 คน</span>
                      <span>ผู้เข้าร่วม</span><span className="text-right font-bold text-gray-800">98 คน</span>
                    </div>
                    {/* Donut chart */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="4.5"/>
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#15803d" strokeWidth="4.5"
                            strokeDasharray="81.67 18.33" strokeDashoffset="0"/>
                        </svg>
                        <div className="absolute text-[10px] font-bold text-gray-800">81.6%</div>
                      </div>
                      <span className="text-[9px] text-[#15803d] font-bold">คิดเป็นร้อยละ</span>
                    </div>
                  </div>

                  <table className="w-full text-xs mb-3.5">
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: "นายกมล รักดี", role: "ดูรายละเอียด >" },
                        { name: "นางวิภา คำมา", role: "ดูรายละเอียด >" },
                        { name: "นายเอกชัย โอชา", role: "ดูรายละเอียด >" }
                      ].map((item, idx) => (
                        <tr key={idx} className="text-gray-700">
                          <td className="py-2 text-gray-400 font-semibold">{idx + 1}</td>
                          <td className="py-2 font-medium">{item.name}</td>
                          <td className="py-2 text-right text-[#15803d] font-bold hover:underline cursor-pointer">{item.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-center">
                    <span className="text-[#15803d] font-bold cursor-pointer hover:underline text-xs">ดูทั้งหมด</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ===== REPORTS SECTION ===== */}
      <section className="py-24 promo-report-section text-white" id="benefits">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 promo-reveal">
            <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">รายงานพร้อมใช้ เพื่อการตัดสินใจที่แม่นยำ</h2>
            <p className="text-gray-300 text-base">สนับสนุนการทำงานวิเคราะห์ข้อมูล รายงานสถิติสำคัญ คัดกรองและประเมินผลได้ทันที</p>
          </div>

          <div className="grid lg:grid-cols-[290px_1fr_260px] gap-8 items-start">
            {/* Sidebar */}
            <div className="promo-reveal space-y-3">
              {[
                { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3", label: "สถิติข้อมูลครัวเรือน", sub: "ภาพรวมสถิติตามหมู่บ้านและรายบุคคล", active: true },
                { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", label: "ผลการเยี่ยมบ้าน", sub: "สถิติการเยี่ยมบ้าน ประวัติการรายงาน" },
                { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857", label: "ผู้เข้าร่วมอบรม", sub: "สถิติและสถานะผลลัพธ์รายโครงการ" },
                { icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", label: "ข้อมูลและการช่วยเหลือ", sub: "สรุปการจัดการปัญหาและการช่วยเหลือในพื้นที่" },
              ].map((item) => (
                <div key={item.label} className={`px-5 py-4 rounded-2xl cursor-pointer transition-all duration-200 ${item.active ? "bg-[#15803d] text-white shadow-md scale-[1.01]" : "text-gray-450 hover:bg-green-950/45 hover:text-white"}`}>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className="text-base font-bold tracking-wide">{item.label}</span>
                  </div>
                  <div className={`text-xs mt-1 leading-normal ${item.active ? "text-green-100" : "text-gray-500"}`}>{item.sub}</div>
                </div>
              ))}
            </div>

            {/* Center dashboard */}
            <div className="promo-reveal bg-white rounded-2xl p-6 lg:p-7 text-gray-900 shadow-lg">
              <div className="text-base font-bold text-gray-800 mb-5">รายงานภาพรวม</div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "ครัวเรือนทั้งหมด", value: "356", color: "text-gray-700", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" },
                  { label: "เยี่ยมแล้ว", value: "248", color: "text-[#15803d]", icon: "M5 13l4 4L19 7" },
                  { label: "ยังไม่เยี่ยม", value: "68", color: "text-orange-500", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                  { label: "มีปัญหา", value: "40", color: "text-red-500", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
                ].map(s=>(
                  <div key={s.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between h-20 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-semibold">{s.label}</span>
                      <svg className={`w-4.5 h-4.5 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                    </div>
                    <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-[1.15fr_1fr] gap-8 items-end">
                {/* Donut Chart: สัดส่วนกลุ่มเป้าหมาย */}
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-wider">สัดส่วนกลุ่มเป้าหมาย</div>
                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-28 h-28">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="4.2"/>
                        {/* ผู้สูงอายุ 42: 48.8% */}
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#15803d" strokeWidth="4.2" strokeDasharray="48.8 51.2" strokeDashoffset="25" transform="rotate(-90 18 18)"/>
                        {/* ผู้พิการ 12: 14.0% */}
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e3a8a" strokeWidth="4.2" strokeDasharray="14.0 86.0" strokeDashoffset="-23.8" transform="rotate(-90 18 18)"/>
                        {/* เด็ก 18: 20.9% */}
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="4.2" strokeDasharray="20.9 79.1" strokeDashoffset="-37.8" transform="rotate(-90 18 18)"/>
                        {/* อื่นๆ 14: 16.3% */}
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#78716c" strokeWidth="4.2" strokeDasharray="16.3 83.7" strokeDashoffset="-58.7" transform="rotate(-90 18 18)"/>
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center leading-none">
                        <span className="text-lg font-bold text-gray-800">86</span>
                        <span className="text-[10.5px] text-gray-400 mt-0.5">ครัวเรือน</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 text-xs flex-1">
                      {[
                        ["#15803d", "ผู้สูงอายุ", "42"],
                        ["#1e3a8a", "ผู้พิการ", "12"],
                        ["#f59e0b", "เด็ก", "18"],
                        ["#78716c", "อื่นๆ", "14"]
                      ].map(([c,l,v])=>(
                        <div key={l} className="flex items-center gap-1.5 font-medium">
                          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{background:c}}/>
                          <span className="text-gray-500">{l}</span>
                          <span className="ml-auto font-bold text-gray-800">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bar Chart: ผลการเยี่ยมบ้านรายเดือน side-by-side */}
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">ผลการเยี่ยมบ้านรายเดือน</div>
                  <div className="flex items-end gap-3 h-[90px] border-b border-gray-100 pb-2">
                    {[
                      ["ม.ค.", 65, 20], ["ก.พ.", 85, 15], ["มี.ค.", 55, 12],
                      ["เม.ย.", 98, 38], ["พ.ค.", 112, 10], ["มิ.ย.", 90, 8],
                    ].map(([m, done, pending]) => (
                      <div key={m as string} className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="flex items-end gap-1 h-[68px] justify-center w-full">
                          {/* Green bar - เยี่ยมจริง */}
                          <div className="w-2 bg-[#15803d] rounded-t-sm" style={{ height: `${(done as number) / 1.5}px` }} />
                          {/* Orange bar - ที่บันทึก */}
                          <div className="w-2 bg-orange-400 rounded-t-sm" style={{ height: `${(pending as number) / 1.5}px` }} />
                        </div>
                        <span className="text-[9.5px] text-gray-400 leading-none">{m}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4.5 mt-3.5 text-xs justify-center">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#15803d]"/><span className="text-gray-500 font-semibold">เยี่ยมจริง</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-orange-400"/><span className="text-gray-500 font-semibold">ที่บันทึก</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right PDF preview */}
            <div className="promo-reveal">
              <div className="bg-gray-900/90 rounded-2xl p-5 border border-gray-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400 font-bold">รายงานสถิติ</span>
                  <span className="bg-red-500 text-white text-[9.5px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">PDF</span>
                </div>
                <div className="bg-white rounded-xl p-4 text-xs text-gray-700 shadow-inner">
                  {/* Gov Emblem seal */}
                  <div className="flex justify-center mb-2.5 text-yellow-600">
                    <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
                      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                      <path d="M12 5l1.2 2.5h2.8l-2.2 1.8 0.8 2.7-2.6-1.6-2.6 1.6 0.8-2.7-2.2-1.8h2.8z" />
                    </svg>
                  </div>
                  <div className="font-bold text-center text-[9.5px] mb-4 border-b border-gray-100 pb-2.5 leading-relaxed">
                    รายงานสรุปผลการดำเนินงาน<br/>ครัวเรือน รายชุมชน พฤษภาคม 2567<br/>หมู่ 5 บ้านหนองบัว
                  </div>
                  <table className="w-full text-[10px] leading-tight">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                        <th className="text-left py-1.5 px-1.5 font-semibold">หัวข้อ</th>
                        <th className="text-right py-1.5 px-1.5 font-semibold">เป้าหมาย</th>
                        <th className="text-right py-1.5 px-1.5 font-semibold">ทำได้</th>
                        <th className="text-right py-1.5 px-1.5 font-semibold">ร้อยละ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                      {[
                        ["ครัวเรือน", "356", "248", "69.6%"],
                        ["ประชากร", "1,240", "980", "79.0%"],
                        ["กลุ่มเสี่ยง", "86", "72", "83.7%"],
                        ["แก้ปัญหา", "40", "32", "80.0%"]
                      ].map(([l, g, d, p])=>(
                        <tr key={l} className="hover:bg-gray-50/50">
                          <td className="py-1.5 px-1.5 font-medium">{l}</td>
                          <td className="py-1.5 px-1.5 text-right">{g}</td>
                          <td className="py-1.5 px-1.5 text-right">{d}</td>
                          <td className="py-1.5 px-1.5 text-right font-bold text-gray-800">{p}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <button className="mt-4 w-full py-2.5 bg-[#15803d] hover:bg-[#166534] text-xs text-white rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 shadow-md">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  ดาวน์โหลดชุด PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TARGET AUDIENCE ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-bold text-3xl lg:text-4xl text-center text-gray-900 mb-12 promo-reveal">เหมาะสำหรับ</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "หมู่บ้าน",
                sub: "ผู้นำหมู่บ้านและคณะกรรมการหมู่บ้าน",
                image: "/images/promo/audience-village.png",
                color: "from-green-800 to-green-600",
                icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
              },
              {
                label: "อบต.",
                sub: "องค์การบริหารส่วนตำบล",
                image: "/images/promo/audience-obt.png",
                color: "from-blue-800 to-blue-600",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
              },
              {
                label: "เทศบาล",
                sub: "เทศบาลตำบลและเทศบาลเมือง",
                image: "/images/promo/audience-municipality.png",
                color: "from-purple-800 to-purple-600",
                icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
              },
              {
                label: "หน่วยงานท้องถิ่น",
                sub: "สำนักงานพัฒนาชุมชน อำเภอ และหน่วยงานที่เกี่ยวข้อง",
                image: "/images/promo/audience-local.png",
                color: "from-orange-700 to-orange-500",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
              },
            ].map((item, i) => (
              <div
                key={item.label}
                className="promo-reveal rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="relative h-36 overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                </div>
                <div className="relative bg-white pt-7 pb-5 px-4 text-center flex-1 flex flex-col justify-center">
                  {/* Badge overlapping card image and text area */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <div className="font-bold text-gray-900 mb-1 text-[15px]">{item.label}</div>
                  <div className="text-xs text-gray-400 leading-normal">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 bg-[#eef5f3] text-gray-900 text-center relative overflow-hidden">
       
        
        <div className="max-w-2xl mx-auto px-6 relative z-10 promo-reveal">
          <h2 className="font-bold text-3xl sm:text-[34px] text-[#0f2e22] mb-4 tracking-tight">
            เริ่มจัดการข้อมูลชุมชนอย่างเป็นระบบ
          </h2>
          <p className="text-gray-500 text-xs sm:text-[13.5px] mb-8 leading-relaxed font-medium">
            เพิ่มประสิทธิภาพการทำงาน ลดงานซ้ำซ้อน และยกระดับคุณภาพชีวิตของคนในชุมชน
          </p>
          <a
            href="/signin"
            className="inline-flex items-center justify-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md text-sm hover:scale-[1.02]"
          >
            ขอชมระบบ
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="promo-footer-dark bg-green-950 border-t border-green-900 py-14 text-white" id="contact">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Image
                  src="/images/logo/smart-village-logo.png"
                  alt="หมู่บ้านดิจิตอล"
                  width={34}
                  height={34}
                  className="object-contain"
                />
                <span className="font-bold text-white text-[16px] tracking-tight">
                  หมู่บ้าน<span className="text-[#ca8a04]">ดิจิตอล</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                ระบบบริการข้อมูลชุมชน สำหรับผู้นำหมู่บ้าน และองค์กรปกครองส่วนท้องถิ่น พัฒนาข้อมูลชุมชนให้เป็นระบบ เพื่อการบริหารจัดการที่มีประสิทธิภาพ
              </p>
              <div className="flex gap-3">
                {["M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
                  "M12 2a10 10 0 100 20 10 10 0 000-20zm0 5a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm4.5-3a1 1 0 110 2 1 1 0 010-2z",
                  "M22 7.3c0 2.1-1.9 3.5-4.5 3.5-1.3 0-2.5-.3-3.5-.9-1 .6-2.2.9-3.5.9C7.9 10.8 6 9.4 6 7.3S7.9 3.8 10.5 3.8c1.3 0 2.5.3 3.5.9 1-.6 2.2-.9 3.5-.9C20.1 3.8 22 5.2 22 7.3zm-8 6.2l6.5 3.8-6.5 3.8v-2.6c-4.4 0-7.7-1.1-7.7-2.5v-.4c0-1.4 3.3-2.5 7.7-2.5v-2.6z"
                ].map((d,i)=>(
                  <a key={i} href="#" className="w-8 h-8 bg-white/10 hover:bg-[#15803d] rounded-lg flex items-center justify-center transition-colors">
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d={d}/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold text-white mb-3 text-sm">เมนู</div>
              <ul className="space-y-2 text-xs text-gray-400">
                {["ฟีเจอร์","การทำงาน","ประโยชน์","ติดต่อเรา"].map(l=>(
                  <li key={l}><a href="#" className="hover:text-green-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold text-white mb-3 text-sm">ฝ่ายบริการ</div>
              <ul className="space-y-2 text-xs text-gray-400">
                {["ผู้รับบริการทั่วไป","ข้อมูลส่วนบุคคล","นโยบายความปลอดภัย","การบริการระบบ"].map(l=>(
                  <li key={l}><a href="#" className="hover:text-green-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold text-white mb-3 text-sm">ติดต่อเรา</div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>📞 02-XXX-XXXX</li>
                <li>✉️ hello@moobandigital.com</li>
                <li>💬 @moobandigital</li>
                <li>📍 กรุงเทพมหานคร ประเทศไทย</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <p>© 2024 MoobanDigital. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a>
              <a href="#" className="hover:text-white transition-colors">เงื่อนไขการใช้งาน</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
