"use client"
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import DashboardView, { HouseholdData, PersonData } from "@/components/dashboard/DashboardView";

const ROLE_LABEL: Record<string, string> = {
  ADMIN:    "ผู้ดูแลระบบ",
  PROVINCE: "ผู้ใช้ระดับจังหวัด",
  AMPHUR:   "ผู้ใช้ระดับอำเภอ",
  TAMBON:   "ผู้ใช้ระดับตำบล",
  VILLAGE:  "ผู้ใช้ระดับหมู่บ้าน",
};

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
    Promise.all([
      axios.get<HouseholdData[]>("/households"),
      axios.get<PersonData[]>("/persons"),
    ])
      .then(([hRes, pRes]) => {
        setHouseholds(hRes.data);
        setPersons(pRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roleLabel = ROLE_LABEL[userRole || ""] || userRole || "—";
  const badgeClass =
    userRole === "ADMIN" ? "bg-purple-100 text-purple-700" :
    userRole === "VILLAGE" ? "bg-green-100 text-green-700" :
    "bg-blue-100 text-blue-700";

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
