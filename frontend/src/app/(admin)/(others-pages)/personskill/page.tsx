"use client"
import ComponentCard from "@/components/common/ComponentCard";
import DataTableWrapper, { DtColumn } from "@/components/common/DataTableWrapper";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useVillage } from "@/context/VillageContext";

interface PersonSkill {
  skillId: number;
  personId: number | null;
  skillName: string | null;
  skillLevel: string | null;
  skillCategories: string | null;
  certificateFlag: boolean | null;
  createdAt: string | null;
  [key: string]: unknown;
}

interface Person { personId: number; firstName: string; lastName: string; }

const LEVEL_CONFIG: Record<string, { bg: string; text: string }> = {
  "เชี่ยวชาญ": { bg: "bg-purple-100", text: "text-purple-700" },
  "ดี":        { bg: "bg-blue-100",   text: "text-blue-700"   },
  "ปานกลาง":  { bg: "bg-yellow-100", text: "text-yellow-700" },
  "เบื้องต้น": { bg: "bg-gray-100",   text: "text-gray-600"  },
};

const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";

export default function PersonSkillPage() {
  const { village, loaded } = useVillage();
  const { canAdd, canEdit, canDelete, canView } = usePermission();
  const [skills, setSkills]   = useState<PersonSkill[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState("");
  const [filterCert, setFilterCert]   = useState("");

  const fetchData = useCallback(async () => {
    try {
      const vid = village?.villageId;
      const [skillRes, personRes] = await Promise.all([
        axios.get<PersonSkill[]>(vid ? `/person-skills?villageId=${vid}` : "/person-skills"),
        axios.get<Person[]>(vid ? `/persons?villageId=${vid}` : "/persons"),
      ]);
      setSkills(skillRes.data);
      setPersons(personRes.data);
    } catch (err: unknown) {
      const msg = (err as {response?: {data?: {message?: string}}})?.response?.data?.message;
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: msg || "กรุณาลองใหม่" });
    }
  }, [village]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | ทักษะบุคคล";
    if (!loaded) return;
    fetchData();
  }, [fetchData, loaded]);

  const personMap = Object.fromEntries(persons.map((p) => [p.personId, `${p.firstName} ${p.lastName}`]));
  const allLevels = Array.from(new Set(skills.map((s) => s.skillLevel).filter(Boolean)));

  // Pre-filter by level/cert (DataTableWrapper handles text search)
  const preFiltered = skills.filter((s) => {
    const matchLevel = !filterLevel || s.skillLevel === filterLevel;
    const matchCert  = filterCert === "" ? true : filterCert === "true" ? s.certificateFlag === true : s.certificateFlag !== true;
    return matchLevel && matchCert;
  });

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    if (ids.length === 0) return;
    const result = await Swal.fire({
      icon: "warning", title: "ยืนยันการลบ?",
      html: `ลบทักษะ <b>${ids.length}</b> รายการ`,
      showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await Promise.allSettled(ids.map((id) => axios.delete(`/person-skills/${id}`)));
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const columns: DtColumn<PersonSkill>[] = [
    { key: "_skillCategories", label: "หมวดหมู่ทักษะ", onlyExport: true, exportText: (s) => s.skillCategories ?? "" },
    {
      key: "personId", label: "ชื่อบุคคล", align: "center",
      searchText: (s) => personMap[s.personId ?? -1] || "",
      exportText:  (s) => personMap[s.personId ?? -1] || `#${s.personId ?? "-"}`,
      render:      (s) => <span>{personMap[s.personId ?? -1] || `#${s.personId ?? "-"}`}</span>,
    },
    {
      key: "skillName", label: "ทักษะ", align: "center",
      exportText: (s) => s.skillName ?? "",
      render: (s) => <span>{s.skillName || "-"}</span>,
    },
    {
      key: "skillLevel", label: "ระดับ", align: "center",
      exportText: (s) => s.skillLevel ?? "",
      render: (s) => {
        const cfg = LEVEL_CONFIG[s.skillLevel ?? ""] || { bg: "bg-gray-100", text: "text-gray-600" };
        return s.skillLevel
          ? <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>{s.skillLevel}</span>
          : <span className="text-gray-400">-</span>;
      },
    },
    {
      key: "certificateFlag", label: "ใบรับรอง", align: "center",
      searchText: (s) => s.certificateFlag === true ? "มีใบรับรอง" : "ไม่มีใบรับรอง",
      exportText:  (s) => s.certificateFlag === true ? "มีใบรับรอง" : "-",
      render: (s) =>
        s.certificateFlag === true
          ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">มีใบรับรอง</span>
          : <span className="text-gray-400 text-xs">-</span>,
    },
    {
      key: "createdAt", label: "วันที่บันทึก", align: "center",
      exportText: (s) => s.createdAt ? s.createdAt.slice(0, 10) : "",
      render: (s) => <span>{s.createdAt ? s.createdAt.slice(0, 10) : "-"}</span>,
    },
    {
      key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
      render: (s) => (
        <div className="flex justify-center">
          {canEdit("/personskill") && (
            <a href={`/personskill/edit?id=${s.skillId}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600">
              <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
              </svg>
            </a>
          )}
        </div>
      ),
    },
  ];

  const toolbarExtra = (
    <>
      <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className={selCls}>
        <option value="">ทุกระดับ</option>
        {allLevels.map((l) => <option key={l!} value={l!}>{l}</option>)}
      </select>
      <select value={filterCert} onChange={(e) => setFilterCert(e.target.value)} className={selCls}>
        <option value="">ทุกประเภท</option>
        <option value="true">มีใบรับรอง</option>
        <option value="false">ไม่มีใบรับรอง</option>
      </select>
    </>
  );

  return (
    <PermissionGuard menuUrl="/personskill">
      <ComponentCard title="">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ทักษะบุคคล</h3>
          {village && <p className="text-xs text-gray-500 mt-0.5">{village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}</p>}
        </div>
        <DataTableWrapper<PersonSkill>
          data={preFiltered}
          columns={columns}
          idKey="skillId"
          addUrl="/personskill/add"
          canAdd={canAdd("/personskill")}
          canDelete={canDelete("/personskill")}
          canExport={canView("/personskill")}
          onDeleteSelected={handleDeleteSelected}
          exportFilename="person_skills"
          toolbarExtra={toolbarExtra}
          loading={loading}
          emptyText="ไม่มีข้อมูลทักษะ"
        />
      </ComponentCard>
    </PermissionGuard>
  );
}
