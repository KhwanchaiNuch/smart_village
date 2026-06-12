"use client"
import ComponentCard from "@/components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

interface TrainingEvent {
  id: number;
  trainingName: string;
  trainingType: string;
  organizer: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

interface Person {
  personId: number;
  firstName: string;
  lastName: string;
  occupation: string;
}

interface Participant {
  id: number;
  trainingId: number;
  personId: number;
  attendStatus: string;
  afterStatus: string;
  afterProblem: string;
}

const ATTEND_STATUSES = ["เข้าร่วม", "ไม่มา", "ยกเลิก"];
const AFTER_STATUSES = ["ทำจริง", "ยังไม่ทำ", "ติดปัญหา", "-"];

const attendColor = (s: string) => {
  if (s === "เข้าร่วม") return "bg-green-100 text-green-700";
  if (s === "ไม่มา") return "bg-red-100 text-red-700";
  if (s === "ยกเลิก") return "bg-gray-100 text-gray-600";
  return "bg-gray-100 text-gray-500";
};

const afterColor = (s: string) => {
  if (s === "ทำจริง") return "bg-blue-100 text-blue-700";
  if (s === "ยังไม่ทำ") return "bg-yellow-100 text-yellow-700";
  if (s === "ติดปัญหา") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-500";
};

function TrainingDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [event, setEvent] = useState<TrainingEvent | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [personMap, setPersonMap] = useState<Map<number, Person>>(new Map());

  // form เพิ่มผู้เข้าร่วม
  const [addPersonId, setAddPersonId] = useState("");
  const [addAttendStatus, setAddAttendStatus] = useState("เข้าร่วม");
  const [adding, setAdding] = useState(false);

  // inline edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAttend, setEditAttend] = useState("");
  const [editAfterStatus, setEditAfterStatus] = useState("");
  const [editAfterProblem, setEditAfterProblem] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchParticipants = useCallback(async () => {
    if (!id) return;
    const res = await axios.get<Participant[]>(`/training-participants/by-training/${id}`);
    setParticipants(res.data);
  }, [id]);

  useEffect(() => {
    document.title = "Smart Village | Training Detail";
    if (!id) return;
    Promise.all([
      axios.get<TrainingEvent>(`/training-events/${id}`),
      axios.get<Person[]>("/persons"),
      axios.get<Participant[]>(`/training-participants/by-training/${id}`),
    ])
      .then(([evRes, personsRes, partRes]) => {
        setEvent(evRes.data);
        setPersons(personsRes.data);
        setParticipants(partRes.data);
        const map = new Map<number, Person>();
        personsRes.data.forEach((p) => map.set(p.personId, p));
        setPersonMap(map);
      })
      .catch((err: any) => Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message }));
  }, [id, fetchParticipants]);

  // บุคคลที่ยังไม่ได้เพิ่ม
  const enrolledPersonIds = new Set(participants.map((p) => p.personId));
  const availablePersons = persons.filter((p) => !enrolledPersonIds.has(p.personId));

  const handleAddParticipant = async () => {
    if (!addPersonId) {
      Swal.fire({ icon: "warning", title: "กรุณาเลือกบุคคล" });
      return;
    }
    setAdding(true);
    try {
      await axios.post("/training-participants/add", {
        trainingId: parseInt(id!),
        personId: parseInt(addPersonId),
        attendStatus: addAttendStatus,
        afterStatus: null,
        afterProblem: null,
      });
      setAddPersonId("");
      setAddAttendStatus("เข้าร่วม");
      await fetchParticipants();
      Swal.fire({ icon: "success", title: "เพิ่มผู้เข้าร่วมสำเร็จ", timer: 1200, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "เพิ่มไม่สำเร็จ", text: err?.response?.data?.message });
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditAttend(p.attendStatus || "เข้าร่วม");
    setEditAfterStatus(p.afterStatus || "-");
    setEditAfterProblem(p.afterProblem || "");
  };

  const handleSaveEdit = async (p: Participant) => {
    setSaving(true);
    try {
      await axios.post("/training-participants/edit", {
        id: p.id,
        trainingId: p.trainingId,
        personId: p.personId,
        attendStatus: editAttend,
        afterStatus: editAfterStatus === "-" ? null : editAfterStatus,
        afterProblem: editAfterProblem || null,
      });
      setEditingId(null);
      await fetchParticipants();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: err?.response?.data?.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteParticipant = async (p: Participant) => {
    const person = personMap.get(p.personId);
    const name = person ? `${person.firstName} ${person.lastName}` : `ID ${p.personId}`;
    const result = await Swal.fire({
      icon: "warning",
      title: "ลบผู้เข้าร่วม?",
      text: `ลบ "${name}" ออกจากโครงการนี้`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/training-participants/${p.id}`);
      await fetchParticipants();
    } catch {
      Swal.fire({ icon: "error", title: "ลบไม่สำเร็จ" });
    }
  };

  const selectCls = "rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200";

  if (!event) return <div className="p-8 text-center text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      {/* ── Event Info ── */}
      <ComponentCard title="">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">📋 {event.trainingName}</h3>
          <a href={`/training/edit?id=${event.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-yellow-500 bg-yellow-500 text-white text-sm hover:bg-yellow-600">
            <svg className="fill-current" width="14" height="14" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
            </svg>
            แก้ไขข้อมูลอบรม
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-400">หมวด:</span> <span className="font-medium text-gray-700 dark:text-gray-200">{event.trainingType || "-"}</span></div>
          <div><span className="text-gray-400">หน่วยจัด:</span> <span className="font-medium text-gray-700 dark:text-gray-200">{event.organizer || "-"}</span></div>
          <div><span className="text-gray-400">วันที่:</span> <span className="font-medium text-gray-700 dark:text-gray-200">{event.startDate || "-"}{event.endDate ? ` – ${event.endDate}` : ""}</span></div>
          <div><span className="text-gray-400">สถานที่:</span> <span className="font-medium text-gray-700 dark:text-gray-200">{event.location || "-"}</span></div>
        </div>
        {event.description && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            {event.description}
          </p>
        )}
        <div className="mt-2">
          <a href="/training" className="text-sm text-blue-600 hover:underline">← กลับหน้ารายการ</a>
        </div>
      </ComponentCard>

      {/* ── Participant Management ── */}
      <ComponentCard title="">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            👥 ผู้เข้าร่วมอบรม
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              {participants.length} คน
            </span>
          </h3>
        </div>

        {/* Add participant row */}
        <div className="flex flex-wrap items-end gap-3 mb-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">เลือกบุคคล</label>
            <select
              value={addPersonId}
              onChange={(e) => setAddPersonId(e.target.value)}
              className={selectCls + " w-full"}
            >
              <option value="">-- เลือกบุคคล --</option>
              {availablePersons.map((p) => (
                <option key={p.personId} value={p.personId}>
                  {p.firstName} {p.lastName}{p.occupation ? ` (${p.occupation})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">สถานะการเข้าร่วม</label>
            <select value={addAttendStatus} onChange={(e) => setAddAttendStatus(e.target.value)} className={selectCls}>
              {ATTEND_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={handleAddParticipant}
            disabled={adding}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {adding ? "กำลังเพิ่ม..." : "เพิ่มผู้เข้าร่วม"}
          </button>
        </div>

        {/* Participant table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">ชื่อ-นามสกุล</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs">สถานะการเข้าร่วม</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs">สถานะหลังอบรม</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs">ปัญหาหลังอบรม</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {participants.map((p) => {
                    const person = personMap.get(p.personId);
                    const isEditing = editingId === p.id;
                    return (
                      <TableRow key={p.id} className={isEditing ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                        <TableCell className="px-4 py-3 text-gray-800 dark:text-white font-medium text-theme-sm">
                          {person ? `${person.firstName} ${person.lastName}` : `ID ${p.personId}`}
                          {person?.occupation && <span className="text-gray-400 text-xs ml-1">({person.occupation})</span>}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          {isEditing ? (
                            <select value={editAttend} onChange={(e) => setEditAttend(e.target.value)} className={selectCls}>
                              {ATTEND_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          ) : (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${attendColor(p.attendStatus)}`}>
                              {p.attendStatus || "-"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          {isEditing ? (
                            <select value={editAfterStatus} onChange={(e) => setEditAfterStatus(e.target.value)} className={selectCls}>
                              {AFTER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          ) : (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${afterColor(p.afterStatus)}`}>
                              {p.afterStatus || "-"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm">
                          {isEditing ? (
                            <input
                              value={editAfterProblem}
                              onChange={(e) => setEditAfterProblem(e.target.value)}
                              placeholder="ระบุปัญหา..."
                              className={selectCls + " w-full"}
                            />
                          ) : (
                            p.afterProblem || "-"
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleSaveEdit(p)}
                                disabled={saving}
                                className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                              >
                                บันทึก
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => startEdit(p)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600"
                              >
                                <svg className="fill-current" width="14" height="14" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteParticipant(p)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500 bg-red-500 text-white hover:bg-red-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {participants.length === 0 && (
                    <TableRow>
                      <TableCell className="px-4 py-8 text-center text-gray-400 text-theme-sm">
                        ยังไม่มีผู้เข้าร่วมอบรม — เพิ่มได้จากด้านบน
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}

export default function TrainingDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrainingDetailContent />
    </Suspense>
  );
}
