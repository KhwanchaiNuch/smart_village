"use client"
import ComponentCard from '@/components/common/ComponentCard';
import DatePicker from '@/components/form/date-picker';
import Input from '@/components/form/input/InputField';
import Radio from '@/components/form/input/Radio';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";
import PermissionGuard from "@/components/common/PermissionGuard";

// โครงสร้างข้อมูลครัวเรือนที่ใช้แสดงใน dropdown
interface HouseholdOption {
	householdId: number;
	houseNo: string;
	moo: string;
}

export default function PersonAdd() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { village } = useVillage();

	// --- dropdown ครัวเรือน ---
	const [households, setHouseholds] = useState<HouseholdOption[]>([]);
	// ถ้ามี ?householdId= ใน URL → ล็อค dropdown ไว้เลย
	const lockedHouseholdId = searchParams.get("householdId") ?? "";

	useEffect(() => {
		document.title = "Smart Village | Person Add";

		// โหลด households — กรองตาม village ถ้า admin เลือก village ไว้
		const url = village ? `/households?villageId=${village.villageId}` : "/households";
		axios.get<HouseholdOption[]>(url)
			.then(res => setHouseholds(res.data))
			.catch(() => {});
	}, [village]);

	const [form, setForm] = useState({
		household_id: lockedHouseholdId,
		cid: "",
		title: "",
		first_name: "",
		last_name: "",
		gender: "ชาย",
		birth_date: "",
		age: "",
		marital_status: "",
		education_level: "",
		is_registered_in_village: true,
		is_living_in_village: true,
		occupation: "",
		secondary_occupation: "",
		income_per_month: "",
		is_sick: false,
		disease_list: "",
		is_bedridden: false,
		is_disabled: false,
		disability_type: "",
		is_elderly: "",
		living_alone: "",
		welfare_card: false,
		other_welfare: "",
		status: "",
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const handleTextAreaChange = (field: string) => (value: string) => {
		setForm(prev => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async () => {
		try {
			setLoading(true);

			const personPayload = {
				householdId: form.household_id ? Number(form.household_id) : null,
				cid: form.cid,
				title: form.title,
				firstName: form.first_name,
				lastName: form.last_name,
				gender: form.gender,
				birthDate: form.birth_date,
				age: form.age ? Number(form.age) : null,
				maritalStatus: form.marital_status,
				educationLevel: form.education_level,
				isRegisteredInVillage: form.is_registered_in_village,
				isLivingInVillage: form.is_living_in_village,
				occupation: form.occupation,
				secondaryOccupation: form.secondary_occupation,
				incomePerMonth: form.income_per_month ? Number(form.income_per_month) : null,
				isSick: form.is_sick,
				diseaseList: form.disease_list,
				isBedridden: form.is_bedridden,
				isDisabled: form.is_disabled,
				disabilityType: form.disability_type,
				isElderly: form.is_elderly || null,
				livingAlone: form.living_alone || null,
				welfareCard: form.welfare_card,
				otherWelfare: form.other_welfare,
				status: form.status,
			};

			await axios.post(`/persons/add`, personPayload);

			await Swal.fire({
				icon: "success",
				title: "บันทึกสำเร็จ",
				text: "เพิ่มข้อมูลบุคคลเรียบร้อยแล้ว",
				timer: 1800,
				showConfirmButton: false,
			});
			router.push("/person");
		} catch (err) {
			console.error("บันทึกบุคคลล้มเหลว:", err);
			Swal.fire({
				icon: "error",
				title: "บันทึกไม่สำเร็จ",
				text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาตรวจสอบสิทธิ์หรือลองใหม่อีกครั้ง",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<PermissionGuard menuUrl="/person" action="add">
		<>
			<ComponentCard title="เพิ่มบุคคล ( Add Person )">

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>ครัวเรือน</Label>
						{/*
						 * dropdown เลือกครัวเรือน
						 * - value คือ householdId ที่จะส่งไป backend
						 * - label แสดง "บ้านเลขที่ X หมู่ Y" เพื่อให้ user เข้าใจง่าย
						 * - ถ้า moo ว่างเปล่าจะแสดงแค่เลขที่บ้าน
						 */}
						<select
							value={form.household_id}
							onChange={(e) => setForm(prev => ({ ...prev, household_id: e.target.value }))}
							disabled={!!lockedHouseholdId}
							className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white"
						>
							<option value="">-- เลือกครัวเรือน --</option>
							{households.map(h => (
								<option key={h.householdId} value={h.householdId}>
									บ้านเลขที่ {h.houseNo}{h.moo ? ` หมู่ ${h.moo}` : ""}
								</option>
							))}
						</select>
					</div>
					<div>
						<Label>เลขบัตรประชาชน</Label>
						<Input
							name="cid"
							value={form.cid}
							onChange={handleChange}
							placeholder="เช่น 1234567890123"
						/>
					</div>
					<div>
						<Label>คำนำหน้า</Label>
						<Input
							name="title"
							value={form.title}
							onChange={handleChange}
							type="text"
							placeholder="เช่น นาย, นาง, นางสาว"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>ชื่อ</Label>
						<Input
							name="first_name"
							value={form.first_name}
							onChange={handleChange}
							type="text"
							placeholder="เช่น สมชาย"
						/>
					</div>
					<div>
						<Label>นามสกุล</Label>
						<Input
							name="last_name"
							value={form.last_name}
							onChange={handleChange}
							type="text"
							placeholder="เช่น ใจดี"
						/>
					</div>
					<div>
						<Label>อายุ</Label>
						<Input
							name="age"
							value={form.age}
							onChange={handleChange}
							type="text"
							placeholder="เช่น 35"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<ComponentCard title="เพศ">
						<div className="flex gap-6">
							<Radio id="gender-male" name="gender" value="ชาย"
								checked={form.gender === "ชาย"}
								onChange={(value) => setForm(prev => ({ ...prev, gender: value }))}
								label="ชาย ( Male )" />
							<Radio id="gender-female" name="gender" value="หญิง"
								checked={form.gender === "หญิง"}
								onChange={(value) => setForm(prev => ({ ...prev, gender: value }))}
								label="หญิง ( Female )" />
						</div>
					</ComponentCard>

					<ComponentCard title="วันเกิด">
						<DatePicker
							id="date-picker"
							placeholder="Select a date"
							onChange={(dates, currentDateString) => {
								setForm(prev => ({ ...prev, birth_date: currentDateString }));
							}} />
					</ComponentCard>

					<ComponentCard title="มีทะเบียนบ้านในหมู่บ้านหรือไม่">
						<div className="flex gap-6">
							<Radio id="reg-yes" name="is_registered_in_village" value="true"
								checked={form.is_registered_in_village === true}
								onChange={(value) => setForm(prev => ({ ...prev, is_registered_in_village: value === "true" }))}
								label="มี ( Yes )" />
							<Radio id="reg-no" name="is_registered_in_village" value="false"
								checked={form.is_registered_in_village === false}
								onChange={(value) => setForm(prev => ({ ...prev, is_registered_in_village: value === "true" }))}
								label="ไม่มี ( No )" />
						</div>
					</ComponentCard>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>สถานะสมรส</Label>
						<Input name="marital_status" value={form.marital_status} onChange={handleChange} type="text" placeholder="เช่น โสด, สมรส, หม้าย" />
					</div>
					<div>
						<Label>ระดับการศึกษา</Label>
						<Input name="education_level" value={form.education_level} onChange={handleChange} type="text" placeholder="เช่น ประถมศึกษา, มัธยมศึกษา, ปริญญาตรี" />
					</div>
					<div>
						<Label>อาชีพหลัก</Label>
						<Input name="occupation" value={form.occupation} onChange={handleChange} type="text" placeholder="เช่น เกษตรกร, ค้าขาย, รับราชการ" />
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>อาชีพรอง</Label>
						<Input name="secondary_occupation" value={form.secondary_occupation} onChange={handleChange} type="text" placeholder="เช่น ค้าขาย, รับจ้าง" />
					</div>
					<div>
						<Label>รายได้/เดือน (โดยประมาณ)</Label>
						<Input name="income_per_month" value={form.income_per_month} onChange={handleChange} type="text" placeholder="เช่น 5000" />
					</div>
					<div>
						<Label>รายการโรคประจำตัว</Label>
						<Input name="disease_list" value={form.disease_list} onChange={handleChange} type="text" placeholder="เช่น เบาหวาน, ความดันโลหิตสูง" />
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<ComponentCard title="ป่วย/มีโรคเรื้อรังหรือไม่">
						<div className="flex gap-6">
							<Radio id="sick-yes" name="is_sick" value="true"
								checked={form.is_sick === true}
								onChange={(value) => setForm(prev => ({ ...prev, is_sick: value === "true" }))}
								label="มี ( Yes )" />
							<Radio id="sick-no" name="is_sick" value="false"
								checked={form.is_sick === false}
								onChange={(value) => setForm(prev => ({ ...prev, is_sick: value === "true" }))}
								label="ไม่มี ( No )" />
						</div>
					</ComponentCard>

					<ComponentCard title="ติดเตียงหรือไม่">
						<div className="flex gap-6">
							<Radio id="bedridden-yes" name="is_bedridden" value="true"
								checked={form.is_bedridden === true}
								onChange={(value) => setForm(prev => ({ ...prev, is_bedridden: value === "true" }))}
								label="มี ( Yes )" />
							<Radio id="bedridden-no" name="is_bedridden" value="false"
								checked={form.is_bedridden === false}
								onChange={(value) => setForm(prev => ({ ...prev, is_bedridden: value === "true" }))}
								label="ไม่มี ( No )" />
						</div>
					</ComponentCard>

					<ComponentCard title="ผู้พิการหรือไม่">
						<div className="flex gap-6">
							<Radio id="disabled-yes" name="is_disabled" value="true"
								checked={form.is_disabled === true}
								onChange={(value) => setForm(prev => ({ ...prev, is_disabled: value === "true" }))}
								label="มี ( Yes )" />
							<Radio id="disabled-no" name="is_disabled" value="false"
								checked={form.is_disabled === false}
								onChange={(value) => setForm(prev => ({ ...prev, is_disabled: value === "true" }))}
								label="ไม่มี ( No )" />
						</div>
					</ComponentCard>
				</div>

				<div>
					<Label>ประเภทความพิการ</Label>
					<Input name="disability_type" value={form.disability_type} onChange={handleChange} type="text" placeholder="เช่น พิการทางการเคลื่อนไหว, ทางสายตา" />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>บัตรสวัสดิการแห่งรัฐ</Label>
						<div className="flex gap-6 mt-2">
							<Radio id="welfare-yes" name="welfare_card" value="true"
								checked={form.welfare_card === true}
								onChange={(value) => setForm(prev => ({ ...prev, welfare_card: value === "true" }))}
								label="มี ( Yes )" />
							<Radio id="welfare-no" name="welfare_card" value="false"
								checked={form.welfare_card === false}
								onChange={(value) => setForm(prev => ({ ...prev, welfare_card: value === "true" }))}
								label="ไม่มี ( No )" />
						</div>
					</div>
					<div>
						<Label>สวัสดิการอื่น ๆ</Label>
						<TextArea value={form.other_welfare} onChange={handleTextAreaChange("other_welfare")} rows={1} />
					</div>
				</div>

				<div className="flex gap-3 mt-4">
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "กำลังบันทึก..." : "บันทึก"}
					</button>
					<button
						onClick={() => router.push("/person")}
						disabled={loading}
						className="px-6 py-2 border border-gray-400 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						ยกเลิก
					</button>
				</div>
			</ComponentCard>
		</>
	</PermissionGuard>
	);
}
