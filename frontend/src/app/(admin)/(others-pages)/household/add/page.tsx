"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Radio from '@/components/form/input/Radio';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

interface Village { villageId: number; villageName: string; moo: string | null; }

export default function HouseHoldAdd() {
	const router = useRouter();
	const [role, setRole] = useState<string | null>(null);
	const [scopeId, setScopeId] = useState<number | null>(null);
	const [villages, setVillages] = useState<Village[]>([]);
	const [adminVillageId, setAdminVillageId] = useState<string>("");

	useEffect(() => {
		document.title = "Smart Village | House Hold Add";
		const r = localStorage.getItem("role");
		const sid = localStorage.getItem("scopeId");
		setRole(r);
		setScopeId(sid && sid !== "null" && sid !== "" ? Number(sid) : null);

		// โหลด village list สำหรับ admin
		if (r === "ADMIN") {
			axios.get<Village[]>("/villages/all").then(res => setVillages(res.data)).catch(() => {});
		}
	}, []);

	const [form, setForm] = useState({
		house_no: "",
		moo: "",
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

			// admin ต้องเลือก village ก่อน
			if (role === "ADMIN" && !adminVillageId) {
				Swal.fire({ icon: "warning", title: "กรุณาเลือกหมู่บ้าน", text: "Admin ต้องระบุหมู่บ้านสำหรับครัวเรือนนี้" });
				return;
			}

			const householdPayload = {
				householdId: null,
				villageId: role === "ADMIN" ? Number(adminVillageId) : scopeId,
				houseNo: form.house_no,
				moo: form.moo,
				houseRegistrationStatus: form.house_registration_status,
				houseRegistrationType: form.house_registration_type,
				gpsLat: form.gps_lat ? parseFloat(form.gps_lat) : null,
				gpsLng: form.gps_lng ? parseFloat(form.gps_lng) : null,
				houseCondition: form.house_condition,
				waterSystem: form.water_system,
				internetAccess: form.internet_access,
				electricityAccess: form.electricity_access,
				remark: form.remark,
			};

			await axios.post(`/households/add`, householdPayload);

			await Swal.fire({
				icon: "success",
				title: "บันทึกสำเร็จ",
				text: "เพิ่มข้อมูลครัวเรือนเรียบร้อยแล้ว",
				timer: 1800,
				showConfirmButton: false,
			});
			router.push("/household");
		} catch (err: any) {
			console.error("บันทึกครัวเรือนล้มเหลว:", err);
			Swal.fire({
				icon: "error",
				title: "บันทึกไม่สำเร็จ",
				text: err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาตรวจสอบสิทธิ์หรือลองใหม่อีกครั้ง",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<ComponentCard title="รหัสครัวเรือน ( HouseHold )">

				{/* admin: dropdown เลือก village */}
				{role === "ADMIN" && (
					<div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
						<Label>หมู่บ้าน <span className="text-red-500">*</span> (Admin ต้องระบุ)</Label>
						<select
							value={adminVillageId}
							onChange={e => setAdminVillageId(e.target.value)}
							className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
						>
							<option value="">-- เลือกหมู่บ้าน --</option>
							{villages.map(v => (
								<option key={v.villageId} value={v.villageId}>
									{v.villageName}{v.moo ? ` (หมู่ ${v.moo})` : ""}
								</option>
							))}
						</select>
					</div>
				)}

				{/* non-admin: แสดง scopeId ที่ถูก auto-set */}
				{role !== "ADMIN" && scopeId && (
					<div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
						<p className="text-sm text-green-700 dark:text-green-400">
							ครัวเรือนนี้จะถูกบันทึกในหมู่บ้าน ID: <strong>{scopeId}</strong> (สิทธิ์ของบัญชีนี้)
						</p>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>เลขที่บ้าน</Label>
						<Input
							name="house_no"
							value={form.house_no}
							onChange={handleChange}
							type="text"
						/>
					</div>
					<div>
						<Label>หมู่ที่</Label>
						<Input
							name="moo"
							value={form.moo}
							onChange={handleChange}
							type="text"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>สภาพบ้าน (ดี/ปานกลาง/ทรุดโทรม)</Label>
						<Input
							name="house_condition"
							value={form.house_condition}
							onChange={handleChange}
							type="text"
						/>
					</div>
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
						<Label>แหล่งน้ำใช้ (ประปา/บ่อบาดาล/น้ำฝน ฯลฯ)</Label>
						<Input
							name="water_system"
							value={form.water_system}
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

				<ComponentCard title="มีไฟฟ้าหรือไม่">
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

			<div>
				<Label>หมายเหตุ</Label>
				<TextArea value={form.remark} onChange={handleTextAreaChange} rows={3} placeholder="ข้อมูลเพิ่มเติม..." />
			</div>

			<div className="flex justify-end gap-3 mt-4">
				<button
					type="button"
					onClick={() => window.history.back()}
					className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
				>
					ยกเลิก
				</button>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={loading}
					className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
				>
					{loading ? "กำลังบันทึก..." : "บันทึก"}
				</button>
			</div>
		</ComponentCard>
	</>
	);
}
