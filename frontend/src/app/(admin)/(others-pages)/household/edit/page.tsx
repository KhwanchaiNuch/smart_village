"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Radio from '@/components/form/input/Radio';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
const axios = require('axios');

export default function HouseHoldEdit() {
	const searchParams = useSearchParams()
	const id = searchParams.get("id")

	const [form, setForm] = useState({
		household_id: "",
		village_id: "",
		house_no: "",
		house_registration_status: true,
		house_registration_type: "",
		gps_lat: "",
		gps_lng: "",
		house_condition: "",
		water_system: "",
		internet_access: true,
		electricity_access: true,
		remark: "",
	})

	useEffect(() => {
		document.title = "Smart Village | House Hold Edit"
		async function fetchData() {
			try {
				const token = localStorage.getItem("token")
				const config = {
					method: 'get',
					maxBodyLength: Infinity,
					url: `http://43.229.149.138:8080/smart_village/api/households/${id}`,
					headers: {
						"Authorization": `Bearer ${token}`,
					}
				}
				const response = await axios.request(config)
				const data = response.data
				setForm({
					household_id: data.householdId?.toString() || "",
					village_id: data.villageId?.toString() || "",
					house_no: data.houseNo || "",
					house_registration_status: data.houseRegistrationStatus ?? true,
					house_registration_type: data.houseRegistrationType || "",
					gps_lat: data.gpsLat || "",
					gps_lng: data.gpsLng || "",
					house_condition: data.houseCondition || "",
					water_system: data.waterSystem || "",
					internet_access: data.internetAccess ?? true,
					electricity_access: data.electricityAccess ?? true,
					remark: data.remark || "",
				})
			} catch (err) {
				console.error(err)
			}
		}
		if (id) fetchData()
	}, [id])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
	}

	const handleRadioChange = (value: string) => {
		setForm(prev => ({ ...prev, house_registration_status: value === "true" }))
	}

	const handleRadioInternetChange = (value: string) => {
		setForm(prev => ({ ...prev, internet_access: value === "true" }))
	}

	const handleRadioElectricityChange = (value: string) => {
		setForm(prev => ({ ...prev, electricity_access: value === "true" }))
	}

	const handleTextAreaChange = (value: string) => {
		setForm(prev => ({ ...prev, remark: value }))
	}

	const handleSubmit = async () => {
		try {
			const token = localStorage.getItem("token")
			console.log("[ REQUEST ] HOUSE HOLD DATAS EDIT =>", form);
			const config = {
				method: 'post',
				maxBodyLength: Infinity,
				url: `http://43.229.149.138:8080/smart_village/api/households/edit`,
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				data: JSON.stringify(form),
			}
			const response = await axios.request(config)
			console.log("อัปเดตสำเร็จ:", response.data)
		} catch (err) {
			console.error("อัปเดตล้มเหลว:", err)
		}
	}

	return (
		<>
			<ComponentCard title="แก้ไขครัวเรือน ( Edit HouseHold )">

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>รหัสครัวเรือน (PK)</Label>
						<Input
							name="household_id"
							value={form.household_id}
							onChange={handleChange}
							disabled
						/>
					</div>

					<div>
						<Label>เลขที่บ้าน</Label>
						<Input
							name="house_no"
							value={form.house_no}
							onChange={handleChange}
							type="text"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>ประเภททะเบียนบ้าน/ลักษณะการอยู่อาศัย (ท.ร.14/หอพัก/เช่า ฯลฯ)</Label>
						<Input
							name="house_registration_type"
							value={form.house_registration_type}
							onChange={handleChange}
							type="text"
						/>
					</div>
					<div>
						<Label>สภาพบ้าน (ดี/ปานกลาง/ทรุดโทรม)</Label>
						<Input
							name="house_condition"
							value={form.house_condition}
							onChange={handleChange}
							type="text"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<ComponentCard title="มีชื่ออยู่ทะเบียนบ้านในหมู่บ้านหรือไม่">
						<div className="flex gap-6">
							<Radio
								id="reg-yes"
								name="house_registration_status"
								value="true"
								checked={form.house_registration_status === true}
								onChange={handleRadioChange}
								label="มี ( Yes )"
							/>
							<Radio
								id="reg-no"
								name="house_registration_status"
								value="false"
								checked={form.house_registration_status === false}
								onChange={handleRadioChange}
								label="ไม่มี ( No )"
							/>
						</div>
					</ComponentCard>

					<ComponentCard title="พิกัดบ้าน (ทำแผนที่/ลงพื้นที่)">
						<div className="flex gap-6">
							<div className="w-full">
								<Label>พิกัดละติจูดบ้าน</Label>
								<Input
									className="w-full"
									name="gps_lat"
									value={form.gps_lat}
									onChange={handleChange}
								/>
							</div>
							<div className="w-full">
								<Label>พิกัดลองจิจูดบ้าน</Label>
								<Input
									className="w-full"
									name="gps_lng"
									value={form.gps_lng}
									onChange={handleChange}
									type="text"
								/>
							</div>
						</div>
					</ComponentCard>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<ComponentCard title="มีอินเทอร์เน็ตหรือไม่">
						<div className="flex gap-6">
							<Radio
								id="reg-yes-internet"
								name="internet_access"
								value="true"
								checked={form.internet_access === true}
								onChange={handleRadioInternetChange}
								label="มี ( Yes )"
							/>
							<Radio
								id="reg-no-internet"
								name="internet_access"
								value="false"
								checked={form.internet_access === false}
								onChange={handleRadioInternetChange}
								label="ไม่มี ( No )"
							/>
						</div>
					</ComponentCard>

					<ComponentCard title="มีไฟฟ้าใช้หรือไม่ (ใช้คำนวณ Village Index/แผนโครงสร้างพื้นฐาน)">
						<div className="flex gap-6">
							<Radio
								id="reg-yes-electricity"
								name="electricity_access"
								value="true"
								checked={form.electricity_access === true}
								onChange={handleRadioElectricityChange}
								label="มี ( Yes )"
							/>
							<Radio
								id="reg-no-electricity"
								name="electricity_access"
								value="false"
								checked={form.electricity_access === false}
								onChange={handleRadioElectricityChange}
								label="ไม่มี ( No )"
							/>
						</div>
					</ComponentCard>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>แหล่งน้ำใช้ (ประปา/บ่อบาดาล/น้ำฝน ฯลฯ)</Label>
						<Input
							name="water_system"
							value={form.water_system}
							onChange={handleChange}
							type="text"
						/>
					</div>
					<div>
						<Label>Remark</Label>
						<TextArea
							value={form.remark}
							onChange={handleTextAreaChange}
							rows={1}
						/>
					</div>
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
