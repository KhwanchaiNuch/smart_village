"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Badge from '@/components/ui/badge/Badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from "react"
const axios = require('axios');

export default function HealthRecord() {

	interface HealthRecord {
    "id": number,
    "personId": number,
    "needHomeVisit": boolean
  }

	const [tableData, setData] = useState<HealthRecord[]>([]);

	useEffect(() => {
		document.title = "Smart Village | Health Records"
		async function fetchData() {
			try {
				let rawtoken = localStorage.getItem("token");
				const token = rawtoken;
				let config = {
					method: 'get',
					maxBodyLength: Infinity,
					url: 'http://43.229.149.138:8080/smart_village/api/health-records',
					headers: {
						"Authorization": `Bearer ${token}`,

					}
				};
				axios.request(config)
					.then((response: any) => {
						console.log("[ RESPONSE ] PERSON DATAS =>", response.data);
						setData(response.data);
					})
					.catch((error: any) => {
						console.log(error);
					});
			} catch (err) {
				console.error(err);
			} finally {
			}
		}
		fetchData();
	}, []);


	return (
		<>
			<ComponentCard title=''>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white">
						สุขภาพเชิงตัวเลข (Health Records)
					</h3>
					<a
						href="/household/add"
						className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-green-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
							className="size-5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
							/>
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
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
										>
											ลำดับ
										</TableCell>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-ce text-theme-xs dark:text-gray-400"
										>
											ชื่อ
										</TableCell>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
										>
											นามสกุล
										</TableCell>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
										>
											อาชีพ
										</TableCell>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
										>
											ป่วย/มีโรคเรื้อรังหรือไม่
										</TableCell>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
										>
											ติดเตียงหรือไม่
										</TableCell>
										<TableCell
											isHeader
											className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
										>
											Action
										</TableCell>
									</TableRow>
								</TableHeader>



								{/* Table Body */}
								<TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
									{tableData.map((order) => (
										<TableRow key={order.personId}>

											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												{order.personId}
											</TableCell>
											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												{order.firstName}
											</TableCell>
											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												{order.lastName}
											</TableCell>

											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												{order.occupation}
											</TableCell>

											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												<Badge
													size="sm"
													color={
														order.isSick === true
															? "error"
															: order.isSick === false
																? "success"
																: "warning"
													}
												>
													{order.isSick === true
														? "ป่วย"
														: order.isSick === false
															? "ไม่ป่วย"
															: "ไม่มีข้อมูล"}
												</Badge>
											</TableCell>

											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												<Badge
													size="sm"
													color={
														order.isBedridden === true
															? "error"
															: order.isBedridden === false
																? "success"
																: "warning"
													}
												>
													{order.isBedridden === true
														? "ติดเตียง"
														: order.isBedridden === false
															? "ไม่ติดเตียง"
															: "ไม่มีข้อมูล"}
												</Badge>
											</TableCell>

											<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
												<div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-center">
													<a href={`/person/edit?id=${order.personId}`} className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 hover:border-yellow-600">
														<svg

															className="fill-current"
															width="20"
															height="20"
															viewBox="0 0 20 20"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																fillRule="evenodd"
																clipRule="evenodd"
																d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
																fill=""
															/>
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
			</ComponentCard >
		</>
	)
}