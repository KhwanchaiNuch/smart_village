"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Checkbox from '@/components/form/input/Checkbox';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";
import { usePermission } from "@/context/PermissionContext";
import { useGeoScope } from "@/context/GeoScopeContext";

interface Province { provinceId: number; nameTh: string; }
interface Amphur { amphurId: number; provinceId: number; nameTh: string; }
interface Tambon { tambonId: number; amphurId: number; nameTh: string; zipcode: string | null; }
interface Village { villageId: number; tambonId: number; villageName: string; moo: string | null; }

export default function VillagePage() {
	const router = useRouter();
	const { village: activeVillage, setVillage } = useVillage();
	const { canEdit, canDelete } = usePermission();
	const { role, selectedProvince, selectedAmphur, selectedTambon, setSelectedVillage } = useGeoScope();

	const isAdmin = role === "ADMIN";
	const isProvince = role === "PROVINCE";
	const isAmphur = role === "AMPHUR";
	const isTambon = role === "TAMBON";

	const [tableData, setData] = useState<Village[]>([]);
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [allAmphurs, setAllAmphurs] = useState<Amphur[]>([]);
	const [allTambons, setAllTambons] = useState<Tambon[]>([]);
	const [provinceId, setProvinceId] = useState<number | "">("");
	const [amphurId, setAmphurId] = useState<number | "">("");
	const [tambonId, setTambonId] = useState<number | "">("");
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [userRole, setUserRole] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		try {
			const res = await axios.get<Village[]>("/villages/scoped");
			setData(res.data);
			setSelectedIds([]);
		} catch (error) {
			console.error(error);
			Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: "ไม่สามารถดึงข้อมูลหมู่บ้านได้ กรุณาลองใหม่อีกครั้ง" });
		}
	}, []);

	useEffect(() => {
		document.title = "Smart Village | หมู่บ้าน";
		setUserRole(localStorage.getItem("role"));
		if (isAdmin) {
			axios.get<Province[]>("/provinces")
				.then((r) => setProvinces([...r.data].sort((a, b) => a.provinceId - b.provinceId)))
				.catch(() => {});
			axios.get<Amphur[]>("/amphurs/all").then((r) => setAllAmphurs(r.data)).catch(() => {});
			axios.get<Tambon[]>("/tambons/all").then((r) => setAllTambons(r.data)).catch(() => {});
		} else {
			axios.get<Amphur[]>("/amphurs/scoped").then((r) => setAllAmphurs(r.data)).catch(() => {});
			axios.get<Tambon[]>("/tambons/scoped").then((r) => setAllTambons(r.data)).catch(() => {});
		}
		fetchData();
	}, [fetchData, isAdmin]);

	// sync filter จาก GeoScopeContext สำหรับ non-ADMIN
	useEffect(() => {
		if (!isAdmin) {
			if (selectedProvince) setProvinceId(selectedProvince.provinceId);
			if (selectedAmphur)   setAmphurId(selectedAmphur.amphurId);
			if (selectedTambon)   setTambonId(selectedTambon.tambonId);
		}
	}, [isAdmin, selectedProvince, selectedAmphur, selectedTambon]);

	// lookup maps สำหรับ display + filter
	const tambonMap = new Map(allTambons.map((t) => [t.tambonId, t]));
	const amphurMap = new Map(allAmphurs.map((a) => [a.amphurId, a]));
	const provinceMap = new Map(provinces.map((p) => [p.provinceId, p.nameTh]));

	const lookupGeo = (tid: number) => {
		const t = tambonMap.get(tid);
		const a = t ? amphurMap.get(t.amphurId) : undefined;
		const pName = a ? provinceMap.get(a.provinceId) : undefined;
		return {
			tambonName: t?.nameTh || "-",
			amphurName: a?.nameTh || "-",
			provinceName: pName || "-",
			zipcode: t?.zipcode || "-",
		};
	};

	// filter ตามลำดับชั้นพื้นที่ + search
	const scoped = tableData.filter((v) => {
		if (tambonId !== "") return v.tambonId === tambonId;
		if (amphurId !== "") {
			const t = tambonMap.get(v.tambonId);
			return t?.amphurId === amphurId;
		}
		if (provinceId !== "") {
			const t = tambonMap.get(v.tambonId);
			const a = t ? amphurMap.get(t.amphurId) : undefined;
			return a?.provinceId === provinceId;
		}
		return true;
	});

	const filtered = scoped.filter((v) => {
		const q = search.toLowerCase();
		if (!q) return true;
		const g = lookupGeo(v.tambonId);
		return (
			v.villageName.toLowerCase().includes(q) ||
			(v.moo || "").includes(q) ||
			g.tambonName.toLowerCase().includes(q) ||
			g.amphurName.toLowerCase().includes(q) ||
			g.provinceName.toLowerCase().includes(q) ||
			g.zipcode.includes(q)
		);
	});

	const isAllSelected = filtered.length > 0 && filtered.every((v) => selectedIds.includes(v.villageId));
	const toggleSelectAll = (checked: boolean) => setSelectedIds(checked ? filtered.map((v) => v.villageId) : []);
	const toggleSelectOne = (id: number, checked: boolean) =>
		setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

	const enterVillage = (v: Village) => {
		setVillage({ villageId: v.villageId, villageName: v.villageName, moo: v.moo });
		setSelectedVillage({ villageId: v.villageId, tambonId: v.tambonId, villageName: v.villageName, moo: v.moo });
		router.push("/");
	};

	const clearVillage = () => {
		setVillage(null);
		setSelectedVillage(null);
		Swal.fire({ icon: "success", title: "ยกเลิกการเลือกแล้ว", timer: 1000, showConfirmButton: false });
	};

	// ===== ลบรายการที่เลือก =====
	const handleDeleteSelected = async () => {
		if (selectedIds.length === 0) {
			Swal.fire({ icon: "warning", title: "ยังไม่ได้เลือกรายการ", text: "กรุณาเลือกหมู่บ้านที่ต้องการลบอย่างน้อย 1 รายการ" });
			return;
		}

		const result = await Swal.fire({
			icon: "warning",
			title: "ยืนยันการลบ?",
			html: `คุณกำลังจะลบข้อมูลหมู่บ้านจำนวน <b>${selectedIds.length}</b> รายการ<br/>หากมีครัวเรือนอยู่ภายในจะลบไม่ได้`,
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
				selectedIds.map((id) => axios.delete(`/villages/${id}`))
			);
			const failed = responses.filter((r) => r.status === "rejected").length;
			const success = selectedIds.length - failed;
			await fetchData();

			if (failed === 0) {
				Swal.fire({ icon: "success", title: "ลบสำเร็จ", text: `ลบหมู่บ้านเรียบร้อย ${success} รายการ`, timer: 1800, showConfirmButton: false });
			} else {
				Swal.fire({ icon: "warning", title: "ลบบางส่วนไม่สำเร็จ", text: `สำเร็จ ${success} รายการ, ล้มเหลว ${failed} รายการ` });
			}
		} catch (error) {
			console.error(error);
			Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถลบข้อมูลได้ กรุณาตรวจสอบสิทธิ์หรือลองใหม่อีกครั้ง" });
		} finally {
			setLoading(false);
		}
	};

	const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";
	const lockBadge = (label: string) => (
		<span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-blue-50 dark:bg-white/10 px-3 h-9 text-sm text-blue-700 dark:text-white/70">
			<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
				<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
			</svg>
			{label}
		</span>
	);

	return (
		<>
			<ComponentCard title=''>
				<div className="flex flex-wrap items-center justify-between gap-2 mb-4">
					<div className="flex flex-wrap items-center gap-3">
						<h3 className="text-lg font-semibold text-gray-800 dark:text-white">
							หมู่บ้าน (Village)
						</h3>

						{/* จังหวัด */}
						{isAdmin ? (
							<select className={selCls} value={provinceId} onChange={(e) => { setProvinceId(e.target.value ? Number(e.target.value) : ""); setAmphurId(""); setTambonId(""); }}>
								<option value="">-- จังหวัด --</option>
								{provinces.map((p) => <option key={p.provinceId} value={p.provinceId}>{p.nameTh}</option>)}
							</select>
						) : lockBadge(selectedProvince?.nameTh || "จังหวัดของคุณ")}

						{/* อำเภอ */}
						{isAdmin ? (
							<select className={selCls} value={amphurId} onChange={(e) => { setAmphurId(e.target.value ? Number(e.target.value) : ""); setTambonId(""); }}>
								<option value="">-- อำเภอ --</option>
								{(provinceId !== "" ? allAmphurs.filter((a) => a.provinceId === provinceId) : allAmphurs).map((a) => (
									<option key={a.amphurId} value={a.amphurId}>{a.nameTh}</option>
								))}
							</select>
						) : isProvince ? (
							<select className={selCls} value={amphurId} onChange={(e) => { setAmphurId(e.target.value ? Number(e.target.value) : ""); setTambonId(""); }}>
								<option value="">-- ทุกอำเภอ --</option>
								{allAmphurs.map((a) => <option key={a.amphurId} value={a.amphurId}>{a.nameTh}</option>)}
							</select>
						) : lockBadge(selectedAmphur?.nameTh || "อำเภอของคุณ")}

						{/* ตำบล */}
						{isAdmin ? (
							<select className={selCls} value={tambonId} onChange={(e) => setTambonId(e.target.value ? Number(e.target.value) : "")}>
								<option value="">-- ตำบล --</option>
								{(amphurId !== "" ? allTambons.filter((t) => t.amphurId === amphurId) : allTambons).map((t) => (
									<option key={t.tambonId} value={t.tambonId}>{t.nameTh}</option>
								))}
							</select>
						) : isProvince || isAmphur ? (
							<select className={selCls} value={tambonId} onChange={(e) => setTambonId(e.target.value ? Number(e.target.value) : "")}>
								<option value="">-- ทุกตำบล --</option>
								{(amphurId !== "" ? allTambons.filter((t) => t.amphurId === Number(amphurId)) : allTambons).map((t) => (
									<option key={t.tambonId} value={t.tambonId}>{t.nameTh}</option>
								))}
							</select>
						) : isTambon ? (
							lockBadge(selectedTambon?.nameTh || "ตำบลของคุณ")
						) : null}
					</div>

					<div className="flex items-center gap-2">
						<input
							type="text"
							placeholder="ค้นหา..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className={selCls}
						/>
						{canDelete("/village") && (
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

						{(userRole !== "VILLAGE") && (
						<a
							href="/village/add"
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

				<p className="text-xs text-gray-500 dark:text-gray-400 mb-2">  คลิก &ldquo;เลือกจัดการ&rdquo; หรือดับเบิ้ลคลิกที่แถว เพื่อเริ่มจัดการข้อมูลหมู่บ้านนั้น</p>

				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
					<div className="max-w-full overflow-x-auto">
						<div className="min-w-[1050px]">
							<Table>
								<TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
									<TableRow>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
											<div className="flex items-center justify-center">
												<Checkbox checked={isAllSelected} onChange={toggleSelectAll} />
											</div>
										</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">หมู่ที่</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ชื่อหมู่บ้าน</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ตำบล</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">อำเภอ</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">จังหวัด</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ไปรษณีย์</TableCell>
										<TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
									</TableRow>
								</TableHeader>

								<TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
									{filtered.map((v) => {
										const isSelected = selectedIds.includes(v.villageId);
										const isActive = activeVillage?.villageId === v.villageId;
										const g = lookupGeo(v.tambonId);
										return (
											<TableRow
												key={v.villageId}
												onDoubleClick={() => enterVillage(v)}
												title="ดับเบิ้ลคลิกเพื่อเข้าใช้งานหมู่บ้านนี้"
												className={`cursor-pointer ${isActive ? "bg-emerald-50 dark:bg-emerald-500/10" : isSelected ? "bg-red-50 dark:bg-red-500/10" : ""}`}
											>
												<TableCell className="px-4 py-3 text-center">
													<div className="flex items-center justify-center">
														<Checkbox checked={isSelected} onChange={(checked) => toggleSelectOne(v.villageId, checked)} />
													</div>
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
													{v.moo || "-"}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-700 text-center text-theme-sm dark:text-gray-300">
													{v.villageName}
													{isActive && (
														<span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
															ใช้งานอยู่
														</span>
													)}
												</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{g.tambonName}</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{g.amphurName}</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{g.provinceName}</TableCell>
												<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{g.zipcode}</TableCell>
												<TableCell className="px-4 py-3 text-center">
													<div className="flex items-center justify-center gap-2">
														{/* ปุ่มเลือกจัดการ */}
														{isActive ? (
															<div className="flex items-center gap-2">
																<span className="inline-flex items-center gap-1 rounded-full border border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
																	<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
																	</svg>
																	กำลังจัดการ
																</span>
																<button
																	onClick={(e) => { e.stopPropagation(); clearVillage(); }}
																	className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors dark:border-red-700/50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
																>
																	<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
																	</svg>
																	ยกเลิก
																</button>
															</div>
														) : (
															<button
																onClick={() => enterVillage(v)}
																className="inline-flex items-center gap-1 rounded-full border border-blue-500 bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition-colors"
															>
																<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
																	<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
																</svg>
																เลือกจัดการ
															</button>
														)}
														{canEdit("/village") && (
															<a
																href={`/village/edit?id=${v.villageId}`}
																className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 hover:border-yellow-600"
															>
																<svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
																	<path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
																</svg>
															</a>
														)}
													</div>
												</TableCell>
											</TableRow>
										);
									})}

									{filtered.length === 0 && (
										<TableRow>
											<TableCell className="px-4 py-6 text-center text-gray-400 text-theme-sm">
												ไม่พบหมู่บ้าน
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
