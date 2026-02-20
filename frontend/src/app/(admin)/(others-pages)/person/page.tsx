"use client"
import ComponentCard from '@/components/common/ComponentCard';
import DatePicker from '@/components/form/date-picker';
import Input from '@/components/form/input/InputField';
import Radio from '@/components/form/input/Radio';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import { useEffect, useState } from "react"

export default function HouseHold() {

	useEffect(() => {
		document.title = "Smart Village | Person"
	}, []);


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
		is_sick: "",
		disease_list: "",
		is_bedridden: "",
		is_disabled: "",
		disability_type: "",
		is_elderly: "",
		living_alone: "",
		welfare_card: "",
		other_welfare: "",
		status: "",
		created_at: "",
		updated_at: ""
	})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setForm(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleRadioChange = (value: string) => {
		setForm(prev => ({
			...prev,
			gender: value,
		}))
	}

	const handleRadioRegisterChange = (value: any) => {
		setForm(prev => ({
			...prev,
			is_registered_in_village: value === "true",
		}))
	}

	const handleSubmit = () => {
		console.log("ค่าที่กรอก:", form)
	}

	return (
		<>
			<ComponentCard title="บุคคล ( Person )">

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>รหัสบุคคล (PK)</Label>
						<Input
							name="person_id"
							value={form.person_id}
							onChange={handleChange}
						/>
					</div>

					<div>
						<Label>รหัสครัวเรือน (PK)</Label>
						<Input
							disabled
							name="household_id"
							value={form.household_id}
							onChange={handleChange}
							type="text"
						/>
					</div>

					<div>
						<Label>เลขบัตรประชาชน</Label>
						<Input
							name="cid"
							value={form.cid}
							onChange={handleChange}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>คำนำหน้า</Label>
						<Input
							name="title"
							value={form.title}
							onChange={handleChange}
							type="text"
						/>
					</div>

					<div>
						<Label>ชื่อ</Label>
						<Input
							name="first_name"
							value={form.first_name}
							onChange={handleChange}
							type="text"
						/>
					</div>

					<div>
						<Label>นามสกุล</Label>
						<Input
							name="last_name"
							value={form.last_name}
							onChange={handleChange}
							type="text"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<ComponentCard title="เพศ">
						<div className="flex gap-6">
							<Radio
								id="reg-yes"
								name="gender"
								value="ชาย"
								checked={form.gender === 'ชาย'}
								onChange={handleRadioChange}
								label="ชาย ( Male )"
							/>
							<Radio
								id="reg-no"
								name="gender"
								value="หญิง"
								checked={form.gender === 'หญิง'}
								onChange={handleRadioChange}
								label="หญิง ( Female )"
							/>
						</div>
					</ComponentCard>
					<ComponentCard title="วันเกิด">
						<DatePicker
							id="date-picker"
							placeholder="Select a date"
							onChange={(dates, currentDateString) => {
								form.birth_date = currentDateString
								console.log({ dates, currentDateString });
							}} />
					</ComponentCard>

					<ComponentCard title="มีทะเบียนบ้านในหมู่บ้านหรือไม่">
						<div className="flex gap-6">
							<Radio
								id="reg-register-yes"
								name="is_registered_in_village"
								value="true"
								checked={form.is_registered_in_village === true}
								onChange={handleRadioRegisterChange}
								label="มี ( Yes )"
							/>
							<Radio
								id="reg-register-no"
								name="is_registered_in_village"
								value="false"
								checked={form.is_registered_in_village === false}
								onChange={handleRadioRegisterChange}
								label="ไม่มี ( No )"
							/>
						</div>
					</ComponentCard>

				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>อายุ</Label>
						<Input
							name="age"
							value={form.age}
							onChange={handleChange}
							type="text"
						/>
					</div>
					<div>
						<Label>สถานะสมรส</Label>
						<Input
							name="marital_status"
							value={form.marital_status}
							onChange={handleChange}
							type="text"
						/>
					</div>

					<div>
						<Label>ระดับการศึกษา</Label>
						<Input
							name="education_level"
							value={form.education_level}
							onChange={handleChange}
							type="text"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<Label>อาชีพหลัก</Label>
						<Input
							name="occupation"
							value={form.occupation}
							onChange={handleChange}
							type="text"
						/>
					</div>
					<div>
						<Label>อาชีพรอง</Label>
						<Input
							name="secondary_occupation"
							value={form.secondary_occupation}
							onChange={handleChange}
							type="text"
						/>
					</div>

					<div>
						<Label>รายได้/เดือน (โดยประมาณ)</Label>
						<Input
							name="income_per_month"
							value={form.income_per_month}
							onChange={handleChange}
							type="text"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">

					<div>
						<Label>รายการโรคประจำตัว</Label>
						<Input
							name="disease_list"
							value={form.disease_list}
							onChange={handleChange}
							type="text"
						/>
					</div>

					<ComponentCard title="ป่วย/มีโรคเรื้อรังหรือไม่">
						<div className="flex gap-6">
							<Radio
								id="reg-register-yes"
								name="is_registered_in_village"
								value="true"
								checked={form.is_registered_in_village === true}
								onChange={handleRadioRegisterChange}
								label="มี ( Yes )"
							/>
							<Radio
								id="reg-register-no"
								name="is_registered_in_village"
								value="false"
								checked={form.is_registered_in_village === false}
								onChange={handleRadioRegisterChange}
								label="ไม่มี ( No )"
							/>
						</div>
					</ComponentCard>

					

					<ComponentCard title="ติดเตียงหรือไม่">
						<div className="flex gap-6">
							<Radio
								id="reg-register-yes"
								name="is_registered_in_village"
								value="true"
								checked={form.is_registered_in_village === true}
								onChange={handleRadioRegisterChange}
								label="มี ( Yes )"
							/>
							<Radio
								id="reg-register-no"
								name="is_registered_in_village"
								value="false"
								checked={form.is_registered_in_village === false}
								onChange={handleRadioRegisterChange}
								label="ไม่มี ( No )"
							/>
						</div>
					</ComponentCard>

					<ComponentCard title="ผู้พิการหรือไม่">
						<div className="flex gap-6">
							<Radio
								id="reg-register-yes"
								name="is_registered_in_village"
								value="true"
								checked={form.is_registered_in_village === true}
								onChange={handleRadioRegisterChange}
								label="มี ( Yes )"
							/>
							<Radio
								id="reg-register-no"
								name="is_registered_in_village"
								value="false"
								checked={form.is_registered_in_village === false}
								onChange={handleRadioRegisterChange}
								label="ไม่มี ( No )"
							/>
						</div>
					</ComponentCard>

				</div>





				<button
					onClick={handleSubmit}
					className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
				>
					บันทึก
				</button>
			</ComponentCard>
		</>
	)
}