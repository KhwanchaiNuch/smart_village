"use client"
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

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
  createdAt: string | null;
}

interface IssueLog {
  id: number;
  issueId: number;
  title: string;
  detail: string | null;
  status: string | null;
  createdAt: string | null;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  "ยังไม่แก้": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  "กำลังทำ":   { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  "แก้แล้ว":   { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
};

const SEVERITY_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: "น้อยมาก", bg: "bg-green-100",  text: "text-green-700" },
  2: { label: "น้อย",    bg: "bg-lime-100",   text: "text-lime-700" },
  3: { label: "ปานกลาง", bg: "bg-yellow-100", text: "text-yellow-700" },
  4: { label: "มาก",     bg: "bg-red-100",    text: "text-red-700" },
  5: { label: "วิกฤต",   bg: "bg-purple-100", text: "text-purple-700" },
};

const STATUS_OPTIONS = ["ยังไม่แก้", "กำลังทำ", "แก้แล้ว"];

const LOG_TIMELINE_COLORS = [
  { border: "border-l-blue-500",   bg: "bg-white dark:bg-gray-800",  dot: "bg-blue-500"   },
  { border: "border-l-green-500",  bg: "bg-white dark:bg-gray-800",  dot: "bg-green-500"  },
  { border: "border-l-orange-500", bg: "bg-white dark:bg-gray-800",  dot: "bg-orange-500" },
  { border: "border-l-purple-500", bg: "bg-white dark:bg-gray-800",  dot: "bg-purple-500" },
  { border: "border-l-pink-500",   bg: "bg-white dark:bg-gray-800",  dot: "bg-pink-500"   },
];

function formatDate(dt: string | null): string {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CommunityIssueDetailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  const [issue, setIssue] = useState<CommunityIssue | null>(null);
  const [logs, setLogs] = useState<IssueLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [editLog, setEditLog] = useState<IssueLog | null>(null);

  // popup form state
  const [formTitle, setFormTitle]   = useState("");
  const [formDetail, setFormDetail] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    try {
      const [issueRes, logRes] = await Promise.all([
        axios.get<CommunityIssue>(`/community-issues/${id}`),
        axios.get<IssueLog[]>(`/community-issue-logs?issueId=${id}`),
      ]);
      setIssue(issueRes.data);
      setLogs(logRes.data);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message || "กรุณาลองใหม่" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    document.title = "Smart Village | รายละเอียดปัญหา";
    fetchAll();
  }, [fetchAll]);

  const resetForm = () => {
    setFormTitle(""); setFormDetail(""); setFormStatus("");
    setEditLog(null);
  };

  const openEdit = (log: IssueLog) => {
    setEditLog(log);
    setFormTitle(log.title);
    setFormDetail(log.detail || "");
    setFormStatus(log.status || "");
    setShowPopup(true);
  };

  const handleSaveLog = async () => {
    if (!formTitle.trim()) {
      Swal.fire({ icon: "warning", title: "กรุณากรอกหัวข้อ" });
      return;
    }
    setSaving(true);
    try {
      if (editLog) {
        await axios.post("/community-issue-logs/edit", {
          id: editLog.id,
          issueId: editLog.issueId,
          title: formTitle,
          detail: formDetail || null,
          status: formStatus || null,
        });
      } else {
        await axios.post("/community-issue-logs/add", {
          issueId: Number(id),
          title: formTitle,
          detail: formDetail || null,
          status: formStatus || null,
        });
      }
      setShowPopup(false);
      resetForm();
      await fetchAll();
      Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1200, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: err?.response?.data?.message || "กรุณาลองใหม่" });
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  if (!issue) return (
    <div className="text-center py-16 text-gray-400">ไม่พบข้อมูลปัญหานี้</div>
  );

  const sev = SEVERITY_CONFIG[issue.severity] || { label: String(issue.severity), bg: "bg-gray-100", text: "text-gray-600" };
  const stCfg = STATUS_CONFIG[issue.status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            กลับ
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            ปัญหา #{issue.id} — {issue.area || "-"}
          </h1>
        </div>
        <button
          onClick={() => setShowPopup(true)}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          เพิ่ม Log
        </button>
      </div>

      {/* ── Body: 2 คอลัมน์บน lg, single column บน mobile ── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:items-stretch">

        {/* ── Detail Card (ซ้าย) ── */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">Detail</h2>
          <div className="flex-1 space-y-3 text-sm">
            <div>
              <span className="text-gray-400">ประเภทปัญหา</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.issueType || "-"}</p>
            </div>
            <div>
              <span className="text-gray-400">พื้นที่</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.area || "-"}</p>
            </div>
            <div>
              <span className="text-gray-400">สถานะ</span>
              <div className="mt-0.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${stCfg.bg} ${stCfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot}`} />
                  {issue.status || "-"}
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
            <div>
              <span className="text-gray-400">ผู้รับผิดชอบ</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.owner || "-"}</p>
            </div>
            <div>
              <span className="text-gray-400">ผลกระทบ (คน)</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.impactPeople?.toLocaleString() || "-"}</p>
            </div>
            <div>
              <span className="text-gray-400">งบประมาณ</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">
                {issue.budgetEstimate != null ? Number(issue.budgetEstimate).toLocaleString() + " บาท" : "-"}
              </p>
            </div>
            <div>
              <span className="text-gray-400">กำหนดเสร็จ</span>
              <p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.dueDate || "-"}</p>
            </div>
            {issue.remark && (
              <div>
                <span className="text-gray-400">หมายเหตุ</span>
                <p className="font-medium text-gray-800 dark:text-white mt-0.5">{issue.remark}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Log Cards (ขวา) ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center text-gray-400 text-sm">
              ยังไม่มีบันทึกความคืบหน้า — กด "เพิ่ม Log" เพื่อเริ่มบันทึก
            </div>
          ) : (
            [...logs]
              .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
              .map((log) => {
                const logSt = log.status ? STATUS_CONFIG[log.status] : null;
                return (
                  <div key={log.id} className="group rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                        {logSt && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${logSt.bg} ${logSt.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${logSt.dot}`} />
                            {log.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(log)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" title="แก้ไข">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteLog(log.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="ลบ">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{log.title}</p>
                    {log.detail && (
                      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{log.detail}</p>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* ── Popup: เพิ่ม/แก้ไข Log ── */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {editLog ? "แก้ไขบันทึก" : "เพิ่มบันทึกความคืบหน้า"}
              </h3>
              <button onClick={() => { setShowPopup(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* หัวข้อ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  หัวข้อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เช่น รับเรื่องแล้ว, ประชุมหาแนวทาง..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* สถานะ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  อัปเดตสถานะ (ถ้ามี)
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">— ไม่เปลี่ยนสถานะ —</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* รายละเอียด */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รายละเอียด</label>
                <textarea
                  rows={4}
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => { setShowPopup(false); resetForm(); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveLog}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
