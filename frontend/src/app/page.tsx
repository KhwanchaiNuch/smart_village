"use client";

import { useEffect } from "react";
import "./promo.css";

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
    <div className="promo-page font-sans text-gray-900 bg-white antialiased selection:bg-brand-100 selection:text-brand-800">
      {/* ===== Nav ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-[66px] flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 group">
            <img
              src="/images/logo/smart-village-logo.png"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
              alt="Smart Village"
              className="w-9 h-9 object-contain"
            />
            <div style={{ display: "none" }} className="w-9 h-9 rounded-xl bg-brand-500 items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="font-display font-bold text-[18px] text-brand-600">
              Smart <span className="text-amber-500">Village</span>
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            <li><a href="#features" className="promo-nav-link hover:text-gray-800 transition-colors py-1">ฟีเจอร์</a></li>
            <li><a href="#vi" className="promo-nav-link hover:text-gray-800 transition-colors py-1">Village Index</a></li>
            <li><a href="#modules" className="promo-nav-link hover:text-gray-800 transition-colors py-1">โมดูล</a></li>
            <li><a href="#pricing" className="promo-nav-link hover:text-gray-800 transition-colors py-1">แพ็กเกจ</a></li>
          </ul>

          <a
            href="/signup/"
            className="hidden md:inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-px"
          >
            ใช้งานฟรี
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="relative bg-white pt-[66px] overflow-hidden min-h-screen flex items-center" id="home">
        <div className="absolute inset-0 promo-grid-bg pointer-events-none" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-25 rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-0 w-full relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.15fr] gap-14 items-center">
            <div>
              <div className="promo-reveal inline-flex items-center gap-2 bg-brand-25 border border-brand-100 text-brand-500 text-xs font-semibold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Smart Village Management System
              </div>

              <h1 className="promo-reveal font-display font-extrabold text-[2.6rem] sm:text-5xl lg:text-[3rem] text-gray-900 leading-[1.1] tracking-tight mb-5">
                บริหารหมู่บ้าน<br />
                ด้วย
                <span
                  style={{
                    background: "linear-gradient(135deg,#007e34,#05b74fb5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ข้อมูลจริง
                </span>
                <br />
                ไม่ใช่การเดา
              </h1>

              <p className="promo-reveal text-gray-500 text-lg leading-relaxed max-w-md mb-8">
                ระบบเก็บข้อมูล วิเคราะห์ และวางแผนพัฒนาหมู่บ้านแบบครบวงจร พร้อม Village Index วัดสุขภาพชุมชน
              </p>

              <div className="promo-reveal flex flex-col sm:flex-row gap-3 mb-10">
                <a
                  href="/signup/"
                  className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
                >
                  ทดลองใช้ฟรี !
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold px-7 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
                >
                  ดูฟีเจอร์
                </a>
              </div>

              <div className="promo-reveal flex items-center gap-8 pt-8 border-t border-gray-100">
                <div>
                  <div className="font-display font-bold text-2xl text-gray-900">7,700<span className="text-brand-500">+</span></div>
                  <div className="text-xs text-gray-400 mt-0.5">อบต. ทั่วประเทศ</div>
                </div>
                <div className="w-px h-9 bg-gray-200" />
                <div>
                  <div className="font-display font-bold text-2xl text-gray-900">75,000<span className="text-brand-500">+</span></div>
                  <div className="text-xs text-gray-400 mt-0.5">หมู่บ้านเป้าหมาย</div>
                </div>
                <div className="w-px h-9 bg-gray-200" />
                <div>
                  <div className="font-display font-bold text-2xl text-gray-900">∞ <span className="text-brand-500">วัน</span></div>
                  <div className="text-xs text-gray-400 mt-0.5">ทดลองฟรี</div>
                </div>
              </div>
            </div>

            <div className="promo-reveal hidden lg:block relative">
              <div className="absolute inset-6 bg-brand-500/8 rounded-3xl blur-3xl pointer-events-none" />

              <div className="relative promo-float rounded-2xl shadow-2xl shadow-brand-900/15 overflow-hidden border border-gray-200 bg-gray-50">
                <div className="bg-gray-800 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 mx-3 bg-gray-700 rounded-md px-3 py-1 text-[10px] text-gray-400 font-display">
                    smartvillage.app / dashboard
                  </div>
                </div>

                <div className="flex" style={{ height: "360px" }}>
                  <div className="promo-sidebar-grad w-[52px] flex-shrink-0 flex flex-col items-center py-3 gap-3 border-r border-white/5">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-1">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                      </svg>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                    <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
                      <div className="text-[11px] font-semibold text-gray-700">Dashboard</div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center">
                          <svg className="w-3 h-3 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                          </svg>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-[9px] text-white font-bold">A</div>
                      </div>
                    </div>

                    <div className="flex-1 p-3 overflow-hidden">
                      <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">ตัวชี้วัดหลัก</div>

                      <div className="grid grid-cols-[1fr_80px_80px] gap-2 mb-2">
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-emerald-400 p-2.5 shadow-sm">
                            <div className="text-[8px] text-gray-400 truncate mb-0.5">ครัวเรือน</div>
                            <div className="text-base font-bold text-emerald-600">248</div>
                            <div className="text-[7px] text-gray-300">หลังคาเรือน</div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-emerald-400 p-2.5 shadow-sm">
                            <div className="text-[8px] text-gray-400 truncate mb-0.5">ประชากร</div>
                            <div className="text-base font-bold text-emerald-600">1,024</div>
                            <div className="text-[7px] text-gray-300">คน</div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-blue-400 p-2.5 shadow-sm">
                            <div className="text-[8px] text-gray-400 truncate mb-0.5">เด็ก 0–3 ปี</div>
                            <div className="text-base font-bold text-blue-600">12</div>
                            <div className="text-[7px] text-gray-300">คน</div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-amber-400 p-2.5 shadow-sm">
                            <div className="text-[8px] text-gray-400 truncate mb-0.5">ผู้สูงอายุ</div>
                            <div className="text-base font-bold text-amber-600">187</div>
                            <div className="text-[7px] text-gray-300">คน</div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-purple-400 p-2.5 shadow-sm">
                            <div className="text-[8px] text-gray-400 truncate mb-0.5">ผู้พิการ</div>
                            <div className="text-base font-bold text-purple-600">14</div>
                            <div className="text-[7px] text-gray-300">คน</div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-red-400 p-2.5 shadow-sm">
                            <div className="text-[8px] text-gray-400 truncate mb-0.5">ติดเตียง</div>
                            <div className="text-base font-bold text-red-600">3</div>
                            <div className="text-[7px] text-gray-300">คน</div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 flex flex-col items-center justify-center">
                          <div className="text-[7px] font-semibold text-gray-600 mb-1.5">ดัชนีสุขภาพ</div>
                          <div className="relative w-11 h-11">
                            <svg viewBox="0 0 140 140" className="w-11 h-11">
                              <circle cx="70" cy="70" r="58" fill="none" stroke="#f2f4f7" strokeWidth="14" />
                              <circle
                                cx="70" cy="70" r="58" fill="none" stroke="#10b981" strokeWidth="14"
                                strokeLinecap="round" strokeDasharray="364.4" strokeDashoffset="73"
                                transform="rotate(-90 70 70)"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-[11px] font-bold text-emerald-600">80</span>
                              <span className="text-[6px] text-gray-400">/100</span>
                            </div>
                          </div>
                          <div className="text-[6px] font-semibold text-emerald-600 mt-1">สุขภาพดี</div>
                          <div className="w-full space-y-0.5 mt-2 border-t border-gray-100 pt-1.5">
                            <div><div className="h-1 bg-gray-100 rounded-full"><div className="h-1 bg-teal-400 rounded-full" style={{ width: "80%" }} /></div></div>
                            <div><div className="h-1 bg-gray-100 rounded-full"><div className="h-1 bg-blue-400 rounded-full" style={{ width: "75%" }} /></div></div>
                            <div><div className="h-1 bg-gray-100 rounded-full"><div className="h-1 bg-amber-400 rounded-full" style={{ width: "60%" }} /></div></div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 flex flex-col items-center justify-center">
                          <div className="text-[7px] font-semibold text-gray-600 mb-1.5">ดัชนีหมู่บ้าน</div>
                          <div className="relative w-11 h-11">
                            <svg viewBox="0 0 140 140" className="w-11 h-11">
                              <circle cx="70" cy="70" r="58" fill="none" stroke="#f2f4f7" strokeWidth="14" />
                              <circle
                                cx="70" cy="70" r="58" fill="none" stroke="#10b981" strokeWidth="14"
                                strokeLinecap="round" strokeDasharray="364.4" strokeDashoffset="65.6"
                                transform="rotate(-90 70 70)"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-[11px] font-bold text-emerald-600">82</span>
                              <span className="text-[6px] text-gray-400">/100</span>
                            </div>
                          </div>
                          <div className="text-[6px] font-semibold text-emerald-600 mt-1">เข้มแข็ง</div>
                          <div className="w-full space-y-0.5 mt-2 border-t border-gray-100 pt-1.5">
                            <div><div className="h-1 bg-gray-100 rounded-full"><div className="h-1 bg-emerald-400 rounded-full" style={{ width: "82%" }} /></div></div>
                            <div><div className="h-1 bg-gray-100 rounded-full"><div className="h-1 bg-blue-400 rounded-full" style={{ width: "70%" }} /></div></div>
                            <div><div className="h-1 bg-gray-100 rounded-full"><div className="h-1 bg-amber-400 rounded-full" style={{ width: "88%" }} /></div></div>
                            <div><div className="h-1 bg-gray-100 rounded-full"><div className="h-1 bg-purple-400 rounded-full" style={{ width: "65%" }} /></div></div>
                            <div><div className="h-1 bg-gray-100 rounded-full"><div className="h-1 bg-red-400 rounded-full" style={{ width: "90%" }} /></div></div>
                            <div><div className="h-1 bg-gray-100 rounded-full"><div className="h-1 bg-indigo-400 rounded-full" style={{ width: "78%" }} /></div></div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[8px] font-semibold text-gray-600">ต้องเยี่ยมบ้าน</span>
                            <span className="text-[7px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5">3</span>
                          </div>
                          <div className="space-y-1">
                            <div className="h-5 bg-red-50 rounded-lg border border-red-100 flex items-center px-2 gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-100 flex-shrink-0" />
                              <div className="text-[7px] text-gray-500 truncate">บ้านเลขที่ 42 · ผู้ป่วยติดเตียง</div>
                            </div>
                            <div className="h-5 bg-red-50 rounded-lg border border-red-100 flex items-center px-2 gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-100 flex-shrink-0" />
                              <div className="text-[7px] text-gray-500 truncate">บ้านเลขที่ 17 · ผู้สูงอายุอยู่ลำพัง</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[8px] font-semibold text-gray-600">ปัญหาชุมชน</span>
                            <span className="text-[7px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5">5</span>
                          </div>
                          <div className="space-y-1">
                            <div className="h-5 bg-amber-50 rounded-lg border border-amber-100 flex items-center px-2">
                              <div className="text-[7px] text-gray-500 truncate">ถนนชำรุด · ระดับ 4</div>
                            </div>
                            <div className="h-5 bg-amber-50 rounded-lg border border-amber-100 flex items-center px-2">
                              <div className="text-[7px] text-gray-500 truncate">น้ำไม่ไหล · ระดับ 3</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2.5">
                          <div className="mb-1.5">
                            <span className="text-[8px] font-semibold text-gray-600">สถานะปัญหา</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                              <div className="text-[7px] text-gray-500">ยังไม่แก้</div>
                              <div className="ml-auto text-[7px] font-bold text-gray-700">3</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                              <div className="text-[7px] text-gray-500">กำลังดำเนินการ</div>
                              <div className="ml-auto text-[7px] font-bold text-gray-700">5</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                              <div className="text-[7px] text-gray-500">แก้ไขแล้ว</div>
                              <div className="ml-auto text-[7px] font-bold text-gray-700">12</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="promo-float-2 absolute -right-5 top-1/4 bg-white border border-gray-200 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Village Index</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">82/100 · เข้มแข็ง</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="py-24 bg-gray-50 border-y border-gray-200" id="features">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 promo-reveal">
            <div className="inline-flex items-center gap-2 text-brand-500 font-semibold text-xs tracking-widest uppercase mb-4">
              <span className="w-5 h-px bg-brand-400 rounded-full" /> Core Features
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-gray-900 mb-3">ความสามารถครบจบในที่เดียว</h2>
            <p className="text-gray-400 text-lg">ออกแบบมาเพื่อ อบต. และผู้นำหมู่บ้าน ใช้งานง่าย ไม่ต้องใช้ทักษะ IT สูง</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="promo-reveal promo-f-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-25 border border-brand-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1.5">ฐานข้อมูลรวมศูนย์</h3>
              <p className="text-gray-400 text-sm leading-relaxed">ครัวเรือน บุคคล สุขภาพ เศรษฐกิจ ค้นหาง่าย อัปเดตได้ทันที</p>
            </div>

            <div className="promo-reveal promo-f-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" style={{ transitionDelay: "70ms" }}>
              <div className="w-10 h-10 rounded-xl bg-brand-25 border border-brand-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1.5">Village Index</h3>
              <p className="text-gray-400 text-sm leading-relaxed">วัดสุขภาพหมู่บ้าน 0–100 คะแนน จาก 6 มิติ เห็นทิศทางพัฒนาชัดเจน</p>
            </div>

            <div className="promo-reveal promo-f-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" style={{ transitionDelay: "140ms" }}>
              <div className="w-10 h-10 rounded-xl bg-brand-25 border border-brand-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1.5">แจ้งเตือนกลุ่มเสี่ยง</h3>
              <p className="text-gray-400 text-sm leading-relaxed">คัดกรองผู้ป่วยติดเตียง ผู้สูงอายุอยู่ลำพัง เพื่อลงพื้นที่ช่วยเหลือได้ทัน</p>
            </div>

            <div className="promo-reveal promo-f-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" style={{ transitionDelay: "210ms" }}>
              <div className="w-10 h-10 rounded-xl bg-brand-25 border border-brand-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1.5">แผนที่หมู่บ้าน</h3>
              <p className="text-gray-400 text-sm leading-relaxed">แสดงตำแหน่งบ้านพร้อม GPS overlay เห็นภาพรวมพื้นที่ได้ทันที</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Modules ===== */}
      <section className="py-24 bg-white" id="modules">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="promo-reveal">
              <div className="inline-flex items-center gap-2 text-brand-500 font-semibold text-xs tracking-widest uppercase mb-4">
                <span className="w-5 h-px bg-brand-400 rounded-full" /> โมดูลระบบ
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-gray-900 leading-snug mb-5">
                ครอบคลุมทุกมิติ<br />
                <span className="text-brand-500">การบริหารหมู่บ้าน</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                ตั้งแต่ข้อมูลพื้นที่ ครัวเรือน บุคคล สุขภาพ เศรษฐกิจ ไปจนถึงการติดตามปัญหาชุมชนและการอบรมพัฒนา
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">ข้อมูลครัวเรือน</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">ข้อมูลบุคคล</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">ข้อมูลสุขภาพ</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">ข้อมูลเศรษฐกิจ</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">โครงสร้างพื้นฐาน</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">แจ้งเตือนปัญหา</span>
                </div>
              </div>
            </div>

            <div className="promo-reveal relative h-full min-h-[350px] bg-brand-50 rounded-3xl border border-brand-100 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMyMmM1NWUiIGZpbGwtb3BhY2l0eT0iLjIiLz48L3N2Zz4=')] opacity-50" />
              <div className="relative bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white max-w-sm w-full mx-6 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                  <div className="font-semibold text-gray-800">การเชื่อมโยงข้อมูล</div>
                  <span className="bg-brand-100 text-brand-700 text-[10px] px-2 py-1 rounded-full font-bold">Real-time</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div className="flex-1"><div className="h-2 w-full bg-gray-200 rounded-full mb-1" /><div className="h-2 w-2/3 bg-gray-100 rounded-full" /></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <div className="flex-1"><div className="h-2 w-full bg-gray-200 rounded-full mb-1" /><div className="h-2 w-1/2 bg-gray-100 rounded-full" /></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="flex-1"><div className="h-2 w-full bg-gray-200 rounded-full mb-1" /><div className="h-2 w-3/4 bg-gray-100 rounded-full" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Village Index ===== */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden" id="vi">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14 promo-reveal">
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">ดัชนีหมู่บ้าน (Village Index)</h2>
            <p className="text-gray-400 text-lg">ประเมินสถานะความเข้มแข็งของชุมชนอย่างเป็นระบบ ผ่านเกณฑ์มาตรฐาน 6 มิติ เพื่อการตัดสินใจและจัดสรรงบประมาณที่แม่นยำ</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 promo-reveal">
              <div className="text-brand-400 font-bold text-xl mb-2">01. สุขภาวะ</div>
              <p className="text-sm text-gray-400">ประเมินสุขภาพประชากร การเข้าถึงการรักษา ผู้ป่วยติดเตียง และการดูแลผู้สูงอายุ</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 promo-reveal" style={{ transitionDelay: "100ms" }}>
              <div className="text-brand-400 font-bold text-xl mb-2">02. เศรษฐกิจ</div>
              <p className="text-sm text-gray-400">รายได้เฉลี่ยครัวเรือน อาชีพหลัก ภาระหนี้สิน และกลุ่มออมทรัพย์ในชุมชน</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 promo-reveal" style={{ transitionDelay: "200ms" }}>
              <div className="text-brand-400 font-bold text-xl mb-2">03. สภาพแวดล้อม</div>
              <p className="text-sm text-gray-400">การจัดการขยะ พื้นที่สีเขียว แหล่งน้ำ และความสะอาดของที่อยู่อาศัย</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 promo-reveal" style={{ transitionDelay: "300ms" }}>
              <div className="text-brand-400 font-bold text-xl mb-2">04. โครงสร้างพื้นฐาน</div>
              <p className="text-sm text-gray-400">ถนน ไฟฟ้า ประปา อินเทอร์เน็ต และการเข้าถึงบริการสาธารณะพื้นฐาน</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 promo-reveal" style={{ transitionDelay: "400ms" }}>
              <div className="text-brand-400 font-bold text-xl mb-2">05. สังคมและการศึกษา</div>
              <p className="text-sm text-gray-400">อัตราการเรียนจบ ความปลอดภัยในชีวิต และการรวมกลุ่มทำกิจกรรม</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 promo-reveal" style={{ transitionDelay: "500ms" }}>
              <div className="text-brand-400 font-bold text-xl mb-2">06. การบริหารจัดการ</div>
              <p className="text-sm text-gray-400">ความเข้มแข็งของผู้นำ การมีส่วนร่วมของลูกบ้าน และความโปร่งใสของกองทุน</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section className="py-24 bg-gray-50" id="pricing">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 promo-reveal">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-gray-900 mb-3">เลือกแพ็กเกจที่เหมาะสม</h2>
            <p className="text-gray-400 text-lg">เริ่มต้นใช้งานฟรี หรืออัปเกรดเพื่อรับฟีเจอร์สำหรับองค์กรเต็มรูปแบบ</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="promo-reveal bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2">เริ่มต้น (Free)</h3>
              <p className="text-gray-500 text-sm mb-6">เหมาะสำหรับผู้ใหญ่บ้านหรือผู้นำชุมชนขนาดเล็ก</p>
              <div className="text-4xl font-display font-bold text-gray-900 mb-6">฿0 <span className="text-base font-normal text-gray-400">/ เดือน</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-700"><svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> ข้อมูลสูงสุด 100 ครัวเรือน</li>
                <li className="flex items-center gap-3 text-sm text-gray-700"><svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> ฟีเจอร์พื้นฐานครบถ้วน</li>
                <li className="flex items-center gap-3 text-sm text-gray-700"><svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> ออกรายงานเบื้องต้นได้</li>
              </ul>
              <a href="/signup/" className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center font-semibold rounded-xl transition-colors">สมัครใช้งานฟรี</a>
            </div>

            <div className="promo-reveal bg-brand-900 border border-brand-800 rounded-3xl p-8 shadow-xl flex flex-col relative overflow-hidden" style={{ transitionDelay: "100ms" }}>
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">แนะนำสำหรับ อบต.</div>
              <h3 className="text-xl font-bold text-white mb-2">ระดับองค์กร (Pro)</h3>
              <p className="text-brand-200 text-sm mb-6">ฟังก์ชันจัดเต็ม ไม่จำกัดข้อมูล สำหรับดูแลทั้งตำบล</p>
              <div className="text-4xl font-display font-bold text-white mb-6">ติดต่อเรา</div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300"><svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> ไม่จำกัดจำนวนครัวเรือนและหมู่บ้าน</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> คำนวณ Village Index เชิงลึก</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> แผนที่บ้านพร้อมพิกัด GPS อัจฉริยะ</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> ทีมงานซัพพอร์ตและจัดอบรม</li>
              </ul>
              <a href="#contact" className="block w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white text-center font-semibold rounded-xl transition-colors">ขอใบเสนอราคา</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8" id="contact">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <a href="#" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="font-display font-bold text-lg text-brand-600">Smart <span className="text-amber-500">Village</span></span>
              </a>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">แพลตฟอร์มบริหารจัดการหมู่บ้านอัจฉริยะ ที่ช่วยยกระดับคุณภาพชีวิตชุมชนด้วยการใช้ Data-driven Management</p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">เมนูหลัก</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-brand-600 transition-colors">ฟีเจอร์</a></li>
                <li><a href="#vi" className="hover:text-brand-600 transition-colors">Village Index</a></li>
                <li><a href="#modules" className="hover:text-brand-600 transition-colors">โมดูลระบบ</a></li>
                <li><a href="#pricing" className="hover:text-brand-600 transition-colors">แพ็กเกจ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">ติดต่อเรา</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>โทร: 02-XXX-XXXX</li>
                <li>อีเมล: hello@kasetservices.com</li>
                <li>Line: @kasetservices</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">© 2026 KasetServices. All rights reserved.</p>
            <div className="flex gap-4 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600 transition-colors">นโยบายความเป็นส่วนตัว</a>
              <a href="#" className="hover:text-gray-600 transition-colors">เงื่อนไขการใช้งาน</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
