"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import DatePicker from '@/components/form/date-picker';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 👈 1. Import useRouter เพิ่มเข้ามา
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";
import PermissionGuard from "@/components/common/PermissionGuard";

interface Person {
    personId: number;
    firstName: string;
    lastName: string;
    householdId?: number | null;
}

interface Household {
    householdId: number;
    houseNo: string;
}

type FormErrors = Partial<Record<string, string>>;

export default function VisitLogAdd() {
    const router = useRouter(); // 👈 2. ประกาศเรียกใช้งาน router
    const { village, loaded } = useVillage();
    const [persons, setPersons] = useState<Person[]>([]);
    const [households, setHouseholds] = useState<Household[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        personId: "",
        householdId: "",
        visitDate: "",
        visitor: "",
        visitReason: "",
        summary: "",
        nextAction: "",
    });

    useEffect(() => {
        document.title = "หมู่บ้านดิจิตอล | Visit Log Add";
        if (!loaded) return;
        const vid = village?.villageId;

        // 🛠️ ถ้ายังไม่มีการเลือกหมู่บ้าน ให้เคลียร์ข้อมูลรอไว้ ไม่ให้ดึงข้ามหมู่บ้านทั้งหมด
        if (!vid) {
            setPersons([]);
            setHouseholds([]);
            return;
        }

        Promise.all([
            axios.get<Person[]>(`/persons?villageId=${vid}`),
            axios.get<Household[]>(`/households?villageId=${vid}`),
        ])
            .then(([personsRes, householdsRes]) => {
                setPersons(personsRes.data);
                setHouseholds(householdsRes.data);
            })
            .catch((err) => console.error(err));
    }, [loaded, village]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const updated = { ...prev, [name]: value };
            // auto-fill household เมื่อเลือกบุคคล
            if (name === "personId" && value) {
                const person = persons.find((p) => String(p.personId) === value);
                updated.householdId = person?.householdId ? String(person.householdId) : "";
            }
            return updated;
        });
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSummaryChange = (value: string) => {
        setForm((prev) => ({ ...prev, summary: value }));
    };

    const handleNextActionChange = (value: string) => {
        setForm((prev) => ({ ...prev, nextAction: value }));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!form.personId) newErrors.personId = "กรุณาเลือกบุคคล";
        if (!form.visitDate) newErrors.visitDate = "กรุณาระบุวันที่เยี่ยม";
        if (!form.visitor.trim()) newErrors.visitor = "กรุณาระบุชื่อผู้เยี่ยม";
        if (!form.visitReason.trim()) newErrors.visitReason = "กรุณาระบุวัตถุประสงค์การเยี่ยม";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = {
                personId: parseInt(form.personId),
                householdId: form.householdId ? parseInt(form.householdId) : null,
                visitDate: form.visitDate,
                visitor: form.visitor,
                visitReason: form.visitReason,
                summary: form.summary || null,
                nextAction: form.nextAction || null,
            };
            await axios.post("/visit-logs/add", payload);
            await Swal.fire({
                icon: "success",
                title: "บันทึกสำเร็จ",
                text: "เพิ่มบันทึกการเยี่ยมบ้านเรียบร้อยแล้ว",
                timer: 1800,
                showConfirmButton: false,
            });
            
            // 👈 3. เปลี่ยนจาก window.location.href มาใช้ router.push เพื่อรักษา Context ของหมู่บ้านเอาไว้
            router.push("/visitlog");
        } catch (err: any) {
            console.error("บันทึกล้มเหลว:", err);
            Swal.fire({
                icon: "error",
                title: "บันทึกไม่สำเร็จ",
                text: err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setSaving(false);
        }
    };

    const selectClass = (field: string) =>
        `mt-1 w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 dark:text-gray-300 ${
            errors[field]
                ? "border-red-400 focus:border-red-400 focus:ring-red-400 text-red-700"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-700 dark:border-gray-600"
        }`;

    return (
        <PermissionGuard menuUrl="/visitlog" action="add">
        <>
            <ComponentCard title="เพิ่มบันทึกการเยี่ยมบ้าน (Add Visit Log)">

                {/* 🛠️ เพิ่มชุดแบนเนอร์ล็อกแจ้งเตือนหมู่บ้านปัจจุบัน */}
                {village && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10 px-4 py-2.5 text-xs text-blue-700 dark:text-blue-300 font-medium">
                        📍 กำลังบันทึกการเยี่ยมบ้านของหมู่บ้าน: <strong>{village.villageName} {village.moo ? `(หมู่ ${village.moo})` : ""}</strong>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>บุคคลที่เยี่ยม <span className="text-red-500">*</span></Label>
                        <select
                            name="personId"
                            value={form.personId}
                            onChange={handleChange}
                            disabled={!village}
                            className={selectClass("personId")}
                        >
                            {!village ? (
                                <option value="">-- กรุณาเลือกหมู่บ้านที่เมนูด้านบนก่อน --</option>
                            ) : persons.length === 0 ? (
                                <option value="">-- ไม่พบรายชื่อบุคคลในหมู่บ้านนี้ --</option>
                            ) : (
                                <option value="">-- เลือกบุคคล ({persons.length} คน) --</option>
                            )}
                            {persons.map((p) => (
                                <option key={p.personId} value={p.personId}>
                                    {p.firstName} {p.lastName}
                                </option>
                            ))}
                        </select>
                        {errors.personId && <p className="mt-1 text-xs text-red-500">{errors.personId}</p>}
                    </div>

                    <div>
                        <Label>ครัวเรือนที่เยี่ยม</Label>
                        <select
                            name="householdId"
                            value={form.householdId}
                            onChange={handleChange}
                            disabled={!village}
                            className={selectClass("householdId")}
                        >
                            {!village ? (
                                <option value="">-- กรุณาเลือกหมู่บ้านก่อน --</option>
                            ) : households.length === 0 ? (
                                <option value="">-- ไม่พบข้อมูลครัวเรือนในหมู่บ้านนี้ --</option>
                            ) : (
                                <option value="">-- ไม่ระบุ / เลือกครัวเรือน --</option>
                            )}
                            {households.map((h) => (
                                <option key={h.householdId} value={h.householdId}>
                                    บ้านเลขที่ {h.houseNo}
                                </option>
                            ))}
                        </select>
                        {form.personId && form.householdId && (
                            <p className="mt-1 text-xs text-blue-500">กำหนดอัตโนมัติจากบุคคลที่เลือก</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <Label>วันที่เยี่ยม <span className="text-red-500">*</span></Label>
                        <DatePicker
                            id="visitDate"
                            placeholder="เลือกวันที่เยี่ยม"
                            onChange={(_, dateStr) => {
                                setForm((prev) => ({ ...prev, visitDate: dateStr }));
                                if (errors.visitDate) setErrors((prev) => ({ ...prev, visitDate: "" }));
                            }}
                        />
                        {errors.visitDate && <p className="mt-1 text-xs text-red-500">{errors.visitDate}</p>}
                    </div>

                    <div>
                        <Label>ผู้เยี่ยม <span className="text-red-500">*</span></Label>
                        <Input
                            name="visitor"
                            value={form.visitor}
                            onChange={handleChange}
                            type="text"
                            placeholder="ชื่อ-นามสกุลผู้เยี่ยม"
                            className={errors.visitor ? "border-red-400" : ""}
                        />
                        {errors.visitor && <p className="mt-1 text-xs text-red-500">{errors.visitor}</p>}
                    </div>
                </div>

                <div className="mt-4">
                    <Label>วัตถุประสงค์การเยี่ยม <span className="text-red-500">*</span></Label>
                    <Input
                        name="visitReason"
                        value={form.visitReason}
                        onChange={handleChange}
                        type="text"
                        placeholder="ระบุวัตถุประสงค์การเยี่ยมบ้าน"
                        className={errors.visitReason ? "border-red-400" : ""}
                    />
                    {errors.visitReason && <p className="mt-1 text-xs text-red-500">{errors.visitReason}</p>}
                </div>

                <div className="mt-4">
                    <Label>สรุปผลการเยี่ยม</Label>
                    <TextArea
                        value={form.summary}
                        onChange={handleSummaryChange}
                        rows={2}
                    />
                </div>

                <div className="mt-4">
                    <Label>การดำเนินการต่อ</Label>
                    <TextArea
                        value={form.nextAction}
                        onChange={handleNextActionChange}
                        rows={2}
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                    {/* 🛠️ 4. เปลี่ยนปุ่มยกเลิกจากแท็ก <a> มาเป็น button ที่คุมด้วย router.push */}
                    <button
                        type="button"
                        onClick={() => router.push("/visitlog")}
                        className="px-5 py-2.5 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
                    >
                        ยกเลิก
                    </button>
                </div>
            </ComponentCard>
        </>
        </PermissionGuard>
    );
}