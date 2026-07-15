"use client";

import { useEffect } from "react";
import Image from "next/image";
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
    <div className="promo-page font-sans text-gray-900 bg-white antialiased">

      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-[76px] flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="font-bold text-[17px] text-green-800">
              หมู่บ้าน<span className="text-yellow-500">ดิจิตอล</span>
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <li><a href="#features" className="hover:text-green-700 transition-colors">ฟีเจอร์</a></li>
            <li><a href="#howitworks" className="hover:text-green-700 transition-colors">การทำงาน</a></li>
            <li><a href="#benefits" className="hover:text-green-700 transition-colors">ประโยชน์</a></li>
            <li><a href="#contact" className="hover:text-green-700 transition-colors">ติดต่อเรา</a></li>
          </ul>

          <a
            href="/signin"
            className="inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            ขอชมระบบ
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-[76px] bg-white flex items-center promo-grid-bg overflow-hidden" id="home">
        <div className="max-w-6xl mx-auto px-6 py-24 lg:py-32 w-full">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-14 items-center">
            {/* Left */}
            <div className="promo-reveal">
              <h1 className="font-bold text-5xl lg:text-[4rem] leading-[1.16] mb-6 text-gray-900">
                ข้อมูลทุกครัวเรือน<br />
                <span className="text-green-700">มองเห็นได้บนแผนที่</span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
                ระบบบริหารข้อมูลชุมชน สำหรับผู้นำหมู่บ้าน<br />
                และองค์กรปกครองส่วนท้องถิ่น
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <a
                  href="/signin"
                  className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-7 py-3 rounded-lg transition-colors text-sm"
                >
                  ขอชมระบบ
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 bg-white text-green-700 font-semibold px-7 py-3 rounded-lg border border-green-700 hover:bg-green-50 transition-colors text-sm"
                >
                  ดูฟีเจอร์
                </a>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="font-medium">ปลอดภัย<br /><span className="text-xs text-gray-400">มาตรฐานความปลอดภัยตามกฎหมาย PDPA</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium">ใช้งานง่าย<br /><span className="text-xs text-gray-400">ใช้งานผ่านสมาร์ทโฟน ไม่ต้องติดตั้ง</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-medium">อัปเดตรีลไทม์<br /><span className="text-xs text-gray-400">ข้อมูลอัปเดตทันทีเมื่อมีการเปลี่ยนแปลง</span></span>
                </div>
              </div>
            </div>

            {/* Right — Map mockup */}
            <div className="promo-reveal hidden lg:block relative">
              <div className="absolute -inset-10 rounded-full bg-green-100/70 blur-3xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                {/* Map area */}
                <div
                  className="relative bg-green-900 bg-cover bg-center"
                  style={{ height: "340px", backgroundImage: "url('/images/promo/village-aerial-map.png')" }}
                >
                  {/* Satellite map SVG pattern */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="rgba(5,46,22,0.12)" />
                    <rect width="100%" height="100%" fill="url(#mapgrid)" />
                    {/* Road shapes */}
                    <path d="M 80 0 Q 120 80 160 120 Q 200 160 280 180" stroke="rgba(255,220,100,0.5)" strokeWidth="3" fill="none"/>
                    <path d="M 0 100 Q 100 120 200 100 Q 300 80 400 120" stroke="rgba(200,200,200,0.3)" strokeWidth="2" fill="none"/>
                    <path d="M 150 0 L 150 340" stroke="rgba(200,200,200,0.2)" strokeWidth="1.5" fill="none"/>
                    {/* Tree blobs */}
                    {[30,70,110,160,200,250,300,340,380].map((x,i) => (
                      <circle key={i} cx={x} cy={40+i*20} r={12+i%3*5} fill="rgba(34,100,50,0.6)" />
                    ))}
                    {/* House markers */}
                    <circle cx="180" cy="120" r="8" fill="#ef4444" opacity="0.9"/>
                    <circle cx="240" cy="160" r="8" fill="#22c55e" opacity="0.9"/>
                    <circle cx="300" cy="100" r="8" fill="#22c55e" opacity="0.9"/>
                    <circle cx="120" cy="200" r="8" fill="#f59e0b" opacity="0.9"/>
                    <circle cx="200" cy="250" r="8" fill="#22c55e" opacity="0.9"/>
                    <circle cx="350" cy="200" r="8" fill="#22c55e" opacity="0.9"/>
                    <circle cx="280" cy="280" r="8" fill="#22c55e" opacity="0.9"/>
                  </svg>

                  {/* Search bar overlay */}
                  <div className="absolute top-3 left-3 right-3 flex gap-2">
                    <div className="flex-1 bg-white rounded-lg px-3 py-2 text-xs text-gray-400 flex items-center gap-2 shadow">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      จังหวัด / อำเภอ / ตำบล
                    </div>
                    <div className="bg-white rounded-lg w-9 flex items-center justify-center shadow">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/></svg>
                    </div>
                    <div className="bg-white rounded-lg w-9 flex items-center justify-center shadow">
                      <div className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center text-white text-[9px] font-bold">A</div>
                    </div>
                  </div>

                  {/* Left panel */}
                  <div className="absolute top-14 left-3 w-44 bg-white rounded-xl shadow-lg p-3">
                    <div className="text-[10px] font-bold text-gray-700 mb-2 border-b pb-1.5">ข้อมูลพื้นที่</div>
                    <div className="space-y-1.5 text-[9px] text-gray-500">
                      <div className="flex justify-between"><span>หมู่บ้าน</span><span className="font-bold text-gray-800">หมู่ 5 บ้านนาดี</span></div>
                      <div className="flex justify-between"><span>ครัวเรือน</span><span className="font-bold text-gray-800">248 หลังคา</span></div>
                      <div className="flex justify-between"><span>ประชากร</span><span className="font-bold text-gray-800">1,024 คน</span></div>
                      <div className="flex justify-between"><span>ผู้สูงอายุ</span><span className="font-bold text-gray-800">187 คน</span></div>
                    </div>
                    <button className="mt-2 w-full py-1.5 bg-green-700 text-white text-[9px] rounded-lg font-semibold">ดูแผนที่</button>
                  </div>

                  {/* Right popup card */}
                  <div className="absolute top-14 right-3 w-44 bg-white rounded-xl shadow-lg p-3">
                    <div className="text-[10px] font-bold text-green-700 mb-1">นาย สมใจ วงษ์ไทย</div>
                    <div className="text-[8px] text-gray-400 mb-2">123 ม.5 บ้านนาดี ต.สันทราย</div>
                    <div className="space-y-1 text-[8px]">
                      <div className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                        <span className="text-gray-500">อายุ</span>
                        <span className="font-bold">4 ปี</span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                        <span className="text-gray-500">สถานะ</span>
                        <span className="font-bold text-green-700">ปกติ</span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                        <span className="text-gray-500">เยี่ยมล่าสุด</span>
                        <span className="font-bold">12 พ.ค. 2567</span>
                      </div>
                    </div>
                    <button className="mt-2 w-full py-1.5 bg-green-700 text-white text-[9px] rounded-lg font-semibold">ดูข้อมูลเพิ่มเติม</button>
                  </div>
                </div>

                {/* Stats bar */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-100">
                  {[
                    { label: "ครัวเรือนทั้งหมด", value: "356", color: "text-green-700" },
                    { label: "บันทึกแล้ว", value: "248", color: "text-green-700" },
                    { label: "กลุ่มเสี่ยง", value: "68", color: "text-orange-500" },
                    { label: "ปัญหา", value: "40", color: "text-red-500" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[9px] text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 bg-gray-50" id="features">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-14 promo-reveal">
            เครื่องมือทำงานชุมชนในระบบเดียว
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                ),
                color: "bg-green-100 text-green-700",
                title: "แผนที่ครัวเรือน",
                desc: "มองเห็นตำแหน่งบ้านแต่ละหลังบนแผนที่ ระบุพิกัดครัวเรือนได้ทันที",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                ),
                color: "bg-blue-100 text-blue-700",
                title: "ฐานข้อมูลครัวเรือน",
                desc: "จัดเก็บข้อมูลบุคคล สุขภาพ เศรษฐกิจ เป็นระบบ ค้นหาได้รวดเร็ว",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                ),
                color: "bg-orange-100 text-orange-600",
                title: "การเยี่ยมบ้าน",
                desc: "บันทึกการเยี่ยมบ้านผ่านมือถือ พร้อมแนบรูปถ่ายและอัปเดตข้อมูลสุขภาพ",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                ),
                color: "bg-yellow-100 text-yellow-700",
                title: "ติดตามปัญหา",
                desc: "บันทึกและติดตามปัญหาชุมชน ไฟฟ้า ถนน น้ำ และสถานะการดำเนินการ",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                ),
                color: "bg-purple-100 text-purple-700",
                title: "การอบรมและกิจกรรม",
                desc: "จัดการอบรม กิจกรรมชุมชน บันทึกผู้เข้าร่วมและสรุปผล",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
                color: "bg-green-100 text-green-700",
                title: "รายงานและสรุปผล",
                desc: "สรุปข้อมูลรายงานราชการพร้อมพิมพ์ ออก PDF ได้ในคลิกเดียว",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="promo-reveal promo-f-card bg-white border border-gray-100 rounded-2xl p-8 shadow-sm"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
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
              <div
                className="relative bg-green-900 bg-cover bg-center"
                style={{ height: "380px", backgroundImage: "url('/images/promo/village-aerial-map.png')" }}
              >
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                  <rect width="100%" height="100%" fill="rgba(5,46,22,0.12)" />
                  <rect width="100%" height="100%" fill="url(#mapgrid)" />
                  <path d="M 60 0 Q 140 100 200 180 Q 260 260 320 380" stroke="rgba(255,220,80,0.6)" strokeWidth="4" fill="none"/>
                  <path d="M 0 150 Q 180 130 360 160 Q 420 170 480 150" stroke="rgba(200,200,200,0.3)" strokeWidth="2" fill="none"/>
                  {[20,60,100,150,190,230,280,320,360,400].map((x,i)=>(
                    <circle key={i} cx={x} cy={60+i*25} r={10+i%4*4} fill="rgba(30,100,50,0.7)" />
                  ))}
                  <circle cx="200" cy="180" r="10" fill="#ef4444"/>
                  <circle cx="260" cy="140" r="10" fill="#22c55e"/>
                  <circle cx="320" cy="220" r="10" fill="#22c55e"/>
                  <circle cx="140" cy="240" r="10" fill="#f59e0b"/>
                  <circle cx="360" cy="160" r="10" fill="#22c55e"/>
                  <circle cx="240" cy="280" r="10" fill="#22c55e"/>
                  <circle cx="180" cy="320" r="10" fill="#22c55e"/>
                  <circle cx="300" cy="310" r="10" fill="#ef4444"/>
                </svg>
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 rounded-xl p-3 text-[10px] space-y-1 shadow">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"/><span>ปกติ</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"/><span>กลุ่มเสี่ยง</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"/><span>ต้องเยี่ยมบ้าน</span></div>
                </div>
              </div>
            </div>

            {/* Right text */}
            <div className="promo-reveal">
              <h2 className="font-bold text-4xl lg:text-5xl text-gray-900 mb-8 leading-tight">
                รู้พื้นที่ รู้ปัญหา<br />
                <span className="text-green-700">เข้าถึงทุกครัวเรือน</span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
                    title: "ค้นหาบ้านจากแผนที่",
                    desc: "ค้นหาและดูตำแหน่งครัวเรือนได้รวดเร็ว พร้อมตัวกรองตามกลุ่มเป้าหมาย",
                  },
                  {
                    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                    title: "ดูข้อมูลและประวัติเยี่ยมบ้าน",
                    desc: "ดูประวัติครัวเรือน สมาชิก ข้อมูลสุขภาพ และบันทึกการเยี่ยมบ้านย้อนหลัง",
                  },
                  {
                    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
                    title: "ติดตามความช่วยเหลือ",
                    desc: "ติดตามสถานะการช่วยเหลือแต่ละครัวเรือน และประสานงานทีมงานให้ลงพื้นที่ได้ทันที",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 mb-1">{item.title}</div>
                      <div className="text-sm text-gray-500 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE + TRAINING SECTION ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-bold text-3xl lg:text-4xl text-center text-gray-900 mb-14 promo-reveal">
            จากการลงพื้นที่ สู่ข้อมูลที่ติดตามได้
          </h2>
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left - Field recording */}
            <div className="promo-reveal">
              <h3 className="font-bold text-gray-800 mb-4">บันทึกการเยี่ยมบ้าน</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                อสม. และเจ้าหน้าที่บันทึกการเยี่ยมบ้านผ่านมือถือ พร้อมอัปเดตข้อมูลสุขภาพ
              </p>
              <ul className="space-y-2 mb-6">
                {["บันทึกข้อมูลสุขภาพได้ทันที","แนบรูปถ่ายและเอกสาร","ตรวจสอบข้อมูลการเยี่ยมบ้าน","ติดตามสถานะการเยี่ยม"].map(t=>(
                  <li key={t} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Center - Phone mockup */}
            <div className="promo-reveal flex justify-center">
              <div className="w-56 bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl border-4 border-gray-800">
                <div className="bg-white rounded-[2rem] overflow-hidden" style={{ height: "380px" }}>
                  <div className="bg-green-700 px-4 py-3">
                    <div className="text-white text-xs font-bold">บันทึกการเยี่ยมบ้าน</div>
                    <div className="text-green-200 text-[10px]">นาย สมใจ วงษ์ไทย</div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-[9px] text-gray-400 mb-0.5">ประวัติเยี่ยมบ้าน</div>
                      {[
                        { date: "12 พ.ค. 2567", status: "เยี่ยมบ้าน", color: "text-green-600" },
                        { date: "18 เม.ย. 2567", status: "บันทึกสุขภาพ", color: "text-blue-600" },
                        { date: "20 มี.ค. 2567", status: "ส่งต่อ รพ.", color: "text-orange-600" },
                      ].map(r=>(
                        <div key={r.date} className="flex items-center gap-2 py-1 border-b border-gray-100 last:border-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"/>
                          <div className="text-[8px] text-gray-500">{r.date}</div>
                          <div className={`text-[8px] font-medium ml-auto ${r.color}`}>{r.status}</div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2 bg-green-700 text-white text-[10px] font-semibold rounded-lg">
                      + บันทึกข้อมูล
                    </button>
                    <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                      <div className="text-[9px] font-semibold text-green-700 mb-1">สถานะล่าสุด</div>
                      <div className="text-[8px] text-gray-500">เยี่ยมบ้านครั้งล่าสุด: 12 พ.ค. 2567</div>
                      <div className="text-[8px] text-gray-500">100 ม.5 บ้านนาดี</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Training */}
            <div className="promo-reveal">
              <h3 className="font-bold text-gray-800 mb-4">จัดการการอบรมและกิจกรรม</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                ระบบจัดการตารางอบรม บันทึกผู้เข้าร่วม และสรุปผลการอบรมโดยอัตโนมัติ
              </p>
              {/* Training table mockup */}
              <div className="border border-gray-200 rounded-xl overflow-hidden text-[10px]">
                <div className="bg-gray-800 text-white px-3 py-2 font-semibold text-[10px]">
                  โครงการอบรมล่าสุด เพชรบูรณ์
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="text-left px-3 py-1.5">โครงการ</th>
                      <th className="text-right px-3 py-1.5">เป้าหมาย</th>
                      <th className="text-right px-3 py-1.5">จริง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ["สุขภาพผู้สูงอายุ","120","105"],
                      ["ทักษะอาชีพ","80","72"],
                      ["ลดหนี้ครัวเรือน","150","133"],
                    ].map(([name,target,actual])=>(
                      <tr key={name} className="text-gray-700">
                        <td className="px-3 py-2">{name}</td>
                        <td className="px-3 py-2 text-right">{target}</td>
                        <td className="px-3 py-2 text-right font-bold text-green-700">{actual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pie chart placeholder */}
              <div className="mt-4 flex items-center gap-4">
                <svg viewBox="0 0 36 36" className="w-16 h-16 flex-shrink-0">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.8"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#15803d" strokeWidth="3.8"
                    strokeDasharray="86 14" strokeDashoffset="25" transform="rotate(-90 18 18)"/>
                </svg>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-700"/><span className="text-gray-600">เสร็จแล้ว 86%</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-300"/><span className="text-gray-600">รอดำเนินการ 14%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REPORTS SECTION ===== */}
      <section className="py-20 promo-report-section text-white" id="benefits">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 promo-reveal">
            <h2 className="font-bold text-3xl lg:text-4xl mb-3">รายงานพร้อมใช้ เพื่อการตัดสินใจที่แม่นยำ</h2>
            <p className="text-gray-400 text-sm">สรุปภาพรวมรายงานในระบบ ออกแบบง่าย พร้อมส่งออก PDF ได้ทันที</p>
          </div>

          <div className="grid lg:grid-cols-[200px_1fr_220px] gap-6 items-start">
            {/* Sidebar */}
            <div className="promo-reveal space-y-1.5">
              {[
                { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3", label: "สรุปข้อมูลครัวเรือน", active: true },
                { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", label: "ผลการเยี่ยมบ้าน" },
                { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857", label: "ผู้ร่วมอบรม" },
                { icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", label: "ปัญหาและการช่วยเหลือ" },
              ].map((item) => (
                <div key={item.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${item.active ? "bg-green-700 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Center dashboard */}
            <div className="promo-reveal bg-white rounded-2xl p-5 text-gray-900">
              <div className="text-sm font-bold text-gray-800 mb-4">รายงานภาพรวม</div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: "ครัวเรือน", value: "356", color: "text-green-700" },
                  { label: "บันทึกแล้ว", value: "248", color: "text-green-700" },
                  { label: "กลุ่มเสี่ยง", value: "68", color: "text-orange-500" },
                  { label: "ปัญหา", value: "40", color: "text-red-500" },
                ].map(s=>(
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-semibold text-gray-600 mb-2">สัดส่วนกลุ่มเป้าหมาย</div>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-16 h-16">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.8"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#15803d" strokeWidth="3.8" strokeDasharray="47 53" strokeDashoffset="25" transform="rotate(-90 18 18)"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3.8" strokeDasharray="27 73" strokeDashoffset="-22" transform="rotate(-90 18 18)"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3.8" strokeDasharray="15 85" strokeDashoffset="-49" transform="rotate(-90 18 18)"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" strokeWidth="3.8" strokeDasharray="11 89" strokeDashoffset="-64" transform="rotate(-90 18 18)"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">86</div>
                </div>
                <div className="space-y-1 text-[10px]">
                  {[["#15803d","ปกติ","47%"],["#f59e0b","กลุ่มเสี่ยง","27%"],["#3b82f6","ผู้สูงอายุ","15%"],["#ef4444","ติดเตียง","11%"]].map(([c,l,v])=>(
                    <div key={l} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:c}}/>
                      <span className="text-gray-500">{l}</span>
                      <span className="ml-auto font-semibold text-gray-700">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right PDF preview */}
            <div className="promo-reveal">
              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">รายงาน PDF</span>
                  <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded font-bold">PDF</span>
                </div>
                <div className="bg-white rounded-lg p-3 text-[8px] text-gray-700">
                  <div className="font-bold text-center text-[9px] mb-2 border-b pb-1">
                    รายงานสรุปสถานะบ้าน<br/>ตำบลสันทราย อ.เพชรบูรณ์<br/>ประจำปี 2567
                  </div>
                  <table className="w-full text-[7px]">
                    <thead><tr className="bg-gray-100"><th className="text-left py-0.5 px-1">หัวข้อ</th><th className="text-right py-0.5 px-1">จำนวน</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {[["ครัวเรือนทั้งหมด","356"],["บันทึกแล้ว","248"],["กลุ่มเสี่ยง","68"],["ปัญหาค้างแก้","40"]].map(([l,v])=>(
                        <tr key={l}><td className="py-0.5 px-1">{l}</td><td className="py-0.5 px-1 text-right font-bold">{v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="mt-3 w-full py-2 bg-green-700 hover:bg-green-800 text-white text-[10px] rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  ส่งออกข้อมูล
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
                sub: "ผู้นำหมู่บ้านและผู้ดูแลชุมชน",
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
                sub: "สำหรับ สถจ. อำเภอ จังหวัด",
                image: "/images/promo/audience-local.png",
                color: "from-orange-700 to-orange-500",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
              },
            ].map((item, i) => (
              <div
                key={item.label}
                className="promo-reveal rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="relative h-32 overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-950/35 to-transparent" />
                </div>
                <div className="bg-white p-4 text-center">
                  <div className="font-bold text-gray-900 mb-0.5">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 promo-cta-light text-gray-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" preserveAspectRatio="xMidYMax slice">
            <path d="M-100 300 Q200 200 500 250 Q700 280 1000 220 Q1200 180 1500 240 L1500 500 L-100 500Z" fill="rgba(255,255,255,0.15)"/>
            <path d="M-100 350 Q300 280 600 310 Q850 330 1100 280 Q1300 260 1500 300 L1500 500 L-100 500Z" fill="rgba(255,255,255,0.1)"/>
          </svg>
        </div>
        <div className="max-w-2xl mx-auto px-6 relative z-10 promo-reveal">
          <h2 className="font-bold text-3xl sm:text-4xl mb-4">เริ่มจัดการข้อมูลชุมชนอย่างเป็นระบบ</h2>
          <p className="text-gray-500 text-base mb-8 leading-relaxed">
            เพิ่มประสิทธิภาพการทำงาน ลดขั้นตอนเอกสาร และเข้าถึงข้อมูลชุมชนได้ทุกที่ทุกเวลา
          </p>
          <a
            href="/signin"
            className="inline-flex items-center gap-2 bg-green-700 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-green-800 transition-colors shadow-lg text-sm"
          >
            ขอชมระบบ
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
                <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                </div>
                <span className="font-bold text-green-800">หมู่บ้าน<span className="text-yellow-500">ดิจิตอล</span></span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                ระบบบริหารข้อมูลชุมชนอัจฉริยะ ยกระดับคุณภาพชีวิตด้วยข้อมูล
              </p>
              <div className="flex gap-3">
                {["M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
                  "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
                  "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z"
                ].map((d,i)=>(
                  <a key={i} href="#" className="w-8 h-8 bg-gray-100 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d={d}/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold text-gray-800 mb-3 text-sm">หน้า</div>
              <ul className="space-y-2 text-xs text-gray-500">
                {["หน้าแรก","ฟีเจอร์","การทำงาน","ติดต่อ"].map(l=>(
                  <li key={l}><a href="#" className="hover:text-green-700 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-800 mb-3 text-sm">การทำงาน</div>
              <ul className="space-y-2 text-xs text-gray-500">
                {["แผนที่ครัวเรือน","บันทึกสุขภาพ","รายงาน","ระบบผู้ใช้"].map(l=>(
                  <li key={l}><a href="#" className="hover:text-green-700 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-800 mb-3 text-sm">ติดต่อเรา</div>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>📞 02-XXX-XXXX</li>
                <li>✉️ hello@kasetservices.com</li>
                <li>📍 เพชรบูรณ์ ประเทศไทย</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} KasetServices. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-600">นโยบายความเป็นส่วนตัว</a>
              <a href="#" className="hover:text-gray-600">เงื่อนไขการใช้งาน</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
