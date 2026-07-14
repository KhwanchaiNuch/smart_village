"use client"
import { useEffect, useRef, useState, useCallback, Suspense} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

import { useVillage } from "@/context/VillageContext";
import Base64Image from "@/components/common/Base64Image";
import { useImageBase64 } from "@/hooks/useImageBase64";
import PermissionGuard from "@/components/common/PermissionGuard";

interface CommunityIssue {
  id: number;
  householdId: number | null;
  area: string;
  issueType: string;
  severity: number;
  status: string;
  owner: string;
  impactPeople: number | null;
  budgetEstimate: number | null;
  dueDate: string | null;
  remark: string | null;
  imageUrl: string | null;
  createdAt: string | null;
  villageId?: number | null; // 👈 เพิ่ม Type รองรับ VillageId
}

interface MatchedPerson {
  personId: number;
  fullName: string;
  age: number | null;
  occupation: string | null;
  matchedSkill: string;
  skillLevel: string | null;
  householdId: number | null;
  houseNo: string | null;
}

interface MatchedResource {
  resourceId: number;
  resourceName: string;
  resourceType: string | null;
  description: string | null;
}

interface Recommendations {
  matchedPeople: MatchedPerson[];
  matchedResources: MatchedResource[];
}

interface IssueLog {
  id: number;
  issueId: number;
  title: string;
  detail: string | null;
  status: string | null;
  imageUrl: string | null;
  createdAt: string | null;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  "ยังไม่แก้": { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500" },
  "กำลังทำ":   { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  "แก้แล้ว":   { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
};

const SEVERITY_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: "น้อยมาก", bg: "bg-green-100",  text: "text-green-700" },
  2: { label: "น้อย",    bg: "bg-lime-100",   text: "text-lime-700" },
  3: { label: "ปานกลาง", bg: "bg-yellow-100", text: "text-yellow-700" },
  4: { label: "มาก",     bg: "bg-red-100",    text: "text-red-700" },
  5: { label: "วิกฤต",   bg: "bg-purple-100", text: "text-purple-700" },
};

const STATUS_OPTIONS = ["ยังไม่แก้", "กำลังทำ", "แก้แล้ว"];

function formatDate(dt: string | null): string {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function CommunityIssueDetailPageContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const id      = params.get("id");
  const { village } = useVillage();
  const contextVillageId = village?.villageId ?? null;

  const [issue,     setIssue]     = useState<CommunityIssue | null>(null);
  const [logs,       setLogs]      = useState<IssueLog[]>([]);
  const [recs,       setRecs]      = useState<Recommendations | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [editLog,   setEditLog]   = useState<IssueLog | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [formTitle,  setFormTitle]  = useState("");
  const [formDetail, setFormDetail] = useState("");
  const [formStatus, setFormStatus] = useState("");

  const [formImageFile,    setFormImageFile]    = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState("");       // blob URL (ตอนเลือกไฟล์ใหม่)
  const [formExistingImageUrl, setFormExistingImageUrl] = useState<string | null>(null); // url จาก server
  const [formImageRemoved, setFormImageRemoved] = useState(false);
  const [formObjectUrl,    setFormObjectUrl]    = useState("");
  const logFileRef = useRef<HTMLInputElement>(null);

  const issueFileRef = useRef<HTMLInputElement>(null);
  const { src: formExistingImgSrc } = useImageBase64(formExistingImageUrl);

  useEffect(() => () => { if (formObjectUrl) URL.revokeObjectURL(formObjectUrl); }, [formObjectUrl]);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    try {
      const [issueRes, logRes, recsRes] = await Promise.all([
        axios.get<CommunityIssue>(`/community-issues/${id}`),
        axios.get<IssueLog[]>(`/community-issue-logs?issueId=${id}`),
        axios.get<Recommendations>(`/community-issues/${id}/recommendations`).catch(() => ({ data: null })),
      ]);
      setIssue(issueRes.data);
      setLogs(logRes.data);
      setRecs(recsRes.data);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message || "กรุณาลองใหม่" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | รายละเอียดปัญหา";
    fetchAll();
  }, [fetchAll]);

  const resetForm = () => {
    setFormTitle(""); setFormDetail(""); setFormStatus("");
    if (formObjectUrl) { URL.revokeObjectURL(formObjectUrl); setFormObjectUrl(""); }
    setFormImageFile(null); setFormImagePreview(""); setFormImageRemoved(false);
    setEditLog(null);
  };

  const openEdit = (log: IssueLog) => {
    setEditLog(log);
    setFormTitle(log.title);
    setFormDetail(log.detail || "");
    setFormStatus(log.status || "");
    setFormImageFile(null);
    setFormObjectUrl("");
    setFormExistingImageUrl(log.imageUrl || null);
    setFormImagePreview("");
    setFormImageRemoved(false);
    setShowPopup(true);
  };

  const handleLogImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (formObjectUrl) URL.revokeObjectURL(formObjectUrl);
    const url = URL.createObjectURL(file);
    setFormObjectUrl(url);
    setFormImageFile(file);
    setFormImagePreview(url);
    setFormImageRemoved(false);
  };

  const clearLogImage = () => {
    if (formObjectUrl) { URL.revokeObjectURL(formObjectUrl); setFormObjectUrl(""); }
    setFormImageFile(null);
    setFormImagePreview("");
    setFormExistingImageUrl(null);
    setFormImageRemoved(true);
    if (logFileRef.current) logFileRef.current.value = "";
  };

  const handleSaveLog = async () => {
    if (!formTitle.trim()) {
      Swal.fire({ icon: "warning", title: "กรุณากรอกหัวข้อ" });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", formTitle);
      if (formDetail) fd.append("detail", formDetail);
      if (formStatus) fd.append("status", formStatus);
      
      const targetVid = contextVillageId ?? issue?.villageId;
      if (targetVid)  fd.append("villageId", String(targetVid));

      if (editLog) {
        fd.append("id",      String(editLog.id));
        fd.append("issueId", String(editLog.issueId));
        if (formImageFile)         fd.append("file", formImageFile);
        else if (formImageRemoved) fd.append("removeImage", "true");
        await axios.post("/community-issue-logs/edit", fd);
      } else {
        fd.append("issueId", String(id));
        if (formImageFile) fd.append("file", formImageFile);
        await axios.post("/community-issue-logs/add", fd);
      }

      setShowPopup(false);
      resetForm();
      await fetchAll();
      Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1200, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: err?.response?.data?.message || err?.message || "กรุณาลองใหม่" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLog = async (logId: number) => {
    const result = await Swal.fire({
      icon: "warning", title: "ลบบันทึกนี้?",
      showCancelButton: true,
      confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/community-issue-logs/${logId}`);
      await fetchAll();
    } catch {
      Swal.fire({ icon: "error", title: "ลบไม่สำเร็จ" });
    }
  };

  // ── 🛠️ ปรับปรุงระบบประมวลผล FormData ตัวหลัก ป้องกันด่านตรวจ 403 ─────────
  const buildIssueFd = (img?: { file?: File; remove?: boolean }) => {
    if (!issue) return null;
    const fd = new FormData();
    fd.append("id",        String(issue.id));
    fd.append("area",      issue.area || "");
    fd.append("issueType", issue.issueType || "");
    fd.append("severity",  String(issue.severity ?? "3"));
    fd.append("status",    issue.status || "ยังไม่แก้");
    if (issue.householdId != null) fd.append("householdId",   String(issue.householdId));
    if (issue.owner)               fd.append("owner",         issue.owner);
    if (issue.impactPeople != null) fd.append("impactPeople", String(issue.impactPeople));
    if (issue.budgetEstimate != null) fd.append("budgetEstimate", String(issue.budgetEstimate));
    if (issue.dueDate)             fd.append("dueDate",       issue.dueDate);
    if (issue.remark)        fd.append("remark",        issue.remark);
    
    const finalVillageId = contextVillageId ?? issue.villageId;
    if (finalVillageId)      fd.append("villageId",     String(finalVillageId));
    
    if (img?.file)           fd.append("file",          img.file);
    if (img?.remove)         fd.append("removeImage",   "true");
    return fd;
  };

  const handleIssueImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !issue) return;
    try {
      const fd = buildIssueFd({ file });
      if (!fd) return;
      await axios.post("/community-issues/edit", fd);
      await fetchAll();
      Swal.fire({ icon: "success", title: "อัปโหลดรูปสำเร็จ", timer: 1200, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "อัปโหลดรูปไม่สำเร็จ", text: err?.response?.data?.message || err?.message || "กรุณาลองใหม่" });
    } finally {
      if (issueFileRef.current) issueFileRef.current.value = "";
    }
  };

  const handleDeleteIssueImage = async () => {
    const result = await Swal.fire({
      icon: "warning", title: "ลบรูปภาพประกอบปัญหา?",
      text: "การดำเนินการนี้จะไม่สามารถย้อนกลับได้",
      showCancelButton: true,
      confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      const fd = buildIssueFd({ remove: true });
      if (!fd) return;
      await axios.post("/community-issues/edit", fd);
      await fetchAll();
      Swal.fire({ icon: "success", title: "ลบรูปภาพสำเร็จ", timer: 1200, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "ลบรูปไม่สำเร็จ", text: err?.response?.data?.message || err?.message || "กรุณาลองใหม่" });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  if (!issue) return (
    <div className="text-center py-16 text-gray-400">ไม่พบข้อมูลปัญหานี้</div>
  );

  const sev   = SEVERITY_CONFIG[issue.severity] || { label: String(issue.severity), bg: "bg-gray-100", text: "text-gray-600" };
  const stCfg = STATUS_CONFIG[issue.status]     || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            กลับ
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">ปัญหา #{issue.id} — {issue.area || "-"}</h1>
        </div>
        <button onClick={() => setShowPopup(true)} className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          เพิ่ม Log
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:items-stretch">
        {/* Detail Card */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">Detail</h2>
          <div className="flex-1 space-y-3 text-sm">
            <div><span className="text-gray-400">ประเภทปัญหา</span><p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.issueType || "-"}</p></div>
            <div><span className="text-gray-400">พื้นที่</span><p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.area || "-"}</p></div>
            <div>
              <span className="text-gray-400">สถานะ</span>
              <div className="mt-0.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${stCfg.bg} ${stCfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot}`} />{issue.status || "-"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-400">ระดับความรุนแรง</span>
              <div className="mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${sev.bg} ${sev.text}`}>
                  {issue.severity} — {sev.label}
                </span>
              </div>
            </div>
            <div><span className="text-gray-400">ผู้รับผิดชอบ</span><p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.owner || "-"}</p></div>
            <div><span className="text-gray-400">ผลกระทบ (คน)</span><p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.impactPeople?.toLocaleString() || "-"}</p></div>
            <div>
              <span className="text-gray-400">งบประมาณ</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">
                {issue.budgetEstimate != null ? Number(issue.budgetEstimate).toLocaleString() + " บาท" : "-"}
              </p>
            </div>
            <div><span className="text-gray-400">กำหนดเสร็จ</span><p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.dueDate || "-"}</p></div>
            {issue.remark && (
              <div><span className="text-gray-400">หมายเหตุ</span><p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.remark}</p></div>
            )}

            {/* รูปภาพปัญหา */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-gray-400">รูปภาพ</span>
                <div className="flex items-center gap-2">
                  {issue.imageUrl && (
                    <button type="button" onClick={handleDeleteIssueImage} className="text-xs text-red-500 hover:text-red-700 font-medium">
                      ลบรูป
                    </button>
                  )}
                  <button type="button" onClick={() => issueFileRef.current?.click()} className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                    {issue.imageUrl ? "เปลี่ยนรูป" : "เพิ่มรูป"}
                  </button>
                </div>
              </div>
              {issue.imageUrl ? (
                <div className="block cursor-zoom-in">
                  <Base64Image src={issue.imageUrl} alt="รูปภาพปัญหา" className="w-full rounded-xl object-cover max-h-48 border border-gray-200 hover:opacity-90 transition-opacity" />
                </div>
              ) : (
                <div onClick={() => issueFileRef.current?.click()} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:border-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-300 mb-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <p className="text-xs text-gray-400">คลิกเพื่อเพิ่มรูปภาพ</p>
                </div>
              )}
              <input ref={issueFileRef} type="file" accept="image/*" className="hidden" onChange={handleIssueImageChange} />
            </div>
          </div>
        </div>

        {/* Log Cards */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {sortedLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center text-gray-400 text-sm">
              ยังไม่มีบันทึกความคืบหน้า — กด "เพิ่ม Log" เพื่อเริ่มบันทึก
            </div>
          ) : (
            sortedLogs.map((log) => {
              const logSt = log.status ? STATUS_CONFIG[log.status] : null;
              return (
                <div key={log.id} className="group rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                      {logSt && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${logSt.bg} ${logSt.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${logSt.dot}`} />{log.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(log)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" title="แก้ไข">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteLog(log.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="ลบ">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{log.title}</p>
                  {log.detail && <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{log.detail}</p>}
                  {log.imageUrl && (
                    <div className="block mt-3 cursor-zoom-in">
                      <Base64Image src={log.imageUrl} alt="รูปภาพบันทึก" className="rounded-xl object-cover max-h-48 w-auto border border-gray-200 hover:opacity-90 transition-opacity" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recommendations */}
      {recs && (recs.matchedPeople.length > 0 || recs.matchedResources.length > 0) && (
        <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20 p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤝</span>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white">แนะนำกำลังคนและทรัพยากรช่วยเหลือ</h2>
          </div>

          {/* Matched People */}
          {recs.matchedPeople.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                <span>👷</span> ช่างฝีมือและบุคคลที่มีทักษะตรงกัน ({recs.matchedPeople.length} คน)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recs.matchedPeople.map((p) => (
                  <div key={p.personId} className="rounded-xl border border-white/80 dark:border-white/10 bg-white dark:bg-gray-900/60 shadow-sm p-4 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm text-gray-800 dark:text-white leading-snug">{p.fullName.trim() || "—"}</span>
                      {p.skillLevel && (
                        <span className="flex-shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium">
                          {p.skillLevel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      <span>🔧</span>
                      <span>{p.matchedSkill}</span>
                    </div>
                    {p.occupation && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">อาชีพ: {p.occupation}</p>
                    )}
                    <div className="text-xs text-gray-400 dark:text-gray-500 flex flex-wrap gap-x-3">
                      {p.age != null && <span>อายุ {p.age} ปี</span>}
                      {p.houseNo && (
                        <a href={p.householdId ? `/household/detail?id=${p.householdId}` : undefined}
                          className="text-blue-400 hover:text-blue-600 hover:underline">
                          บ้านเลขที่ {p.houseNo}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Resources */}
          {recs.matchedResources.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                <span>📦</span> ทรัพยากรชุมชนที่พร้อมใช้งาน ({recs.matchedResources.length} รายการ)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recs.matchedResources.map((r) => (
                  <div key={r.resourceId} className="rounded-xl border border-white/80 dark:border-white/10 bg-white dark:bg-gray-900/60 shadow-sm p-4 flex flex-col gap-1">
                    <span className="font-semibold text-sm text-gray-800 dark:text-white">{r.resourceName || "—"}</span>
                    {r.resourceType && (
                      <span className="text-[11px] w-fit px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-medium">
                        {r.resourceType}
                      </span>
                    )}
                    {r.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{r.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full w-9 h-9 flex items-center justify-center text-xl" onClick={() => setLightboxUrl(null)}>✕</button>
          <img src={lightboxUrl} alt="รูปขยาย" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Popup: เพิ่ม/แก้ไข Log */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {editLog ? "แก้ไขบันทึก" : "เพิ่มบันทึกความคืบหน้า"}
              </h3>
              <button onClick={() => { setShowPopup(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">หัวข้อ <span className="text-red-500">*</span></label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เช่น รับเรื่องแล้ว, ประชุมหาแนวทาง..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">อัปเดตสถานะ (ถ้ามี)</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none">
                  <option value="">ไม่เปลี่ยนสถานะ</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รายละเอียด</label>
                <textarea rows={3} value={formDetail} onChange={(e) => setFormDetail(e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รูปภาพ (ถ้ามี)</label>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => logFileRef.current?.click()}>
                  {(formImagePreview || formExistingImgSrc) ? (
                    <div className="relative w-full">
                      <img src={formImagePreview || formExistingImgSrc} alt="preview" className="w-full rounded-lg object-contain max-h-36" />
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); clearLogImage(); }}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">X</button>
                      {formImageFile && (
                        <p className="mt-1 text-center text-xs text-gray-400">{formImageFile.name} ({(formImageFile.size / 1024).toFixed(0)} KB)</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 mx-auto mb-1 opacity-50">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      คลิกเพื่อเลือกรูปภาพ
                    </div>
                  )}
                </div>
                <input ref={logFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogImageChange} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => { setShowPopup(false); resetForm(); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleSaveLog} disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityIssueDetailPage() {
  return (
    <PermissionGuard menuUrl="/communityissue">
      <Suspense>
        <CommunityIssueDetailPageContent />
      </Suspense>
    </PermissionGuard>
  );
}
