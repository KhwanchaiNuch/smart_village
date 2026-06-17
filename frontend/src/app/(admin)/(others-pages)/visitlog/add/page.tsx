"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import DatePicker from '@/components/form/date-picker';
import { useEffect, useState } from "react";
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
		document.title = "Smart Village | Visit Log Add";
		if (!loaded) return;
		const vid = village?.villageId;
		Promise.all([
			axios.get<Person[]>(vid ? `/persons?villageId=${vid}` : "/persons"),
			axios.get<Household[]>(vid ? `/households?villageId=${vid}` : "/households"),
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
		// householdId optional — auto-fill จากบุคคลที่เลือก
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
			window.location.href = "/visitlog";
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>บุคคลที่เยี่ยม <span className="text-red-500">*</span></Label>
						<select
							name="personId"
							value={form.personId}
							onChange={handleChange}
							className={selectClass("personId")}
						>
							<option value="">-- เลือกบุคคล --</option>
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
							className={selectClass("householdId")}
						>
							<option value="">-- ไม่ระบุ --</option>
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

				<div>
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

				<div>
					<Label>สรุปผลการเยี่ยม</Label>
					<TextArea
						value={form.summary}
						onChange={handleSummaryChange}
						rows={2}
					/>
				</div>

				<div>
					<Label>การดำเนินการต่อ</Label>
					<TextArea
						value={form.nextAction}
						onChange={handleNextActionChange}
						rows={2}
					/>
				</div>

				<div className="flex gap-3 mt-4">
					<button
						onClick={handleSubmit}
						disabled={saving}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{saving ? "กำลังบันทึก..." : "บันทึก"}
					</button>
					<a
						href="/visitlog"
						className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						ยกเลิก
					</a>
				</div>
			</ComponentCard>
		</>
	</PermissionGuard>
	);
}
