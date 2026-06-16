"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Checkbox from '@/components/form/input/Checkbox';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { usePermission } from "@/context/PermissionContext";
import PermissionGuard from "@/components/common/PermissionGuard";

interface VisitLog {
	id: number;
	personId: number;
	householdId: number;
	visitDate: string;
	visitor: string;
	visitReason: string;
	summary: string;
	nextAction: string;
}

interface Person {
	personId: number;
	firstName: string;
	lastName: string;
}

export default function VisitLogPage() {
	const { canAdd, canEdit, canDelete } = usePermission();
	const [tableData, setData] = useState<VisitLog[]>([]);
	const [personMap, setPersonMap] = useState<Map<number, string>>(new Map());
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");

	const fetchData = useCallback(async () => {
		try {
			const [logsRes, personsRes] = await Promise.all([
				axios.get<VisitLog[]>("/visit-logs"),
				axios.get<Person[]>("/persons"),
			]);
			const sorted = [...logsRes.data].sort((a, b) => a.id - b.id);
			setData(sorted);
			setSelectedIds([]);
			const map = new Map<number, string>();
			personsRes.data.forEach((p) => {
				map.set(p.personId, `${p.firstName} ${p.lastName}`);
			});
			setPersonMap(map);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "โหลดข้อมูลไม่สำเร็จ",
				text: error?.response?.data?.message || "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่",
			});
		}
	}, []);

	useEffect(() => {
		document.title = "Smart Village | Visit Log";
		fetchData();
	}, [fetchData]);

	const filtered = tableData.filter((log) => {
		const q = search.toLowerCase();
		const name = personMap.get(log.personId) || "";
		return (
			name.toLowerCase().includes(q) ||
			(log.visitDate || "").includes(q) ||
			(log.visitor || "").toLowerCase().includes(q) ||
			(log.visitReason || "").toLowerCase().includes(q)
		);
	});

	const isAllSelected = filtered.length > 0 && filtered.every((log) => selectedIds.includes(log.id));
	const toggleSelectAll = (checked: boolean) =>
		setSelectedIds(checked ? filtered.map((log) => log.id) : []);
	const toggleSelectOne = (id: number, checked: boolean) =>
		setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

	const handleDeleteSelected = async () => {
		if (selectedIds.length === 0) {
			Swal.fire({ icon: "warning", title: "ยังไม่ได้เลือกรายการ", text: "กรุณาเลือกรายการที่ต้องการลบ" });
			return;
		}
		const result = await Swal.fire({
			icon: "warning",
			title: "ยืนยันการลบ?",
			html: `คุณกำลังจะลบบันทึกการเยี่ยมบ้านจำนวน <b>${selectedIds.length}</b> รายการ`,
			showCancelButton: true,
			confirmButtonText: "ใช่, ลบเลย",
			cancelButtonText: "ยกเลิก",
			confirmButtonColor: "#dc2626",
			cancelButtonColor: "#6b7280",
		});
		if (!result.isConfirmed) return;
		try {
			setLoading(true);
			const responses = await Promise.allSettled(
				selectedIds.map((id) => axios.delete(`/visit-logs/${id}`))
			);
			const failed = responses.filter((r) => r.status === "rejected").length;
			await fetchData();
			if (failed === 0) {
				Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false });
			} else {
				Swal.fire({ icon: "warning", title: "ลบบางส่วนไม่สำเร็จ", text: `ล้มเหลว ${failed} รายการ` });
			}
		} catch (error) {
			console.error(error);
			Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถลบข้อมูลได้" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<PermissionGuard menuUrl="/visitlog">
		<>
			<ComponentCard title=''>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white">
						บันทึกการเยี่ยมบ้าน (Visit Log)
					</h3>
					<div className="flex items-center gap-2">
						<input
							type="text"
							placeholder="ค้นหา..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
						/>
						{canDelete("/visitlog") && (
						<button
							onClick={handleDeleteSelected}
							disabled={selectedIds.length === 0 || loading}
							className="flex items-center gap-2 rounded-full border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
							</svg>
							ลบที่เลือก{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
						</button>
						)}
						{canAdd("/visitlog") && (
						<a
							href="/visitlog/add"
							className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-green-700"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
							</svg>
							Add
						</a>
						)}
					</div>
				</div>

				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
					<div className="max-w-full overflow-x-auto">
						<div className="min-w-[1102px]">
							<Table>
								<TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
									<TableRow>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
											<Checkbox checked={isAllSelected} onChange={toggleSelectAll} />
										</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ชื่อ-นามสกุล</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">วันที่เยี่ยม</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ผู้เยี่ยม</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">วัตถุประสงค์</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">สรุปผล</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">การดำเนินการต่อ</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
									</TableRow>
								</TableHeader>
								<TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
									{filtered.map((log) => {
										const isSelected = selectedIds.includes(log.id);
										return (
											<TableRow key={log.id} className={isSelected ? "bg-red-50 dark:bg-red-500/10" : ""}>
												<TableCell className="px-4 py-3 text-center">
													<Checkbox
														checked={isSelected}
														onChange={(checked) => toggleSelectOne(log.id, checked)}
													/>
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{personMap.get(log.personId) || "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{log.visitDate || "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{log.visitor || "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{log.visitReason || "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{log.summary || "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{log.nextAction || "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-center">
													{canEdit("/visitlog") && (
													<a
														href={`/visitlog/edit?id=${log.id}`}
														className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 hover:border-yellow-600 mx-auto"
													>
														<svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
															<path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" />
														</svg>
													</a>
													)}
												</TableCell>
											</TableRow>
										);
									})}
									{filtered.length === 0 && (
										<TableRow>
											<TableCell className="px-4 py-6 text-center text-gray-400 text-theme-sm">
												ไม่มีบันทึกการเยี่ยมบ้าน
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
