"use client"
import ComponentCard from '@/components/common/ComponentCard';
import DataTableWrapper, { DtColumn } from '@/components/common/DataTableWrapper';
import Badge from '@/components/ui/badge/Badge';
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/smart_village/api";
const UPLOADS_BASE = API_BASE.replace(/\/api$/, "");

/** แปลง filename หรือ legacy full URL → URL สำหรับ <img src> */
function getHouseImgSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url; // legacy full URL ที่บันทึกไว้ก่อนหน้า
  if (url.startsWith("data:")) return url;
  return `${UPLOADS_BASE}/uploads/${url.replace(/^\.?\/uploads\//, "")}`;
}

interface HouseHold {
	houseCondition: string;
	houseNo: string;
	householdId: number;
	internetAccess: boolean;
	remark: string;
	villageId: number;
	waterSystem: string;
	houseImageUrl?: string | null;
	moo?: string | null;
	houseRegistrationStatus?: boolean | null;
	houseRegistrationType?: string | null;
	gpsLat?: number | null;
	gpsLng?: number | null;
	electricityAccess?: boolean | null;
	[key: string]: unknown;
}

interface PersonItem {
	personId: number;
	householdId: number;
	title?: string | null;
	firstName: string;
	lastName: string;
}

export default function HouseHold() {
	const router = useRouter();
	const { village, loaded } = useVillage();
	const { canAdd, canEdit, canDelete, canView } = usePermission();
	const [tableData, setData] = useState<HouseHold[]>([]);
	const [loading, setLoading] = useState(false);
	const [role, setRole] = useState<string | null>(null);
	const [membersMap, setMembersMap] = useState<Map<number, string>>(new Map());

	useEffect(() => {
		setRole(localStorage.getItem("role"));
	}, []);

	const fetchData = useCallback(async () => {
		try {
			const vid = village?.villageId;
			const params: Record<string, number> = {};
			if (vid) params.villageId = vid;
			const [hhRes, personRes] = await Promise.all([
				axios.get<HouseHold[]>("/households", { params }),
				axios.get<PersonItem[]>(vid ? `/persons?villageId=${vid}` : "/persons"),
			]);
			setData([...hhRes.data].sort((a, b) => a.householdId - b.householdId));
			// group persons by householdId → "คำนำหน้าชื่อ นามสกุล, ..."
			const mm = new Map<number, string>();
			personRes.data.forEach((p) => {
				const name = `${p.title ?? ""} ${p.firstName} ${p.lastName}`.trim();
				const prev = mm.get(p.householdId);
				mm.set(p.householdId, prev ? `${prev}, ${name}` : name);
			});
			setMembersMap(mm);
		} catch (error) {
			console.error(error);
			Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: "ไม่สามารถดึงข้อมูลครัวเรือนได้" });
		}
	}, [village]);

	useEffect(() => {
		document.title = "หมู่บ้านดิจิตอล | House Hold";
		if (!loaded) return;
		fetchData();
	}, [fetchData, loaded]);

	const handleDeleteSelected = async (ids: (string | number)[]) => {
		if (ids.length === 0) return;
		const result = await Swal.fire({
			icon: "warning",
			title: "ยืนยันการลบ?",
			html: `คุณกำลังจะลบข้อมูลครัวเรือนจำนวน <b>${ids.length}</b> รายการ`,
			showCancelButton: true,
			confirmButtonText: "ใช่, ลบเลย",
			cancelButtonText: "ยกเลิก",
			confirmButtonColor: "#dc2626",
			cancelButtonColor: "#6b7280",
		});
		if (!result.isConfirmed) return;
		try {
			setLoading(true);
			const responses = await Promise.allSettled(ids.map((id) => axios.delete(`/households/${id}`)));
			const failed = responses.filter((r) => r.status === "rejected").length;
			await fetchData();
			if (failed === 0) {
				Swal.fire({ icon: "success", title: "ลบสำเร็จ", text: `ลบ ${ids.length} รายการเรียบร้อย`, timer: 1800, showConfirmButton: false });
			} else {
				Swal.fire({ icon: "warning", title: "ลบบางส่วนไม่สำเร็จ", text: `สำเร็จ ${ids.length - failed} รายการ, ล้มเหลว ${failed} รายการ` });
			}
		} catch {
			Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถลบข้อมูลได้" });
		} finally {
			setLoading(false);
		}
	};

	const needsVillageSelect = role !== null && role !== "VILLAGE" && role !== "VIEWER" && !village;

	const columns: DtColumn<HouseHold>[] = [
		{
			key: "houseImageUrlRaw", label: "รูปภาพบ้าน (URL)", onlyExport: true,
			exportText: (r) => r.houseImageUrl ? getHouseImgSrc(r.houseImageUrl) ?? "" : "",
		},
		{
			key: "_members", label: "รายชื่อสมาชิกในครัวเรือน", onlyExport: true,
			exportText: (r) => membersMap.get(r.householdId) ?? "",
		},
		{
			key: "gpsLatRaw", label: "พิกัดละติจูด", onlyExport: true,
			exportText: (r) => r.gpsLat != null ? String(r.gpsLat) : "",
		},
		{
			key: "gpsLngRaw", label: "พิกัดลองจิจูด", onlyExport: true,
			exportText: (r) => r.gpsLng != null ? String(r.gpsLng) : "",
		},
		{
			key: "houseImageUrl",
			label: "รูปบ้าน",
			align: "center",
			sortable: false,
			noExport: true,
			render: (row) => {
				const imgSrc = getHouseImgSrc(row.houseImageUrl);
			if (!imgSrc) {
					return (
						<div className="flex justify-center">
							<div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
								</svg>
							</div>
						</div>
					);
				}
				return (
					<div className="flex justify-center">
						<img src={imgSrc} alt="รูปบ้าน" className="h-12 w-12 rounded-lg object-cover border border-gray-200" />
					</div>
				);
			},
		},
		{
			key: "houseNo",
			label: "บ้านเลขที่",
			align: "center",
			exportText: (r) => r.houseNo ?? "",
		},
		{
			key: "moo",
			label: "หมู่",
			align: "center",
			exportText: (r) => r.moo ?? "",
			render: (r) => <span>{r.moo || "-"}</span>,
		},
		{
			key: "houseCondition",
			label: "สภาพบ้าน",
			align: "center",
			exportText: (r) => r.houseCondition ?? "",
		},
		{
			key: "houseRegistrationStatus",
			label: "ทะเบียนบ้าน",
			align: "center",
			searchText: (r) => r.houseRegistrationStatus ? "มีชื่ออยู่" : "ไม่มีชื่ออยู่",
			exportText: (r) => r.houseRegistrationStatus ? "มีชื่ออยู่" : "ไม่มีชื่ออยู่",
			render: (r) => (
				<Badge size="sm" color={r.houseRegistrationStatus ? "success" : "error"}>
					{r.houseRegistrationStatus ? "มีชื่ออยู่" : "ไม่มีชื่ออยู่"}
				</Badge>
			),
		},
		{
			key: "internetAccess",
			label: "อินเทอร์เน็ต",
			align: "center",
			searchText: (r) => (r.internetAccess ? "มี" : "ไม่มี"),
			exportText: (r) => (r.internetAccess ? "มี" : "ไม่มี"),
			render: (r) => (
				<Badge size="sm" color={r.internetAccess ? "success" : "error"}>
					{r.internetAccess ? "มี" : "ไม่มี"}
				</Badge>
			),
		},
		{
			key: "electricityAccess",
			label: "ไฟฟ้า",
			align: "center",
			searchText: (r) => (r.electricityAccess ? "มี" : "ไม่มี"),
			exportText: (r) => (r.electricityAccess ? "มี" : "ไม่มี"),
			render: (r) => (
				<Badge size="sm" color={r.electricityAccess ? "success" : "error"}>
					{r.electricityAccess ? "มี" : "ไม่มี"}
				</Badge>
			),
		},
		{
			key: "waterSystem",
			label: "แหล่งน้ำ",
			align: "center",
			exportText: (r) => r.waterSystem ?? "",
		},
		{
			key: "_action",
			label: "Action",
			align: "center",
			sortable: false,
			noExport: true,
			render: (row) => (
				<div className="flex justify-center gap-2">
					{canEdit("/household") && (
						<a
							href={`/household/edit?id=${row.householdId}`}
							className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600"
						>
							<svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
								<path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
							</svg>
						</a>
					)}
				</div>
			),
		},
	];

	return (
		<PermissionGuard menuUrl="/household">
			<ComponentCard title=''>
				{needsVillageSelect && (
					<div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 px-4 py-3">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
						</svg>
						<p className="text-sm text-amber-800 dark:text-amber-200">กรุณาเลือกหมู่บ้านที่ต้องการจัดการก่อน</p>
						<Link href="/village" className="ml-auto flex-shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600">
							ไปเลือกหมู่บ้าน →
						</Link>
					</div>
				)}

				<div className="mb-4">
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white">ครัวเรือน (Household)</h3>
					{village && (
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
							{village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}
						</p>
					)}
				</div>

				<DataTableWrapper<HouseHold>
					data={tableData}
					columns={columns}
					idKey="householdId"
					addUrl="/household/add"
					canAdd={canAdd("/household")}
					canDelete={canDelete("/household")}
					canExport={canView("/household")}
					onDeleteSelected={handleDeleteSelected}
					exportFilename="households"
					loading={loading}
					emptyText="ไม่พบข้อมูลครัวเรือน"
					onRowDoubleClick={(row) => router.push(`/household/detail?id=${row.householdId}`)}
				/>
			</ComponentCard>
		</PermissionGuard>
	);
}
