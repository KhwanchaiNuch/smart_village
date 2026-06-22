"use client"
import ComponentCard from '@/components/common/ComponentCard';
import DataTableWrapper, { DtColumn } from '@/components/common/DataTableWrapper';
import Badge from '@/components/ui/badge/Badge';
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";

interface Person {
	firstName: string;
	householdId: number;
	isBedridden: boolean;
	isSick: boolean;
	lastName: string;
	occupation: string;
	personId: number;
	age?: number | null;
	cid?: string | null;
	title?: string | null;
	gender?: string | null;
	birthDate?: string | null;
	maritalStatus?: string | null;
	educationLevel?: string | null;
	secondaryOccupation?: string | null;
	incomePerMonth?: number | null;
	diseaseList?: string | null;
	isDisabled?: boolean | null;
	disabilityType?: string | null;
	isElderly?: boolean | null;
	livingAlone?: boolean | null;
	welfareCard?: boolean | null;
	otherWelfare?: string | null;
	status?: string | null;
	[key: string]: unknown;
}

interface Household {
	householdId: number;
	houseNo: string | null;
}

export default function PersonPage() {
	const { village, loaded } = useVillage();
	const { canAdd, canEdit, canDelete, canView } = usePermission();
	const [tableData, setData] = useState<Person[]>([]);
	const [householdMap, setHouseholdMap] = useState<Map<number, string>>(new Map());
	const [loading, setLoading] = useState(false);

	const fetchData = useCallback(async () => {
		try {
			const vid = village?.villageId;
			const [personsRes, householdsRes] = await Promise.all([
				axios.get<Person[]>(vid ? `/persons?villageId=${vid}` : "/persons"),
				axios.get<Household[]>(vid ? `/households?villageId=${vid}` : "/households"),
			]);
			setData([...personsRes.data].sort((a, b) => a.personId - b.personId));

			const map = new Map<number, string>();
			householdsRes.data.forEach((h) => map.set(h.householdId, h.houseNo ?? `บ้านเลขที่ ${h.householdId}`));
			setHouseholdMap(map);
		} catch (error) {
			console.error(error);
			Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: "ไม่สามารถดึงข้อมูลบุคคลได้" });
		}
	}, [village]);

	useEffect(() => {
		document.title = "Smart Village | Person";
		if (!loaded) return;
		fetchData();
	}, [fetchData, loaded]);

	const handleDeleteSelected = async (ids: (string | number)[]) => {
		if (ids.length === 0) return;
		const result = await Swal.fire({
			icon: "warning",
			title: "ยืนยันการลบ?",
			html: `คุณกำลังจะลบข้อมูลบุคคลจำนวน <b>${ids.length}</b> รายการ`,
			showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
			confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
		});
		if (!result.isConfirmed) return;
		try {
			setLoading(true);
			const responses = await Promise.allSettled(ids.map((id) => axios.delete(`/persons/${id}`)));
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

	const columns: DtColumn<Person>[] = [
		// ── CSV only (ไม่แสดงในตาราง) ────────────────────────────────────────
		{ key: "houseNo",              label: "บ้านเลขที่",                  onlyExport: true, exportText: (p) => p.householdId != null ? (householdMap.get(p.householdId) ?? "") : "" },
		{ key: "_birthDate",          label: "วันเกิด",                     onlyExport: true, exportText: (r) => r.birthDate ?? "" },
		{ key: "_maritalStatus",      label: "สถานะสมรส",                   onlyExport: true, exportText: (r) => r.maritalStatus ?? "" },
		{ key: "_educationLevel",     label: "ระดับการศึกษา",               onlyExport: true, exportText: (r) => r.educationLevel ?? "" },
		{ key: "_secondaryOccupation",label: "อาชีพรอง",                    onlyExport: true, exportText: (r) => r.secondaryOccupation ?? "" },
		{ key: "_incomePerMonth",     label: "รายได้/เดือน (โดยประมาณ)",   onlyExport: true, exportText: (r) => r.incomePerMonth != null ? String(r.incomePerMonth) : "" },
		{ key: "_diseaseList",        label: "รายการโรคประจำตัว",           onlyExport: true, exportText: (r) => r.diseaseList ?? "" },
		{ key: "_disabilityType",     label: "ประเภทความพิการ",             onlyExport: true, exportText: (r) => r.disabilityType ?? "" },
		{ key: "_isElderly",          label: "ผู้สูงอายุ",                  onlyExport: true, exportText: (r) => r.isElderly ? "ใช่" : "ไม่ใช่" },
		{ key: "_livingAlone",        label: "อยู่คนเดียว",                 onlyExport: true, exportText: (r) => r.livingAlone ? "ใช่" : "ไม่ใช่" },
		{ key: "_otherWelfare",       label: "สวัสดิการอื่น ๆ",            onlyExport: true, exportText: (r) => r.otherWelfare ?? "" },
		{ key: "_status",             label: "สถานะ",                       onlyExport: true, exportText: (r) => r.status ?? "" },
		// ── แสดงในตาราง ──────────────────────────────────────────────────────
		{ key: "cid",       label: "เลขบัตรประชาชน", onlyExport: true, exportText: (r) => r.cid ?? "" },
		{ key: "title",     label: "คำนำหน้า",        align: "center", exportText: (r) => r.title ?? "",     render: (r) => <span>{r.title || "-"}</span> },
		{ key: "firstName", label: "ชื่อ",             align: "center", exportText: (r) => r.firstName ?? "" },
		{ key: "lastName",  label: "นามสกุล",          align: "center", exportText: (r) => r.lastName ?? "" },
		{ key: "gender",    label: "เพศ",              align: "center", exportText: (r) => r.gender ?? "",    render: (r) => <span>{r.gender || "-"}</span> },
		{
			key: "age", label: "อายุ", align: "center",
			searchText: (r) => r.age != null ? `${r.age}` : "",
			exportText:  (r) => r.age != null ? `${r.age}` : "",
			render: (r) => <span>{r.age != null ? `${r.age} ปี` : "—"}</span>,
		},
		{
			key: "occupation", label: "อาชีพหลัก", align: "center",
			exportText: (r) => r.occupation ?? "",
			render: (r) => <span>{r.occupation || "—"}</span>,
		},
		{
			key: "isSick", label: "ป่วย/เรื้อรัง", align: "center",
			searchText: (r) => r.isSick ? "ป่วย" : "ไม่ป่วย",
			exportText:  (r) => r.isSick ? "ป่วย" : "ไม่ป่วย",
			render: (r) => <Badge size="sm" color={r.isSick ? "error" : "success"}>{r.isSick ? "ป่วย" : "ไม่ป่วย"}</Badge>,
		},
		{
			key: "isBedridden", label: "ติดเตียง", align: "center",
			searchText: (r) => r.isBedridden ? "ติดเตียง" : "ไม่ติดเตียง",
			exportText:  (r) => r.isBedridden ? "ติดเตียง" : "ไม่ติดเตียง",
			render: (r) => <Badge size="sm" color={r.isBedridden ? "error" : "success"}>{r.isBedridden ? "ติดเตียง" : "ไม่ติดเตียง"}</Badge>,
		},
		{
			key: "isDisabled", label: "พิการ", align: "center",
			searchText: (r) => r.isDisabled ? "พิการ" : "ไม่พิการ",
			exportText: (r) => r.isDisabled ? "พิการ" : "ไม่พิการ",
			render: (r) => <Badge size="sm" color={r.isDisabled ? "error" : "success"}>{r.isDisabled ? "พิการ" : "ไม่พิการ"}</Badge>,
		},
		{
			key: "welfareCard", label: "บัตรสวัสดิการ", align: "center",
			searchText: (r) => r.welfareCard ? "มี" : "ไม่มี",
			exportText: (r) => r.welfareCard ? "มี" : "ไม่มี",
			render: (r) => <Badge size="sm" color={r.welfareCard ? "success" : "error"}>{r.welfareCard ? "มี" : "ไม่มี"}</Badge>,
		},
		{
			key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
			render: (row) => (
				<div className="flex justify-center gap-2">
					{canEdit("/person") && (
						<a href={`/person/edit?id=${row.personId}`}
							className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600">
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
		<PermissionGuard menuUrl="/person">
			<ComponentCard title=''>
				<div className="mb-4">
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white">บุคคล (Person)</h3>
					{village && <p className="text-xs text-gray-500 mt-0.5">{village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}</p>}
				</div>
				<DataTableWrapper<Person>
					data={tableData}
					columns={columns}
					idKey="personId"
					addUrl="/person/add"
					canAdd={canAdd("/person")}
					canDelete={canDelete("/person")}
					canExport={canView("/person")}
					onDeleteSelected={handleDeleteSelected}
					exportFilename="persons"
					loading={loading}
					emptyText="ไม่พบข้อมูลบุคคล"
				/>
			</ComponentCard>
		</PermissionGuard>
	);
}
