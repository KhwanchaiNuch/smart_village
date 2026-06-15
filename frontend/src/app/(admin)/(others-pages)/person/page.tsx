"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Badge from '@/components/ui/badge/Badge';
import Checkbox from '@/components/form/input/Checkbox';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";

interface Person {
	firstName: string;
	householdId: number;
	isBedridden: boolean;
	isSick: boolean;
	lastName: string;
	occupation: string;
	personId: number;
}

export default function Person() {
	const { village } = useVillage();
	const [tableData, setData] = useState<Person[]>([]);
	const [villageHouseholdIds, setVillageHouseholdIds] = useState<number[] | null>(null);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");

	const fetchData = useCallback(async () => {
		try {
			const res = await axios.get<Person[]>(`/persons`);
			const sorted = [...res.data].sort((a, b) => a.personId - b.personId);
			setData(sorted);
			setSelectedIds([]);
		} catch (error) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "โหลดข้อมูลไม่สำเร็จ",
				text: "ไม่สามารถดึงข้อมูลบุคคลได้ กรุณาลองใหม่อีกครั้ง",
			});
		}
	}, []);

	useEffect(() => {
		document.title = "Smart Village | Person";
		fetchData();
	}, [fetchData]);

	// โหลดรายการ household_id ของหมู่บ้านที่ใช้งาน เพื่อกรองบุคคล
	useEffect(() => {
		if (!village) { setVillageHouseholdIds(null); return; }
		axios.get<{ householdId: number; villageId: number }[]>(`/households`)
			.then((res) => setVillageHouseholdIds(
				res.data.filter((h) => h.villageId === village.villageId).map((h) => h.householdId)
			))
			.catch(() => setVillageHouseholdIds([]));
	}, [village]);

	const scoped = villageHouseholdIds
		? tableData.filter((p) => villageHouseholdIds.includes(p.householdId))
		: tableData;

	const filtered = scoped.filter((p) => {
		const q = search.toLowerCase();
		return (
			String(p.personId).includes(q) ||
			(p.firstName || "").toLowerCase().includes(q) ||
			(p.lastName || "").toLowerCase().includes(q) ||
			(p.occupation || "").toLowerCase().includes(q)
		);
	});

	const isAllSelected = filtered.length > 0 && filtered.every((p) => selectedIds.includes(p.personId));

	const toggleSelectAll = (checked: boolean) => {
		setSelectedIds(checked ? filtered.map((p) => p.personId) : []);
	};

	const toggleSelectOne = (id: number, checked: boolean) => {
		setSelectedIds((prev) =>
			checked ? [...prev, id] : prev.filter((x) => x !== id)
		);
	};

	const handleDeleteSelected = async () => {
		if (selectedIds.length === 0) {
			Swal.fire({
				icon: "warning",
				title: "ยังไม่ได้เลือกรายการ",
				text: "กรุณาเลือกบุคคลที่ต้องการลบอย่างน้อย 1 รายการ",
			});
			return;
		}

		const result = await Swal.fire({
			icon: "warning",
			title: "ยืนยันการลบ?",
			html: `คุณกำลังจะลบข้อมูลบุคคลจำนวน <b>${selectedIds.length}</b> รายการ<br/>การลบไม่สามารถย้อนกลับได้`,
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
				selectedIds.map((id) => axios.delete(`/persons/${id}`))
			);

			const failed = responses.filter((r) => r.status === "rejected").length;
			const success = selectedIds.length - failed;

			await fetchData();

			if (failed === 0) {
				Swal.fire({
					icon: "success",
					title: "ลบสำเร็จ",
					text: `ลบข้อมูลบุคคลเรียบร้อย ${success} รายการ`,
					timer: 1800,
					showConfirmButton: false,
				});
			} else {
				Swal.fire({
					icon: "warning",
					title: "ลบบางส่วนไม่สำเร็จ",
					text: `สำเร็จ ${success} รายการ, ล้มเหลว ${failed} รายการ`,
				});
			}
		} catch (error) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "เกิดข้อผิดพลาด",
				text: "ไม่สามารถลบข้อมูลได้ กรุณาตรวจสอบสิทธิ์หรือลองใหม่อีกครั้ง",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<ComponentCard title=''>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white">
						รหัสบุคคล (Person)
					</h3>

					<div className="flex items-center gap-2">
						<input
							type="text"
							placeholder="ค้นหา..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
						/>
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

						<a
							href="/person/add"
							className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-green-700"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
							</svg>
							Add
						</a>
					</div>
				</div>

				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
					<div className="max-w-full overflow-x-auto">
						<div className="min-w-[1102px]">
							<Table>
								<TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
									<TableRow>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
											<div className="flex items-center justify-center">
												<Checkbox checked={isAllSelected} onChange={toggleSelectAll} />
											</div>
										</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ลำดับ</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ชื่อ</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">นามสกุล</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">อาชีพ</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ป่วย/มีโรคเรื้อรังหรือไม่</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ติดเตียงหรือไม่</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
									</TableRow>
								</TableHeader>

								<TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
									{filtered.map((person) => {
										const isSelected = selectedIds.includes(person.personId);
										return (
											<TableRow key={person.personId} className={isSelected ? "bg-red-50 dark:bg-red-500/10" : ""}>
												<TableCell className="px-4 py-3 text-center">
													<div className="flex items-center justify-center">
														<Checkbox
															checked={isSelected}
															onChange={(checked) => toggleSelectOne(person.personId, checked)}
														/>
													</div>
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{person.personId}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{person.firstName}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{person.lastName}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{person.occupation}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													<Badge size="sm" color={person.isSick === true ? "error" : person.isSick === false ? "success" : "warning"}>
														{person.isSick === true ? "ป่วย" : person.isSick === false ? "ไม่ป่วย" : "ไม่มีข้อมูล"}
													</Badge>
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													<Badge size="sm" color={person.isBedridden === true ? "error" : person.isBedridden === false ? "success" : "warning"}>
														{person.isBedridden === true ? "ติดเตียง" : person.isBedridden === false ? "ไม่ติดเตียง" : "ไม่มีข้อมูล"}
													</Badge>
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													<div className="flex items-center justify-center gap-2">
														<a
															href={`/person/edit?id=${person.personId}`}
															className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 hover:border-yellow-600"
														>
															<svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
																<path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
															</svg>
														</a>
													</div>
												</TableCell>
											</TableRow>
										);
									})}

									{filtered.length === 0 && (
										<TableRow>
											<TableCell className="px-4 py-6 text-center text-gray-400 text-theme-sm">
												ไม่มีข้อมูลบุคคล
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
	);
}
