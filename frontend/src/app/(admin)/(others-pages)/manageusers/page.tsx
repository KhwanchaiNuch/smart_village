"use client"
import ComponentCard from "@/components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

interface AppUser {
  userId: number;
  username: string;
  fullName: string | null;
  roleLevel: string;
  scopeId: number | null;
  isActive: boolean;
  createdAt: string | null;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN:    { bg: "bg-purple-100", text: "text-purple-700", label: "ผู้ดูแลระบบ"          },
  PROVINCE: { bg: "bg-blue-100",   text: "text-blue-700",   label: "ผู้ใช้ระดับจังหวัด"   },
  AMPHUR:   { bg: "bg-indigo-100", text: "text-indigo-700", label: "ผู้ใช้ระดับอำเภอ"     },
  TAMBON:   { bg: "bg-cyan-100",   text: "text-cyan-700",   label: "ผู้ใช้ระดับตำบล"      },
  VILLAGE:  { bg: "bg-green-100",  text: "text-green-700",  label: "ผู้ใช้ระดับหมู่บ้าน"  },
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get<AppUser[]>("/admin/users");
      setUsers(res.data);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ", text: err?.response?.data?.message || "กรุณาลองใหม่" });
    }
  }, []);

  useEffect(() => {
    document.title = "Smart Village | จัดการผู้ใช้";
    fetchData();
  }, [fetchData]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.roleLevel || "").toLowerCase().includes(q);
  });

  const handleToggle = async (user: AppUser) => {
    const action = user.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน";
    const result = await Swal.fire({
      icon: "question",
      title: `${action} user?`,
      html: `<b>${user.username}</b>`,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: user.isActive ? "#dc2626" : "#16a34a",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await axios.patch(`/admin/users/${user.userId}/toggle`);
      await fetchData();
      Swal.fire({ icon: "success", title: `${action}สำเร็จ`, timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: AppUser) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ?",
      html: `ลบ user <b>${user.username}</b>`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await axios.delete(`/admin/users/${user.userId}`);
      await fetchData();
      Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const selCls = "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  return (
    <div className="space-y-5">
      <ComponentCard title="">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">จัดการผู้ใช้งานระบบ</h3>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} className={selCls} />
            <a href="/manageusers/add"
              className="flex items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              เพิ่มผู้ใช้
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Username</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ชื่อ-สกุล</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">ระดับสิทธิ์</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Scope ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">สถานะ</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">วันที่สร้าง</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filtered.map((u) => {
                    const roleClr = ROLE_COLORS[u.roleLevel] || { bg: "bg-gray-100", text: "text-gray-600", label: u.roleLevel };
                    return (
                      <TableRow key={u.userId}>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 font-mono">
                          {u.username}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                          {u.fullName || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleClr.bg} ${roleClr.text}`}>
                            {roleClr.label}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                          {u.scopeId ?? "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />ใช้งาน
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />ปิดใช้งาน
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                          {u.createdAt ? u.createdAt.slice(0, 10) : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a href={`/manageusers/edit?id=${u.userId}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
                              title="แก้ไข">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                              </svg>
                            </a>
                            <button onClick={() => handleToggle(u)} disabled={loading}
                              title={u.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${u.isActive ? "bg-orange-400 hover:bg-orange-500" : "bg-green-500 hover:bg-green-600"}`}>
                              {u.isActive ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                              )}
                            </button>
                            <button onClick={() => handleDelete(u)} disabled={loading}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell className="px-4 py-8 text-center text-gray-400 text-theme-sm">ไม่มีข้อมูลผู้ใช้</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
