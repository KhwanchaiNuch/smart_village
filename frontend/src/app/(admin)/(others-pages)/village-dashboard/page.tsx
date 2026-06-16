"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { useVillage } from "@/context/VillageContext";
import DashboardView, { HouseholdData, PersonData } from "@/components/dashboard/DashboardView";

export default function VillageDashboard() {
  const router = useRouter();
  const { village, loaded } = useVillage();
  const [households, setHouseholds] = useState<HouseholdData[]>([]);
  const [persons, setPersons] = useState<PersonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Smart Village | Dashboard หมู่บ้าน";
    // ถ้าโหลด context แล้วยังไม่มีหมู่บ้านที่เลือก → ส่งไปเลือกที่หน้า /village
    if (loaded && !village) {
      router.replace("/village");
      return;
    }
    if (!village) return;
    Promise.all([
      axios.get<HouseholdData[]>("/households"),
      axios.get<PersonData[]>("/persons"),
    ])
      .then(([hRes, pRes]) => {
        const filteredH = hRes.data.filter((h) => h.villageId === village.villageId);
        const householdIds = new Set(filteredH.map((h) => h.householdId));
        const filteredP = pRes.data.filter((p) => householdIds.has(p.householdId));
        setHouseholds(filteredH);
        setPersons(filteredP);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loaded, village, router]);

  if (!village) {
    return (
      <div className="p-6 text-center text-gray-500">
        ยังไม่ได้เลือกหมู่บ้าน — กำลังพาไปหน้าเลือกหมู่บ้าน...
      </div>
    );
  }

  const subtitle = `${village.villageName}${village.moo ? ` (หมู่ ${village.moo})` : ""} · เห็นเฉพาะข้อมูลของหมู่บ้านนี้`;

  return (
    <DashboardView
      households={households}
      persons={persons}
      loading={loading}
      scopeBanner={{
        icon: "🏘️",
        title: "Dashboard หมู่บ้าน",
        subtitle,
        badge: { text: "หมู่บ้านที่กำลังดู", className: "bg-emerald-100 text-emerald-700" },
      }}
    />
  );
}
