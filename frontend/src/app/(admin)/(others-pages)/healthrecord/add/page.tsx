"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Radio from '@/components/form/input/Radio';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import DatePicker from '@/components/form/date-picker';
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";

interface Person {
	personId: number;
	firstName: string;
	lastName: string;
	occupation: string;
}

type FormErrors = Partial<Record<string, string>>;

export default function HealthRecordAdd() {
	const { village, loaded } = useVillage();
	const [persons, setPersons] = useState<Person[]>([]);
	const [errors, setErrors] = useState<FormErrors>({});
	const [saving, setSaving] = useState(false);

	const [form, setForm] = useState({
		personId: "",
		checkDate: "",
		bp: "",
		sugar: "",
		bmi: "",
		riskGroup: "",
		needHomeVisit: true,
		remark: "",
	});

	useEffect(() => {
		document.title = "Smart Village | Health Record Add";
		if (!loaded) return;
		const vid = village?.villageId;
		axios.get<Person[]>(vid ? `/persons?villageId=${vid}` : "/persons")
			.then((res) => setPersons(res.data))
			.catch((err) => console.error(err));
	}, [loaded, village]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleRadioNeedHomeVisitChange = (value: string) => {
		setForm((prev) => ({ ...prev, needHomeVisit: value === "true" }));
	};

	const handleTextAreaChange = (value: string) => {
		setForm((prev) => ({ ...prev, remark: value }));
	};

	const validate = (): boolean => {
		const newErrors: FormErrors = {};
		if (!form.personId) newErrors.personId = "กรุณาเลือกบุคคล";
		if (!form.checkDate) newErrors.checkDate = "กรุณาระบุวันที่ตรวจ";
		if (!form.bp.trim()) newErrors.bp = "กรุณาระบุค่าความดันโลหิต";
		if (!form.sugar.toString().trim()) newErrors.sugar = "กรุณาระบุค่าน้ำตาลในเลือด";
		if (!form.bmi.toString().trim()) newErrors.bmi = "กรุณาระบุค่า BMI";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;
		setSaving(true);
		try {
			const payload = {
				personId: parseInt(form.personId),
				checkDate: form.checkDate,
				bp: form.bp,
				sugar: form.sugar ? parseFloat(form.sugar) : null,
				bmi: form.bmi ? parseFloat(form.bmi) : null,
				riskGroup: form.riskGroup || null,
				needHomeVisit: form.needHomeVisit,
				remark: form.remark || null,
			};
			await axios.post("/health-records/add", payload);
			await Swal.fire({
				icon: "success",
				title: "บันทึกสำเร็จ",
				text: "เพิ่มข้อมูลสุขภาพเรียบร้อยแล้ว",
				timer: 1800,
				showConfirmButton: false,
			});
			window.location.href = "/healthrecord";
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
		<>
			<ComponentCard title="เพิ่มข้อมูลสุขภาพเชิงตัวเลข (Add Health Record)">

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>บุคคล <span className="text-red-500">*</span></Label>
						<select
							name="personId"
							value={form.personId}
							onChange={handleChange}
							className={selectClass("personId")}
						>
							<option value="">-- เลือกบุคคล --</option>
							{persons.map((p) => (
								<option key={p.personId} value={p.personId}>
									{p.firstName} {p.lastName}{p.occupation ? ` (${p.occupation})` : ""}
								</option>
							))}
						</select>
						{errors.personId && <p className="mt-1 text-xs text-red-500">{errors.personId}</p>}
					</div>

					<div>
						<Label>วันที่ตรวจ <span className="text-red-500">*</span></Label>
						<DatePicker
							id="checkDate"
							placeholder="เลือกวันที่ตรวจ"
							onChange={(_, dateStr) => {
								setForm((prev) => ({ ...prev, checkDate: dateStr }));
								if (errors.checkDate) setErrors((prev) => ({ ...prev, checkDate: "" }));
							}}
						/>
						{errors.checkDate && <p className="mt-1 text-xs text-red-500">{errors.checkDate}</p>}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>ความดันโลหิต <span className="text-red-500">*</span></Label>
						<Input
							name="bp"
							value={form.bp}
							onChange={handleChange}
							type="text"
							placeholder="เช่น 120/80"
							className={errors.bp ? "border-red-400" : ""}
						/>
						{errors.bp && <p className="mt-1 text-xs text-red-500">{errors.bp}</p>}
					</div>

					<div>
						<Label>น้ำตาลในเลือด (mg/dL) <span className="text-red-500">*</span></Label>
						<Input
							name="sugar"
							value={form.sugar}
							onChange={handleChange}
							type="text"
							placeholder="เช่น 95.5"
							className={errors.sugar ? "border-red-400" : ""}
						/>
						{errors.sugar && <p className="mt-1 text-xs text-red-500">{errors.sugar}</p>}
					</div>

					<div>
						<Label>ดัชนีมวลกาย (BMI) <span className="text-red-500">*</span></Label>
						<Input
							name="bmi"
							value={form.bmi}
							onChange={handleChange}
							type="text"
							placeholder="เช่น 22.5"
							className={errors.bmi ? "border-red-400" : ""}
						/>
						{errors.bmi && <p className="mt-1 text-xs text-red-500">{errors.bmi}</p>}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>กลุ่มเสี่ยง</Label>
						<Input
							name="riskGroup"
							value={form.riskGroup}
							onChange={handleChange}
							type="text"
							placeholder="เช่น กลุ่มเสี่ยงสูง"
						/>
					</div>

					<ComponentCard title="ต้องการเยี่ยมบ้านหรือไม่">
						<div className="flex gap-6">
							<Radio
								id="visit-yes"
								name="needHomeVisit"
								value="true"
								checked={form.needHomeVisit === true}
								onChange={handleRadioNeedHomeVisitChange}
								label="ต้องการ ( Yes )"
							/>
							<Radio
								id="visit-no"
								name="needHomeVisit"
								value="false"
								checked={form.needHomeVisit === false}
								onChange={handleRadioNeedHomeVisitChange}
								label="ไม่ต้องการ ( No )"
							/>
						</div>
					</ComponentCard>
				</div>

				<div>
					<Label>หมายเหตุ</Label>
					<TextArea
						value={form.remark}
						onChange={handleTextAreaChange}
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
						href="/healthrecord"
						className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						ยกเลิก
					</a>
				</div>
			</ComponentCard>
		</>
	);
}
