"use client"
import ComponentCard from '@/components/common/ComponentCard';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from "react"
const axios = require('axios');

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

	const [tableData, setData] = useState<VisitLog[]>([]);
	const [personMap, setPersonMap] = useState<Map<number, string>>(new Map());

	useEffect(() => {
		document.title = "Smart Village | Visit Log"
		const token = localStorage.getItem("token");
		const headers = { "Authorization": `Bearer ${token}` };

		Promise.all([
			axios.request({ method: 'get', maxBodyLength: Infinity, url: 'http://43.229.149.138:8080/smart_village/api/visit-logs', headers }),
			axios.request({ method: 'get', maxBodyLength: Infinity, url: 'http://43.229.149.138:8080/smart_village/api/persons', headers }),
		])
			.then(([logsRes, personsRes]: any[]) => {
				setData(logsRes.data);
				const map = new Map<number, string>();
				personsRes.data.forEach((p: Person) => {
					map.set(p.personId, `${p.firstName} ${p.lastName}`);
				});
				setPersonMap(map);
			})
			.catch((error: any) => {
				console.log(error);
			});
	}, []);

	return (
		<>
			<ComponentCard title=''>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white">
						บันทึกการเยี่ยมบ้าน (Visit Log)
					</h3>
					<a
						href="/visitlog/add"
						className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-green-700"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
						</svg>
						Add
					</a>
				</div>

				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
					<div className="max-w-full overflow-x-auto">
						<div className="min-w-[1102px]">
							<Table>
								<TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
									<TableRow>
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
									{tableData.map((log) => (
										<TableRow key={log.id}>
											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												{personMap.get(log.personId) || log.personId}
											</TableCell>
											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												{log.visitDate}
											</TableCell>
											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												{log.visitor}
											</TableCell>
											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												{log.visitReason}
											</TableCell>
											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												{log.summary || "-"}
											</TableCell>
											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												{log.nextAction || "-"}
											</TableCell>
											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												<div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-center">
													<a href={`/visitlog/edit?id=${log.id}`} className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 hover:border-yellow-600">
														<svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
															<path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
														</svg>
													</a>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>
			</ComponentCard>
		</>
	)
}

