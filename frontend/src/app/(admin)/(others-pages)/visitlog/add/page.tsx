"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import DatePicker from '@/components/form/date-picker';
import { useEffect, useState } from "react"
const axios = require('axios');

interface Person {
	personId: number;
	firstName: string;
	lastName: string;
}

interface Household {
	householdId: number;
	houseNo: string;
}

type FormErrors = Partial<Record<string, string>>;

export default function VisitLogAdd() {

	const [persons, setPersons] = useState<Person[]>([]);
	const [households, setHouseholds] = useState<Household[]>([]);
	const [errors, setErrors] = useState<FormErrors>({});

	const [form, setForm] = useState({
		personId: "",
		householdId: "",
		visitDate: "",
		visitor: "",
		visitReason: "",
		summary: "",
		nextAction: "",
	})

	useEffect(() => {
		document.title = "Smart Village | Visit Log Add"
		async function fetchDropdowns() {
			try {
				const token = localStorage.getItem("token")
				const headers = { "Authorization": `Bearer ${token}` }
				const [personsRes, householdsRes] = await Promise.all([
					axios.request({ method: 'get', maxBodyLength: Infinity, url: 'http://43.229.149.138:8080/smart_village/api/persons', headers }),
					axios.request({ method: 'get', maxBodyLength: Infinity, url: 'http://43.229.149.138:8080/smart_village/api/households', headers }),
				])
				setPersons(personsRes.data)
				setHouseholds(householdsRes.data)
			} catch (err) {
				console.error(err)
			}
		}
		fetchDropdowns()
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
		if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
	}

	const handleSummaryChange = (value: string) => {
		setForm(prev => ({ ...prev, summary: value }))
	}

	const handleNextActionChange = (value: string) => {
		setForm(prev => ({ ...prev, nextAction: value }))
	}

	const validate = (): boolean => {
		const newErrors: FormErrors = {}
		if (!form.personId) newErrors.personId = "กรุณาเลือกบุคคล"
		if (!form.householdId) newErrors.householdId = "กรุณาเลือกครัวเรือน"
		if (!form.visitDate) newErrors.visitDate = "กรุณาระบุวันที่เยี่ยม"
		if (!form.visitor.trim()) newErrors.visitor = "กรุณาระบุชื่อผู้เยี่ยม"
		if (!form.visitReason.trim()) newErrors.visitReason = "กรุณาระบุวัตถุประสงค์การเยี่ยม"
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async () => {
		if (!validate()) return
		try {
			const token = localStorage.getItem("token")
			console.log("[ REQUEST ] VISIT LOG ADD =>", form);
			const payload = {
				personId: parseInt(form.personId),
				householdId: parseInt(form.householdId),
				visitDate: form.visitDate,
				visitor: form.visitor,
				visitReason: form.visitReason,
				summary: form.summary || null,
				nextAction: form.nextAction || null,
			}
			const config = {
				method: 'post',
				maxBodyLength: Infinity,
				url: 'http://43.229.149.138:8080/smart_village/api/visit-logs/add',
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				data: JSON.stringify(payload),
			}
			const response = await axios.request(config)
			console.log("บันทึกสำเร็จ:", response.data)
			window.location.href = "/visitlog"
		} catch (err) {
			console.error("บันทึกล้มเหลว:", err)
		}
	}

	const selectClass = (field: string) =>
		`mt-1 w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 dark:text-gray-300 ${
			errors[field]
				? "border-red-400 focus:border-red-400 focus:ring-red-400 text-red-700"
				: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-700 dark:border-gray-600"
		}`

	return (
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
							{persons.map(p => (
								<option key={p.personId} value={p.personId}>
									{p.firstName} {p.lastName}
								</option>
							))}
						</select>
						{errors.personId && <p className="mt-1 text-xs text-red-500">{errors.personId}</p>}
					</div>

					<div>
						<Label>ครัวเรือนที่เยี่ยม <span className="text-red-500">*</span></Label>
						<select
							name="householdId"
							value={form.householdId}
							onChange={handleChange}
							className={selectClass("householdId")}
						>
							<option value="">-- เลือกครัวเรือน --</option>
							{households.map(h => (
								<option key={h.householdId} value={h.householdId}>
									บ้านเลขที่ {h.houseNo}
								</option>
							))}
						</select>
						{errors.householdId && <p className="mt-1 text-xs text-red-500">{errors.householdId}</p>}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>วันที่เยี่ยม <span className="text-red-500">*</span></Label>
						<DatePicker
							id="visitDate"
							placeholder="เลือกวันที่เยี่ยม"
							onChange={(_, dateStr) => {
								setForm(prev => ({ ...prev, visitDate: dateStr }))
								if (errors.visitDate) setErrors(prev => ({ ...prev, visitDate: "" }))
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
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						บันทึก
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
	)
}

