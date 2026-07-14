"use client"
import ComponentCard from '@/components/common/ComponentCard';
import DataTableWrapper, { DtColumn } from '@/components/common/DataTableWrapper';
import Badge from '@/components/ui/badge/Badge';
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useVillage } from "@/context/VillageContext";

interface HealthRecord {
	id: number;
	personId: number;
	checkDate: string;
	bp: string;
	sugar: number | null;
	bmi: number | null;
	riskGroup: string | null;
	needHomeVisit: boolean | null;
	remark: string | null;
	[key: string]: unknown;
}

interface PersonFull { personId: number; firstName: string; lastName: string; cid?: string | null; birthDate?: string | null; }

export default function HealthRecordPage() {
	const { village, loaded } = useVillage();
	const { canAdd, canEdit, canDelete, canView } = usePermission();
	const [tableData, setData] = useState<HealthRecord[]>([]);
	const [personMap, setPersonMap] = useState<Map<number, PersonFull>>(new Map());
	const [loading, setLoading] = useState(false);

	const fetchData = useCallback(async () => {
		try {
			const vid = village?.villageId;
			const [recordsRes, personsRes] = await Promise.all([
				axios.get<HealthRecord[]>(vid ? `/health-records?villageId=${vid}` : "/health-records"),
				axios.get<PersonFull[]>(vid ? `/persons?villageId=${vid}` : "/persons"),
			]);
			setData([...recordsRes.data].sort((a, b) =>
				new Date(b.checkDate || 0).getTime() - new Date(a.checkDate || 0).getTime()
			));
			const map = new Map<number, PersonFull>();
			personsRes.data.forEach((p) => map.set(p.personId, p));
			setPersonMap(map);
		} catch (error: unknown) {
			const msg = (error as {response?: {data?: {message?: string}}})?.response?.data?.message;
			Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: msg || "กรุณาลองใหม่" });
		}
	}, [village]);

	useEffect(() => {
		document.title = "หมู่บ้านดิจิตอล | Health Record";
		if (!loaded) return;
		fetchData();
	}, [fetchData, loaded]);

	const handleDeleteSelected = async (ids: (string | number)[]) => {
		const result = await Swal.fire({
			icon: "warning", title: "ยืนยันการลบ?",
			html: `คุณกำลังจะลบข้อมูลสุขภาพจำนวน <b>${ids.length}</b> รายการ`,
			showCancelButton: true, confirmButtonText: "ใช่, ลบเลย", cancelButtonText: "ยกเลิก",
			confirmButtonColor: "#dc2626",
		});
		if (!result.isConfirmed) return;
		try {
			setLoading(true);
			const responses = await Promise.allSettled(ids.map((id) => axios.delete(`/health-records/${id}`)));
			const failed = responses.filter((r) => r.status === "rejected").length;
			await fetchData();
			if (failed === 0) {
				Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
			} else {
				Swal.fire({ icon: "warning", title: "ลบบางส่วนไม่สำเร็จ", text: `ล้มเหลว ${failed} รายการ` });
			}
		} catch {
			Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
		} finally {
			setLoading(false);
		}
	};

	const columns: DtColumn<HealthRecord>[] = [
		{
			key: "personId", label: "ชื่อ-นามสกุล", align: "center",
			searchText: (r) => { const p = personMap.get(r.personId); return p ? `${p.firstName} ${p.lastName}` : ""; },
			exportText:  (r) => { const p = personMap.get(r.personId); return p ? `${p.firstName} ${p.lastName}` : `#${r.personId}`; },
			render:      (r) => { const p = personMap.get(r.personId); return <span>{p ? `${p.firstName} ${p.lastName}` : "-"}</span>; },
		},
		{
			key: "_cid", label: "เลขบัตรประชาชน", onlyExport: true,
			exportText: (r) => personMap.get(r.personId)?.cid ?? "",
		},
		{
			key: "_birthDate", label: "วันเกิด", onlyExport: true,
			exportText: (r) => personMap.get(r.personId)?.birthDate ?? "",
		},
		{ key: "checkDate", label: "วันที่ตรวจ", align: "center", exportText: (r) => r.checkDate ?? "" },
		{
			key: "bp", label: "ความดันโลหิต", align: "center",
			exportText: (r) => r.bp ?? "",
			render: (r) => <span>{r.bp || "-"}</span>,
		},
		{
			key: "sugar", label: "น้ำตาล (mg/dL)", align: "center",
			searchText: (r) => r.sugar != null ? String(r.sugar) : "",
			exportText:  (r) => r.sugar != null ? String(r.sugar) : "",
			render:      (r) => <span>{r.sugar != null ? r.sugar : "-"}</span>,
		},
		{
			key: "bmi", label: "BMI", align: "center",
			searchText: (r) => r.bmi != null ? String(r.bmi) : "",
			exportText:  (r) => r.bmi != null ? r.bmi.toFixed(1) : "",
			render:      (r) => <span>{r.bmi != null ? r.bmi.toFixed(1) : "-"}</span>,
		},
		{
			key: "riskGroup", label: "กลุ่มเสี่ยง", align: "center",
			exportText: (r) => r.riskGroup ?? "",
			render: (r) => r.riskGroup
				? <Badge size="sm" color={r.riskGroup === "สูง" ? "error" : r.riskGroup === "ปานกลาง" ? "warning" : "success"}>{r.riskGroup}</Badge>
				: <span className="text-gray-400">-</span>,
		},
		{
			key: "needHomeVisit", label: "เยี่ยมบ้าน", align: "center",
			searchText: (r) => r.needHomeVisit ? "ต้องเยี่ยม" : "ไม่ต้องเยี่ยม",
			exportText:  (r) => r.needHomeVisit ? "ต้องเยี่ยม" : "ไม่ต้องเยี่ยม",
			render: (r) => (
				<Badge size="sm" color={r.needHomeVisit ? "warning" : "success"}>
					{r.needHomeVisit ? "ต้องเยี่ยม" : "ไม่ต้องเยี่ยม"}
				</Badge>
			),
		},
		{
			key: "remark", label: "หมายเหตุ", align: "center",
			exportText: (r) => r.remark ?? "",
			render: (r) => <span className="text-xs text-gray-600">{r.remark || "-"}</span>,
		},
		{
			key: "_action", label: "Action", align: "center", sortable: false, noExport: true,
			render: (row) => (
				<div className="flex justify-center">
					{canEdit("/healthrecord") && (
						<a href={`/healthrecord/edit?id=${row.id}`}
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
		<PermissionGuard menuUrl="/healthrecord">
			<ComponentCard title=''>
				<div className="mb-4">
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white">สุขภาพเชิงตัวเลข (Health Record)</h3>
					{village && <p className="text-xs text-gray-500 mt-0.5">{village.villageName}{village.moo ? ` หมู่ ${village.moo}` : ""}</p>}
				</div>
				<DataTableWrapper<HealthRecord>
					data={tableData}
					columns={columns}
					idKey="id"
					addUrl="/healthrecord/add"
					canAdd={canAdd("/healthrecord")}
					canDelete={canDelete("/healthrecord")}
					canExport={canView("/healthrecord")}
					onDeleteSelected={handleDeleteSelected}
					exportFilename="health_records"
					loading={loading}
					emptyText="ไม่พบข้อมูลสุขภาพ"
				/>
			</ComponentCard>
		</PermissionGuard>
	);
}
