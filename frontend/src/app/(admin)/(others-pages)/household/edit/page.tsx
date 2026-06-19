"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Radio from '@/components/form/input/Radio';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/smart_village/api").replace(/\/api$/, "");

function HouseHoldEditContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const [form, setForm] = useState({
		household_id: "",
		village_id: "",
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
	const [houseImageUrl, setHouseImageUrl] = useState<string | null>(null);
	const [imageLoading, setImageLoading] = useState(false);

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
					moo: data.moo || "",
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
				setHouseImageUrl(data.houseImageUrl || null);
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

	const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !id) return;
		const fd = new FormData();
		fd.append("file", file);
		setImageLoading(true);
		try {
			const res = await axios.post(`/households/${id}/image`, fd, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			setHouseImageUrl(res.data.imageUrl);
			Swal.fire({ icon: "success", title: "อัปโหลดรูปสำเร็จ", timer: 1500, showConfirmButton: false });
		} catch (err: any) {
			Swal.fire({ icon: "error", title: "อัปโหลดรูปไม่สำเร็จ", text: err?.response?.data?.message || err?.message });
		} finally {
			setImageLoading(false);
			e.target.value = "";
		}
	};

	const handleDeleteImage = async () => {
		if (!id) return;
		const result = await Swal.fire({
			icon: "warning", title: "ลบรูปบ้าน?", text: "ยืนยันการลบรูปภาพ",
			showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก",
			confirmButtonColor: "#dc2626",
		});
		if (!result.isConfirmed) return;
		setImageLoading(true);
		try {
			await axios.delete(`/households/${id}/image`);
			setHouseImageUrl(null);
			Swal.fire({ icon: "success", title: "ลบรูปสำเร็จ", timer: 1200, showConfirmButton: false });
		} catch (err: any) {
			Swal.fire({ icon: "error", title: "ลบรูปไม่สำเร็จ", text: err?.response?.data?.message || err?.message });
		} finally {
			setImageLoading(false);
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
						<Label>หมู่ที่</Label>
						<Input
							name="moo"
							value={form.moo}
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

				{/* รูปบ้าน */}
				<ComponentCard title="รูปภาพบ้าน">
					<div className="flex flex-col sm:flex-row gap-4 items-start">
						{/* preview */}
						<div className="w-48 h-36 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
							{houseImageUrl ? (
								<img
									src={houseImageUrl.startsWith("http") ? houseImageUrl : API_ORIGIN + houseImageUrl}
									alt="รูปบ้าน"
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-4xl">🏠</span>
							)}
						</div>
						{/* ปุ่ม */}
						<div className="flex flex-col gap-2 pt-1">
							<label className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${imageLoading ? "opacity-50 pointer-events-none" : ""} bg-blue-600 hover:bg-blue-700 text-white`}>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
									<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
								</svg>
								{imageLoading ? "กำลังอัปโหลด..." : "อัปโหลดรูปบ้าน"}
								<input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={imageLoading} />
							</label>
							{houseImageUrl && (
								<button
									onClick={handleDeleteImage}
									disabled={imageLoading}
									className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
										<path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
									</svg>
									ลบรูป
								</button>
							)}
							<p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, WEBP · รูปจะแสดงบนแผนที่หมู่บ้าน</p>
						</div>
					</div>
				</ComponentCard>

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

export default function HouseHoldEdit() {
	return (
		<PermissionGuard menuUrl="/household" action="edit">
			<Suspense fallback={<div>Loading...</div>}>
				<HouseHoldEditContent />
			</Suspense>
		</PermissionGuard>
	)
}
