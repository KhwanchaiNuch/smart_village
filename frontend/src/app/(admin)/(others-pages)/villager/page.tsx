"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

interface Household {
  householdId: number;
  houseNo: string;
  moo: string;
  houseCondition: string;
  waterSystem: string;
  internetAccess: boolean;
  remark: string;
}

interface Person {
  personId: number;
  householdId: number;
  firstName: string;
  lastName: string;
  occupation: string;
  isSick: boolean;
  isBedridden: boolean;
}

const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "ประชุมหมู่บ้านประจำเดือน",
    date: "15 มิถุนายน 2568",
    body: "ขอเชิญประชาชนในหมู่บ้านทุกท่านเข้าร่วมประชุมประจำเดือน ณ ศาลาประชาคม เวลา 09:00 น.",
    tag: "ประชุม",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 2,
    title: "แจ้งการฉีดวัคซีนไข้หวัดใหญ่",
    date: "20 มิถุนายน 2568",
    body: "อสม. จะออกให้บริการฉีดวัคซีนไข้หวัดใหญ่ฟรี สำหรับผู้สูงอายุและผู้ป่วยเรื้อรัง",
    tag: "สุขภาพ",
    tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 3,
    title: "โครงการซ่อมแซมถนนในหมู่บ้าน",
    date: "1 กรกฎาคม 2568",
    body: "อบต. จะดำเนินการซ่อมแซมถนนสายหลักภายในหมู่บ้าน อาจมีการปิดถนนชั่วคราว",
    tag: "โครงสร้างพื้นฐาน",
    tagColor: "bg-yellow-100 text-yellow-700",
  },
];

export default function VillagerPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<Person[]>([]);
  const [householdId, setHouseholdId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Smart Village | หน้าหลักลูกบ้าน";

    // scope_id ของ VILLAGE user = household_id ของครัวเรือนตัวเอง
    const scopeId = Number(localStorage.getItem("scopeId"));
    if (!scopeId) { setLoading(false); return; }
    setHouseholdId(scopeId);

    Promise.all([
      axios.get<Household>(`/households/${scopeId}`),
      axios.get<Person[]>(`/persons/by-household/${scopeId}`),
    ])
      .then(([hRes, pRes]) => {
        setHousehold(hRes.data);
        setMembers(pRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!household) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        ไม่พบข้อมูลครัวเรือน
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white text-xl">
            🏠
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              บ้านเลขที่ {household.houseNo}{household.moo ? ` หมู่ ${household.moo}` : ""}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              สภาพบ้าน: {household.houseCondition || "—"} · น้ำ: {household.waterSystem || "—"} · อินเทอร์เน็ต: {household.internetAccess ? "มี" : "ไม่มี"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* สมาชิกในครัวเรือน */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              👨‍👩‍👧‍👦 สมาชิกในครัวเรือน
              <span className="text-xs font-normal text-gray-400">({members.length} คน)</span>
            </h2>
            <button
              onClick={() => router.push(`/villager/add-person`)}
              className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              เพิ่มสมาชิก
            </button>
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            {members.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                ยังไม่มีข้อมูลสมาชิก — กดปุ่ม "เพิ่มสมาชิก" เพื่อเริ่มต้น
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {members.map((p) => (
                  <div key={p.personId} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                        {p.firstName?.[0] ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{p.occupation || "ไม่ระบุอาชีพ"}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center">
                      {p.isBedridden && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                          ติดเตียง
                        </span>
                      )}
                      {p.isSick && !p.isBedridden && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                          ป่วย
                        </span>
                      )}
                      {!p.isSick && !p.isBedridden && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          ปกติ
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ประกาศหมู่บ้าน */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
            📢 ประกาศหมู่บ้าน
          </h2>
          <div className="space-y-3">
            {MOCK_ANNOUNCEMENTS.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.tagColor}`}>
                    {a.tag}
                  </span>
                  <span className="text-xs text-gray-400">{a.date}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                  {a.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {a.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
