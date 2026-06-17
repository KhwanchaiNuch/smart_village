"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useVillage } from "../context/VillageContext";
import { usePermission } from "../context/PermissionContext";
import { useCurrentUser, resolveAvatarSrc } from "../context/CurrentUserContext";
import {
	BoxCubeIcon,
	InfoIcon,
	CalenderIcon,
	ChevronDownIcon,
	GridIcon,
	HorizontaLDots,
	ListIcon,
	PageIcon,
	PieChartIcon,
	PlugInIcon,
	TableIcon,
	UserCircleIcon,
	HeartIcon,
	TimeIcon,
	TrainingIcon,
	CommunityIssueIcon,
	HouseholdEconomicIcon,
	PersonSkillIcon,
	VillageSurveyIcon,
	VillageResourceIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
	name: string;
	icon: React.ReactNode;
	path?: string;
	subItems?: { name: string; path: string; icon?: React.ReactNode; pro?: boolean; new?: boolean }[];
};

const PinIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
		<path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
		<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
	</svg>
);

const adminNavItems: NavItem[] = [
	{ icon: <GridIcon />, name: "Dashboard", path: "/" },
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
				<path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
			</svg>
		),
		name: "ข้อมูลพื้นที่",
		subItems: [
			{ icon: PinIcon, name: "จังหวัด", path: "/province" },
			{ icon: PinIcon, name: "อำเภอ", path: "/amphur" },
			{ icon: PinIcon, name: "ตำบล", path: "/tambon" },
			{ icon: PinIcon, name: "หมู่บ้าน", path: "/village" },
		],
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
				<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
			</svg>
		),
		name: "จัดการหมู่บ้าน",
		subItems: [
			{ icon: <GridIcon/>, name: "Dashboard หมู่บ้าน", path: "/village-dashboard" },
			{ icon: <CalenderIcon/>, name: "รหัสครัวเรือน", path: "/household" },
			{ icon: <UserCircleIcon/>, name: "บุคคล", path: "/person" },
			{ icon: <HeartIcon/>, name: "บันทึกสุขภาพ", path: "/healthrecord" },
			{ icon: <TimeIcon/>, name: "เยี่ยมบ้าน", path: "/visitlog" },
			{ icon: <TrainingIcon/>, name: "อบรมพัฒนา", path: "/training" },
			{ icon: <CommunityIssueIcon/>, name: "ปัญหาชุมชน", path: "/communityissue" },
			{ icon: <HouseholdEconomicIcon/>, name: "เศรษฐกิจครัวเรือน", path: "/householdeconomic" },
			{ icon: <PersonSkillIcon/>, name: "ทักษะบุคคล", path: "/personskill" },
			{ icon: <VillageSurveyIcon/>, name: "ความต้องการชุมชน", path: "/villagesurvey" },
			{ icon: <VillageResourceIcon/>, name: "ทรัพยากรชุมชน", path: "/villageresource" },
		],
	},
];

const villagerNavItems: NavItem[] = [
	{ icon: <GridIcon />, name: "หน้าแรก", path: "/villager" },
	{ icon: <UserCircleIcon />, name: "ข้อมูลของฉัน", path: "/villager" },
];

const othersItems: NavItem[] = [
	{
		icon: <PieChartIcon />,
		name: "Charts",
		subItems: [
			{ name: "Line Chart", path: "/line-chart", pro: false },
			{ name: "Bar Chart", path: "/bar-chart", pro: false },
		],
	},
	{
		icon: <BoxCubeIcon />,
		name: "UI Elements",
		subItems: [
			{ name: "Alerts", path: "/alerts", pro: false },
			{ name: "Avatar", path: "/avatars", pro: false },
			{ name: "Badge", path: "/badge", pro: false },
			{ name: "Buttons", path: "/buttons", pro: false },
			{ name: "Images", path: "/images", pro: false },
			{ name: "Videos", path: "/videos", pro: false },
		],
	},
	{
		icon: <PlugInIcon />,
		name: "Authentication",
		subItems: [
			{ name: "Sign In", path: "/signin", pro: false },
			{ name: "Sign Up", path: "/signup", pro: false },
		],
	},
];

const AppSidebar: React.FC = () => {
	const { isExpanded, isMobileOpen } = useSidebar();
	const pathname = usePathname();
	const { canView, loading: permLoading } = usePermission();

	const { village, setVillage } = useVillage();
	const { user: currentUser } = useCurrentUser();
	const router = useRouter();

	const changeVillage = () => {
		setVillage(null);
		router.push("/village");
	};

	const [role, setRole] = useState<string | null>(null);
	useEffect(() => {
		setRole(localStorage.getItem("role"));
	}, []);

	// PROVINCE/AMPHUR/TAMBON ไม่ต้องเลือกหมู่บ้าน → เห็น sub-items ทั้งหมดทันที
	const higherRoles = ["PROVINCE", "AMPHUR", "TAMBON"];
	const isHigherRole = role !== null && higherRoles.includes(role);

	// gate: ยังไม่เลือกหมู่บ้าน → "จัดการหมู่บ้าน" เป็นลิงก์ตรงไปหน้าเลือกพื้นที่
	//        เลือกแล้ว (หรือ higher role) → กลายเป็นกลุ่มเมนูย่อยตามปกติ
	const villageGatedNavItems: NavItem[] = adminNavItems
		.filter((item) => item.name !== "ข้อมูลพื้นที่" || role === "ADMIN")
		.map((item) => {
			if (item.name === "จัดการหมู่บ้าน" && item.subItems) {
				return (village || isHigherRole)
					? item
					: { icon: item.icon, name: item.name, path: "/village" };
			}
			return item;
		});

	const computedAdminNavItems: NavItem[] = [
		...villageGatedNavItems,
		...(role === "ADMIN" ? [
			{
				icon: (
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
					</svg>
				),
				name: "จัดการผู้ใช้",
				path: "/manageusers",
			},
			{
				icon: (
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
					</svg>
				),
				name: "ระบบสิทธิ์",
				subItems: [
					{ name: "จัดการ Role", path: "/role" },
					{ name: "จัดการ Menu", path: "/menu" },
					{ name: "ตั้งค่าสิทธิ์", path: "/permission" },
				],
			},
		] : []),
	];

	// ซ่อน menu item ที่ user ไม่มี canView (หลัง permissions โหลดแล้ว)
	const filteredNavItems = permLoading
		? computedAdminNavItems
		: computedAdminNavItems.filter((item) => {
				if (item.subItems) return true; // submenu group (admin-only ถูกจัดการแล้วข้างบน)
				if (!item.path) return true;
				return canView(item.path);
		  });
	const activeNavItems = filteredNavItems;

	const [openSubmenu, setOpenSubmenu] = useState<{
		type: "main" | "others";
		index: number;
	} | null>(null);
	const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
	const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

	const isActive = useCallback((path: string) => {
		if (path === "/") return pathname === "/";
		return pathname === path || pathname.startsWith(path + "/") || pathname.startsWith(path + "?");
	}, [pathname]);

	useEffect(() => {
		let submenuMatched = false;
		["main", "others"].forEach((menuType) => {
			const items = menuType === "main" ? activeNavItems : othersItems;
			items.forEach((nav, index) => {
				if (nav.subItems) {
					nav.subItems.forEach((subItem) => {
						if (isActive(subItem.path)) {
							setOpenSubmenu({ type: menuType as "main" | "others", index });
							submenuMatched = true;
						}
					});
				}
			});
		});
		if (!submenuMatched) setOpenSubmenu(null);
	}, [pathname, isActive]);

	useEffect(() => {
		if (openSubmenu !== null) {
			const key = `${openSubmenu.type}-${openSubmenu.index}`;
			if (subMenuRefs.current[key]) {
				setSubMenuHeight((prevHeights) => ({
					...prevHeights,
					[key]: subMenuRefs.current[key]?.scrollHeight || 0,
				}));
			}
		}
	}, [openSubmenu]);

	const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
		setOpenSubmenu((prevOpenSubmenu) => {
			if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
				return null;
			}
			return { type: menuType, index };
		});
	};

	const renderMenuItems = (
		navItems: NavItem[],
		menuType: "main" | "others"
	) => (
		<ul className="flex flex-col gap-1">
			{navItems.map((nav, index) => {
				const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
				return (
					<li key={nav.name}>
						{nav.subItems ? (
							<button
								onClick={() => handleSubmenuToggle(index, menuType)}
								className={`menu-item group ${isSubmenuOpen ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`}
							>
								<span className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${isSubmenuOpen ? "bg-white/20 text-white" : "menu-item-icon-inactive"}`}>
									{nav.icon}
								</span>
								{(isExpanded || isMobileOpen) && (
									<span className="menu-item-text">{nav.name}</span>
								)}
								{(isExpanded || isMobileOpen) && (
									<ChevronDownIcon
										className={`ml-auto w-5 h-5 transition-transform duration-200 ${isSubmenuOpen ? "rotate-180 text-white" : "text-white/60"}`}
									/>
								)}
							</button>
						) : (
							nav.path && (
								<Link
									href={nav.path}
									className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
								>
									<span className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${isActive(nav.path) ? "bg-white/20 text-white" : "menu-item-icon-inactive"}`}>
										{nav.icon}
									</span>
									{(isExpanded || isMobileOpen) && (
										<span className="menu-item-text">{nav.name}</span>
									)}
								</Link>
							)
						)}
						{nav.subItems && (isExpanded || isMobileOpen) && (
							<div
								ref={(el) => { subMenuRefs.current[`${menuType}-${index}`] = el; }}
								className="overflow-hidden transition-all duration-300"
								style={{
									height:
										openSubmenu?.type === menuType && openSubmenu?.index === index
											? `${subMenuHeight[`${menuType}-${index}`]}px`
											: "0px",
								}}
							>
								<ul className="mt-2 space-y-1 ml-9">
									{nav.subItems.filter(sub => permLoading || !sub.path || canView(sub.path)).map((subItem) => (
										<li key={subItem.name}>
											<Link
												href={subItem.path}
												className={`menu-dropdown-item flex items-center gap-2 ${
													isActive(subItem.path)
														? "menu-dropdown-item-active"
														: "menu-dropdown-item-inactive"
												}`}
											>
												{subItem.icon && (
													<span className="flex items-center justify-center w-5 h-5 flex-shrink-0 [&>svg]:!w-5 [&>svg]:!h-5">
														{subItem.icon}
													</span>
												)}
												{subItem.name}
												<span className="flex items-center gap-1 ml-auto">
													{subItem.new && (
														<span className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>
															new
														</span>
													)}
													{subItem.pro && (
														<span className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>
															pro
														</span>
													)}
												</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
						)}
					</li>
				);
			})}
		</ul>
	);

	return (
		<aside
			className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 border-[#2050bb] text-white h-screen transition-all duration-300 ease-in-out z-50 border-r overflow-hidden
        ${isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
		>
			{/* Sidebar background SVG */}
			<svg className="pointer-events-none absolute inset-0 w-full h-full" style={{zIndex: 0}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 911" preserveAspectRatio="none">
				<defs>
					<linearGradient id="cyberBg" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="#021754"/>
						<stop offset="40%" stopColor="#0B42BD"/>
						<stop offset="75%" stopColor="#2D82F7"/>
						<stop offset="100%" stopColor="#55A9FC"/>
					</linearGradient>
					<linearGradient id="layerGrad1" x1="100%" y1="100%" x2="0%" y2="0%">
						<stop offset="0%" stopColor="#ffffff" stopOpacity="0.22"/>
						<stop offset="80%" stopColor="#ffffff" stopOpacity="0.0"/>
					</linearGradient>
					<linearGradient id="layerGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="#ffffff" stopOpacity="0.0"/>
						<stop offset="50%" stopColor="#ffffff" stopOpacity="0.12"/>
						<stop offset="100%" stopColor="#ffffff" stopOpacity="0.28"/>
					</linearGradient>
					<linearGradient id="layerGrad3" x1="100%" y1="100%" x2="0%" y2="0%">
						<stop offset="0%" stopColor="#ffffff" stopOpacity="0.05"/>
						<stop offset="100%" stopColor="#ffffff" stopOpacity="0.18"/>
					</linearGradient>
					<radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="#ffffff" stopOpacity="0.85"/>
						<stop offset="40%" stopColor="#AEE5FF" stopOpacity="0.35"/>
						<stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
					</radialGradient>
				</defs>
				<rect width="360" height="911" fill="url(#cyberBg)"/>
				<polygon points="360,550 0,280 0,911 360,911" fill="url(#layerGrad3)" opacity="0.4"/>
				<polygon points="360,720 0,420 0,650 360,880" fill="url(#layerGrad1)" opacity="0.65"/>
				<polygon points="380,830 -20,480 -20,930 380,930" fill="url(#layerGrad2)"/>
				<polygon points="360,760 140,911 360,911" fill="url(#layerGrad1)" opacity="0.5"/>
				<line x1="-10" y1="280" x2="370" y2="550" stroke="#ffffff" strokeWidth="1.2" opacity="0.15"/>
				<line x1="-10" y1="420" x2="370" y2="720" stroke="#ffffff" strokeWidth="2" opacity="0.25"/>
				<line x1="-10" y1="480" x2="370" y2="830" stroke="#ffffff" strokeWidth="2.5" opacity="0.3"/>
				<line x1="-10" y1="520" x2="370" y2="880" stroke="#ffffff" strokeWidth="1" opacity="0.15"/>
				<line x1="360" y1="620" x2="80" y2="911" stroke="#ffffff" strokeWidth="1" opacity="0.08"/>
				<circle cx="110" cy="360" r="7" fill="url(#orbGlow)"/>
				<circle cx="290" cy="490" r="5" fill="url(#orbGlow)" opacity="0.6"/>
				<circle cx="70" cy="580" r="9" fill="url(#orbGlow)" opacity="0.5"/>
				<circle cx="210" cy="710" r="6" fill="url(#orbGlow)"/>
				<circle cx="130" cy="800" r="8" fill="url(#orbGlow)" opacity="0.7"/>
				<circle cx="280" cy="830" r="5" fill="url(#orbGlow)" opacity="0.5"/>
			</svg>

			<div
				className={`relative z-10 py-8 flex  ${!isExpanded ? "lg:justify-center" : "justify-start"}`}
			>
				<Link href={role === "VILLAGE" ? "/villager" : "/"} className="flex items-center gap-3">
					<img src="/images/logo/logo-m.svg" alt="Logo" className="flex-shrink-0 w-9 h-9" />
					{(isExpanded || isMobileOpen) && (
						<span className="text-xl font-bold text-white tracking-wide">M6</span>
					)}
				</Link>
			</div>
			{/* Active village / scope banner */}
			{role !== "VILLAGE" && (isExpanded || isMobileOpen) && (
				<div className="relative z-10 mb-4 rounded-xl bg-white/10 border border-white/20 px-3 py-2">
					{isHigherRole ? (
						/* PROVINCE / AMPHUR / TAMBON → แสดง scope level */
						<>
							<p className="text-[10px] uppercase tracking-wide text-white/50">ขอบเขตการดูแล</p>
							<p className="text-sm font-semibold text-white">
								{role === "PROVINCE" && "ระดับจังหวัด"}
								{role === "AMPHUR"   && "ระดับอำเภอ"}
								{role === "TAMBON"   && "ระดับตำบล"}
							</p>
							<p className="text-[11px] text-white/60">ดูข้อมูลทั้งหมดในพื้นที่รับผิดชอบ</p>
						</>
					) : village ? (
						/* ADMIN เลือกหมู่บ้านแล้ว */
						<>
							<p className="text-[10px] uppercase tracking-wide text-white/50">หมู่บ้านที่ใช้งาน</p>
							<p className="text-sm font-semibold text-white truncate">
								{village.villageName}{village.moo ? ` (หมู่ ${village.moo})` : ""}
							</p>
							<button onClick={changeVillage} className="text-[11px] text-white/70 hover:text-white underline">
								เปลี่ยนพื้นที่
							</button>
						</>
					) : (
						/* ADMIN ยังไม่ได้เลือกหมู่บ้าน */
						<p className="text-xs text-white/70 leading-snug">
							⚠️ ยังไม่ได้เลือกหมู่บ้าน<br />ไปที่ <strong>ข้อมูลพื้นที่ › หมู่บ้าน</strong> แล้วดับเบิ้ลคลิกที่หมู่บ้าน
						</p>
					)}
				</div>
			)}
			<div className="relative z-10 flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
				<nav className="mb-6">
					<div className="flex flex-col gap-4">
						<div>
							<h2
								className={`mb-4 text-xs uppercase flex leading-[20px] text-white/50 ${!isExpanded
									? "lg:justify-center"
									: "justify-start"
									}`}
							>
								{isExpanded || isMobileOpen ? "Menu" : <HorizontaLDots />}
							</h2>
							{renderMenuItems(activeNavItems, "main")}
						</div>
					</div>
				</nav>
			</div>

			{/* User profile - bottom of sidebar */}
			<div className={`mt-auto pb-6 pt-4 border-t border-white/20 flex flex-col items-center gap-2 relative z-10`}>
				<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 flex-shrink-0">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						key={resolveAvatarSrc(currentUser?.avatarUrl)}
						src={resolveAvatarSrc(currentUser?.avatarUrl)}
						alt={currentUser?.fullName || currentUser?.username || "User"}
						className="w-full h-full object-cover"
					/>
				</div>
				{(isExpanded || isMobileOpen) && (
					<div className="text-center">
						<p className="text-white text-sm font-medium leading-tight truncate max-w-[200px]">
							{currentUser?.fullName || currentUser?.username || (role === "VILLAGE" ? "ลูกบ้าน" : "ผู้ดูแลระบบ")}
						</p>
						<p className="text-white/60 text-xs mt-0.5">
							{role === "VILLAGE" ? "Village" : role === "ADMIN" ? "Admin" : role || ""}
						</p>
					</div>
				)}
			</div>
		</aside>
	);
};

export default AppSidebar;
