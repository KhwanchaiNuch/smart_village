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

export default function PersonEdit() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const [form, setForm] = useState({
		person_id: "",
		household_id: "",
		cid: "",
		title: "",
		first_name: "",
		last_name: "",
		gender: "",
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
		welfare_card: "",
		other_welfare: "",
		status: "",
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		document.title = "Smart Village | Person Edit";
		if (!id) return;
		async function fetchData() {
			try {
				const response = await axios.get(`/persons/${id}`);
				const data = response.data;
				setForm({
					person_id: data.personId?.toString() || "",
					household_id: data.householdId?.toString() || "",
					cid: data.cid || "",
					title: data.title || "",
					first_name: data.firstName || "",
					last_name: data.lastName || "",
					gender: data.gender || "",
					birth_date: data.birthDate || "",
					age: data.age?.toString() || "",
					marital_status: data.maritalStatus || "",
					education_level: data.educationLevel || "",
					is_registered_in_village: data.isRegisteredInVillage ?? true,
					is_living_in_village: data.isLivingInVillage ?? true,
					occupation: data.occupation || "",
					secondary_occupation: data.secondaryOccupation || "",
					income_per_month: data.incomePerMonth?.toString() || "",
					is_sick: data.isSick ?? false,
					disease_list: data.diseaseList || "",
					is_bedridden: data.isBedridden ?? false,
					is_disabled: data.isDisabled ?? false,
					disability_type: data.disabilityType || "",
					is_elderly: data.isElderly?.toString() || "",
					living_alone: data.livingAlone?.toString() || "",
					welfare_card: data.welfareCard || "",
					other_welfare: data.otherWelfare || "",
					status: data.status || "",
				});
			} catch (err) {
				console.error(err);
				Swal.fire({
					icon: "error",
					title: "โหลดข้อมูลไม่สำเร็จ",
					text: "ไม่สามารถดึงข้อมูลบุคคลได้ กรุณาลองใหม่อีกครั้ง",
				});
			}
		}
		fetchData();
	}, [id]);

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

			// Map snake_case form → camelCase payload ที่ backend รอรับ
			const personPayload = {
				personId: form.person_id ? Number(form.person_id) : null,
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

			await axios.post(`/persons/edit`, personPayload);

			await Swal.fire({
				icon: "success",
				title: "อัปเดตสำเร็จ",
				text: "แก้ไขข้อมูลบุคคลเรียบร้อยแล้ว",
				timer: 1800,
				showConfirmButton: false,
			});
			router.push("/person");
		} catch (err) {
			console.error("อัปเดตล้มเหลว:", err);
			Swal.fire({
				icon: "error",
				title: "อัปเดตไม่สำเร็จ",
				text: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล กรุณาตรวจสอบสิทธิ์หรือลองใหม่อีกครั้ง",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<ComponentCard title="แก้ไขบุคคล ( Edit Person )">

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>รหัสบุคคล (PK)</Label>
						<Input name="person_id" value={form.person_id} onChange={handleChange} disabled />
					</div>
					<div>
						<Label>รหัสครัวเรือน (FK)</Label>
						<Input name="household_id" value={form.household_id} onChange={handleChange} disabled />
					</div>
					<div>
						<Label>เลขบัตรประชาชน</Label>
						<Input name="cid" value={form.cid} onChange={handleChange} />
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>คำนำหน้า</Label>
						<Input name="title" value={form.title} onChange={handleChange} type="text" />
					</div>
					<div>
						<Label>ชื่อ</Label>
						<Input name="first_name" value={form.first_name} onChange={handleChange} type="text" />
					</div>
					<div>
						<Label>นามสกุล</Label>
						<Input name="last_name" value={form.last_name} onChange={handleChange} type="text" />
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
							defaultDate={form.birth_date}
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
						<Label>อายุ</Label>
						<Input name="age" value={form.age} onChange={handleChange} type="text" />
					</div>
					<div>
						<Label>สถานะสมรส</Label>
						<Input name="marital_status" value={form.marital_status} onChange={handleChange} type="text" />
					</div>
					<div>
						<Label>ระดับการศึกษา</Label>
						<Input name="education_level" value={form.education_level} onChange={handleChange} type="text" />
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>อาชีพหลัก</Label>
						<Input name="occupation" value={form.occupation} onChange={handleChange} type="text" />
					</div>
					<div>
						<Label>อาชีพรอง</Label>
						<Input name="secondary_occupation" value={form.secondary_occupation} onChange={handleChange} type="text" />
					</div>
					<div>
						<Label>รายได้/เดือน (โดยประมาณ)</Label>
						<Input name="income_per_month" value={form.income_per_month} onChange={handleChange} type="text" />
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<Label>รายการโรคประจำตัว</Label>
						<Input name="disease_list" value={form.disease_list} onChange={handleChange} type="text" />
					</div>

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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>ประเภทความพิการ</Label>
						<Input name="disability_type" value={form.disability_type} onChange={handleChange} type="text" />
					</div>
					<div>
						<Label>บัตรสวัสดิการ</Label>
						<Input name="welfare_card" value={form.welfare_card} onChange={handleChange} type="text" />
					</div>
				</div>

				<div>
					<Label>สวัสดิการอื่น ๆ</Label>
					<TextArea value={form.other_welfare} onChange={handleTextAreaChange("other_welfare")} rows={1} />
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
	);
}
