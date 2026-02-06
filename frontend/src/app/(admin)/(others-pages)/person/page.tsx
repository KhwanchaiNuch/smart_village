"use client"
import ComponentCard from '@/components/common/ComponentCard';
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
		is_registered_in_village: "",
		is_living_in_village: "",
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