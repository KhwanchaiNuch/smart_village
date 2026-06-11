"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Radio from '@/components/form/input/Radio';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

export default function HouseHoldEdit() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

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
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		document.title = "Smart Village | House Hold Edit";
		if (!id) return;
		async function fetchData() {
			try {
				const response = await axios.get(`/households/${id}`);
				const data = response.data;
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
				});
			} catch (err) {
				console.error(err);
				Swal.fire({
					icon: "error",
					title: "โหลดข้อมูลไม่สำเร็จ",
					text: "ไม่สามารถดึงข้อมูลครัวเรือนได้ กรุณาลองใหม่อีกครั้ง",
				});
			}
		}
		fetchData();
	}, [id]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const handleTextAreaChange = (value: string) => {
		setForm(prev => ({ ...prev, remark: value }));
	};

	const handleSubmit = async () => {
		try {
			setLoading(true);

			const householdPayload = {
				householdId: form.household_id ? Number(form.household_id) : null,
				villageId: form.village_id ? Number(form.village_id) : 1,
				houseNo: form.house_no,
				houseRegistrationStatus: form.house_registration_status,
				houseRegistrationType: form.house_registration_type,
				gpsLat: form.gps_lat,
				gpsLng: form.gps_lng,
				houseCondition: form.house_condition,
				waterSystem: form.water_system,
				internetAccess: form.internet_access,
				electricityAccess: form.electricity_access,
				remark: form.remark,
			};

			await axios.post(`/households/edit`, householdPayload);

			await Swal.fire({
				icon: "success",
				title: "อัปเดตสำเร็จ",
				text: "แก้ไขข้อมูลครัวเรือนเรียบร้อยแล้ว",
				timer: 1800,
				showConfirmButton: false,
			});
			router.push("/household");
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
								onChange={(value) => setForm(prev => ({ ...prev, house_registration_status: value === "true" }))}
								label="มี ( Yes )"
							/>
							<Radio
								id="reg-no"
								name="house_registration_status"
								value="false"
								checked={form.house_registration_status === false}
								onChange={(value) => setForm(prev => ({ ...prev, house_registration_status: value === "true" }))}
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
								onChange={(value) => setForm(prev => ({ ...prev, internet_access: value === "true" }))}
								label="มี ( Yes )"
							/>
							<Radio
								id="reg-no-internet"
								name="internet_access"
								value="false"
								checked={form.internet_access === false}
								onChange={(value) => setForm(prev => ({ ...prev, internet_access: value === "true" }))}
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
								onChange={(value) => setForm(prev => ({ ...prev, electricity_access: value === "true" }))}
								label="มี ( Yes )"
							/>
							<Radio
								id="reg-no-electricity"
								name="electricity_access"
								value="false"
								checked={form.electricity_access === false}
								onChange={(value) => setForm(prev => ({ ...prev, electricity_access: value === "true" }))}
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

				<div className="flex gap-3 mt-4">
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "กำลังบันทึก..." : "บันทึก"}
					</button>
					<button
						onClick={() => router.push("/household")}
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
