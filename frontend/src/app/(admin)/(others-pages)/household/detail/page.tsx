"use client"
import ComponentCard from '@/components/common/ComponentCard';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import PermissionGuard from "@/components/common/PermissionGuard";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/smart_village/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

function getHouseImgSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("data:")) return url;
  return `${UPLOADS_BASE}/uploads/${url.replace(/^\.?\/uploads\//, "")}`;
}

interface HouseHold {
	householdId: number;
	houseNo: string;
	moo: string;
	houseCondition: string;
	internetAccess: boolean;
	waterSystem: string;
	remark: string;
	villageId: number;
	houseImageUrl?: string | null;
}

interface Person {
	personId: number;
	firstName: string;
	lastName: string;
	title: string;
	gender: string;
	age: number;
	occupation: string;
	cid: string;
	educationLevel?: string;
}

function HouseholdDetailContent() {
	const searchParams = useSearchParams();
	const { canAdd, canEdit, canDelete } = usePermission();
	const householdId = searchParams.get("id") ?? "";

	const [household, setHousehold] = useState<HouseHold | null>(null);
	const [persons, setPersons] = useState<Person[]>([]);
	const [loading, setLoading] = useState(true);

	const houseImgSrc = getHouseImgSrc(household?.houseImageUrl);

	useEffect(() => {
		document.title = "หมู่บ้านดิจิตอล | Household Detail";
		if (!householdId) return;

		const fetchAll = async () => {
			try {
				setLoading(true);
				const [hhRes, personRes] = await Promise.all([
					axios.get<HouseHold>(`/households/${householdId}`), // fetch ตรงๆ ไม่ดึง all
					axios.get<Person[]>(`/persons/by-household/${householdId}`),
				]);
				setHousehold(hhRes.data);
				setPersons(personRes.data);
			} catch {
				Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
			} finally {
				setLoading(false);
			}
		};
		fetchAll();
	}, [householdId]);

	const handleDeletePerson = async (personId: number) => {
		const result = await Swal.fire({
			icon: "warning",
			title: "ยืนยันการลบ?",
			text: "ลบข้อมูลบุคคลนี้ออกจากระบบ",
			showCancelButton: true,
			confirmButtonText: "ใช่, ลบเลย",
			cancelButtonText: "ยกเลิก",
			confirmButtonColor: "#dc2626",
			cancelButtonColor: "#6b7280",
		});
		if (!result.isConfirmed) return;
		try {
			await axios.delete(`/persons/${personId}`);
			setPersons(prev => prev.filter(p => p.personId !== personId));
			Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
		} catch {
			Swal.fire({ icon: "error", title: "ลบไม่สำเร็จ" });
		}
	};

	if (!householdId) {
		return <p className="p-6 text-gray-500">ไม่พบ householdId ใน URL</p>;
	}

	return (
		<PermissionGuard menuUrl="/household">
			<>
				{/* ── ปุ่มย้อนกลับ ── */}
				<div className="mb-4">
					<a href="/household" className="text-sm text-blue-600 hover:underline dark:text-blue-400">← กลับหน้ารายการ</a>
				</div>

				{/* ── ข้อมูลครัวเรือน ── */}
				<ComponentCard title="ข้อมูลครัวเรือน">
					{loading ? (
						<p className="text-sm text-gray-400">กำลังโหลด...</p>
					) : household ? (
						<div className="flex flex-col gap-4">
						{/* รูปบ้าน */}
						<div className="flex items-center gap-4">
							{houseImgSrc ? (
								<img
									src={houseImgSrc}
									alt="รูปบ้าน"
									className="w-40 h-28 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
								/>
							) : (
								<div className="w-40 h-28 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-gray-400 dark:text-gray-500">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
									</svg>
								</div>
							)}
							<div className="text-sm text-gray-500 dark:text-gray-400">
								<p className="font-medium text-gray-700 dark:text-gray-200">รูปภาพบ้าน</p>
								<p className="text-xs mt-1">บ้านเลขที่ {household.houseNo || "-"}</p>
							</div>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div>
								<p className="text-gray-400">รหัสครัวเรือน</p>
								<p className="font-semibold text-gray-800 dark:text-white">{household.householdId}</p>
							</div>
							<div>
								<p className="text-gray-400">บ้านเลขที่</p>
								<p className="font-semibold text-gray-800 dark:text-white">{household.houseNo || "-"}</p>
							</div>
							<div>
								<p className="text-gray-400">หมู่</p>
								<p className="font-semibold text-gray-800 dark:text-white">{household.moo || "-"}</p>
							</div>
							<div>
								<p className="text-gray-400">สภาพบ้าน</p>
								<p className="font-semibold text-gray-800 dark:text-white">{household.houseCondition || "-"}</p>
							</div>
							<div>
								<p className="text-gray-400">ระบบน้ำ</p>
								<p className="font-semibold text-gray-800 dark:text-white">{household.waterSystem || "-"}</p>
							</div>
							<div>
								<p className="text-gray-400">อินเทอร์เน็ต</p>
								<p className="font-semibold text-gray-800 dark:text-white">
									{household.internetAccess === true ? "ใช้งานได้" : household.internetAccess === false ? "ไม่มี" : "-"}
								</p>
							</div>
							<div className="col-span-2">
								<p className="text-gray-400">หมายเหตุ</p>
								<p className="font-semibold text-gray-800 dark:text-white">{household.remark || "-"}</p>
							</div>
						</div>
						</div>
					) : (
						<p className="text-sm text-gray-400">ไม่พบข้อมูลครัวเรือน</p>
					)}
				</ComponentCard>

				{/* ── รายชื่อบุคคลในครัวเรือน ── */}
				<ComponentCard title="">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-800 dark:text-white">
							รายชื่อบุคคลในครัวเรือน ({persons.length} คน)
						</h3>
						{canAdd("/person") && (
							<a
								href={`/person/add?householdId=${householdId}&returnUrl=${encodeURIComponent(`/household/detail?id=${householdId}`)}`}
								className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-green-700"
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
								</svg>
								เพิ่มบุคคล
							</a>
						)}
					</div>

					<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
						<div className="max-w-full overflow-x-auto">
							<div className="min-w-[700px]">
								<Table>
									<TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
										<TableRow>
											<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ID</TableCell>
											<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ชื่อ-นามสกุล</TableCell>
											<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">เพศ</TableCell>
											<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">อายุ</TableCell>
											<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ระดับการศึกษา</TableCell>
											<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">อาชีพ</TableCell>
											<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
										</TableRow>
									</TableHeader>

									<TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
										{persons.map((p) => (
											<TableRow key={p.personId} className="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{p.personId}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-700 text-center text-theme-sm dark:text-gray-300">
													{p.title} {p.firstName} {p.lastName}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{p.gender || "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{p.age ?? "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{p.educationLevel || "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{p.occupation || "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-center">
													<div className="flex items-center justify-center gap-2">
														{canEdit("/person") && (
															<a
																href={`/person/edit?id=${p.personId}`}
																className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 hover:border-yellow-600"
															>
																<svg className="fill-current" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
																	<path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
																</svg>
															</a>
														)}
														{canDelete("/person") && (
															<button
																onClick={() => handleDeletePerson(p.personId)}
																className="flex h-11 w-11 items-center justify-center rounded-full border border-red-500 bg-red-500 text-white shadow-theme-xs hover:bg-red-600 hover:border-red-600"
															>
																<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
																	<path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
																</svg>
															</button>
														)}
													</div>
												</TableCell>
											</TableRow>
										))}

										{!loading && persons.length === 0 && (
											<TableRow>
																							<TableCell colSpan={5} className="text-center py-8 text-gray-400 text-sm">
													ไม่มีข้อมูลสมาชิก
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</div>
					</div>
				</ComponentCard>
			</>
		</PermissionGuard>
	);
}

export default function HouseholdDetail() {
	return (
		<Suspense fallback={
			<div className="p-6 text-center text-gray-500 dark:text-gray-400">
				<p className="animate-pulse">กำลังโหลด...</p>
			</div>
		}>
			<HouseholdDetailContent />
		</Suspense>
	);
}
