"use client"
import ComponentCard from "@/components/common/ComponentCard";
import React, { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

interface Role { id: number; name: string; status: boolean; }
interface Menu { id: number; name: string; url: string; status: boolean; }

interface PermEntry {
  canView:   boolean;
  canAdd:    boolean;
  canEdit:   boolean;
  canDelete: boolean;
}

interface MatrixData {
  roles:       Role[];
  menus:       Menu[];
  permissions: Array<{ roleId: number; menuId: number } & PermEntry>;
}

const CRUD: { field: keyof PermEntry; label: string }[] = [
  { field: "canView",   label: "View"   },
  { field: "canAdd",    label: "Add"    },
  { field: "canEdit",   label: "Edit"   },
  { field: "canDelete", label: "Del"    },
];

const EMPTY: PermEntry = { canView: false, canAdd: false, canEdit: false, canDelete: false };
const FULL:  PermEntry = { canView: true,  canAdd: true,  canEdit: true,  canDelete: true  };

type PermMap = Record<string, PermEntry>; // key = "roleId_menuId"

export default function PermissionPage() {
  const [data,   setData]   = useState<MatrixData | null>(null);
  const [perms,  setPerms]  = useState<PermMap>({});
  const [saving, setSaving] = useState(false);
  const [dirty,  setDirty]  = useState(false);

  const key = (roleId: number, menuId: number) => `${roleId}_${menuId}`;

  const fetchMatrix = useCallback(async () => {
    try {
      const res = await axios.get<MatrixData>("/role-menus/matrix");
      setData(res.data);
      const map: PermMap = {};
      res.data.permissions.forEach(p => {
        map[key(p.roleId, p.menuId)] = {
          canView:   p.canView,
          canAdd:    p.canAdd,
          canEdit:   p.canEdit,
          canDelete: p.canDelete,
        };
      });
      setPerms(map);
      setDirty(false);
    } catch {
      Swal.fire({ icon: "error", title: "โหลดข้อมูลไม่สำเร็จ" });
    }
  }, []);

  useEffect(() => {
    document.title = "Smart Village | ตั้งค่าสิทธิ์";
    fetchMatrix();
  }, [fetchMatrix]);

  // toggle สิทธิ์เดี่ยว
  const togglePerm = (roleId: number, menuId: number, field: keyof PermEntry) => {
    const k = key(roleId, menuId);
    setPerms(prev => ({
      ...prev,
      [k]: { ...(prev[k] ?? EMPTY), [field]: !(prev[k]?.[field] ?? false) },
    }));
    setDirty(true);
  };

  // header checkbox ของ Role column: toggle ALL menus × ALL CRUD สำหรับ role นั้น
  const isRoleFullyChecked = (roleId: number): boolean => {
    if (!data) return false;
    return data.menus.every(m =>
      CRUD.every(c => perms[key(roleId, m.id)]?.[c.field] === true)
    );
  };

  const toggleRoleAll = (roleId: number) => {
    if (!data) return;
    const full = isRoleFullyChecked(roleId);
    setPerms(prev => {
      const next = { ...prev };
      data.menus.forEach(m => {
        next[key(roleId, m.id)] = full ? { ...EMPTY } : { ...FULL };
      });
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      // flat list ของทุก role × menu combination
      const payload: Array<{ roleId: number; menuId: number } & PermEntry> = [];
      data.roles.forEach(r => {
        data.menus.forEach(m => {
          const p = perms[key(r.id, m.id)] ?? EMPTY;
          payload.push({ roleId: r.id, menuId: m.id, ...p });
        });
      });
      await axios.post("/role-menus/save-all", payload);
      await Swal.fire({ icon: "success", title: "บันทึกสิทธิ์สำเร็จ", timer: 1500, showConfirmButton: false });
      setDirty(false);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: err?.response?.data?.message });
    } finally { setSaving(false); }
  };

  // toggle ทุก CRUD ของ menu นั้นสำหรับ role เดียว
  const isMenuRoleFullyChecked = (roleId: number, menuId: number): boolean =>
    CRUD.every(c => perms[key(roleId, menuId)]?.[c.field] === true);

  const toggleMenuRoleAll = (roleId: number, menuId: number) => {
    const full = isMenuRoleFullyChecked(roleId, menuId);
    const k = key(roleId, menuId);
    setPerms(prev => ({ ...prev, [k]: full ? { ...EMPTY } : { ...FULL } }));
    setDirty(true);
  };

  if (!data) return <div className="p-8 text-center text-gray-400">กำลังโหลด...</div>;

  return (
    <PermissionGuard adminOnly>
    <ComponentCard title="ตั้งค่าสิทธิ์การเข้าถึงเมนู">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เลือกสิทธิ์ของแต่ละ Role ต่อเมนู แล้วกด <b>บันทึกสิทธิ์</b>
        </p>
        <div className="flex gap-2">
          <button onClick={fetchMatrix}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            รีเซ็ต
          </button>
          <button onClick={handleSave} disabled={saving || !dirty}
            className="px-5 py-2 text-sm rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 disabled:opacity-50">
            {saving ? "กำลังบันทึก..." : "บันทึกสิทธิ์"}
          </button>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              {/* Corner */}
              <th className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 px-4 py-3 text-left min-w-[220px]">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  เมนู / สิทธิ์
                </span>
              </th>
              {/* Role columns */}
              {data.roles.map(r => {
                const fully = isRoleFullyChecked(r.id);
                return (
                  <th key={r.id}
                    className="border-b border-r border-gray-200 dark:border-gray-700 px-4 py-3 text-center min-w-[100px] bg-gray-100 dark:bg-gray-800">
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-bold text-gray-800 dark:text-gray-100">{r.name}</span>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none group" title={fully ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}>
                        <input
                          type="checkbox"
                          checked={fully}
                          onChange={() => toggleRoleAll(r.id)}
                          className="w-4 h-4 accent-brand-600 cursor-pointer"
                        />
                        <span className="text-xs text-gray-400 dark:text-gray-500">ทั้งหมด</span>
                      </label>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {data.menus.map((m, idx) => {
              const menuBg    = idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/60 dark:bg-gray-800/40";
              const menuBgSticky = idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/60";
              const crudBg    = idx % 2 === 0 ? "bg-white/70 dark:bg-gray-900/70" : "bg-gray-50/40 dark:bg-gray-800/30";
              const crudBgSticky = idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/80" : "bg-gray-100/80 dark:bg-gray-700/60";

              return (
                <React.Fragment key={m.id}>
                  {/* — แถวชื่อเมนู + select-all per role สำหรับ menu นี้ — */}
                  <tr key={`menu-${m.id}`} className={menuBg}>
                    <td className={`sticky left-0 z-10 border-r border-b border-gray-200 dark:border-gray-700 px-4 py-2 ${menuBgSticky}`}>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{m.name}</span>
                        {m.url && (
                          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{m.url}</span>
                        )}
                      </div>
                    </td>
                    {data.roles.map(r => {
                      const menuFull = isMenuRoleFullyChecked(r.id, m.id);
                      return (
                        <td key={r.id}
                          className={`border-r border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-center ${menuBg}`}>
                          <input
                            type="checkbox"
                            checked={menuFull}
                            onChange={() => toggleMenuRoleAll(r.id, m.id)}
                            title={menuFull ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                            className="w-4 h-4 accent-brand-600 cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* — แถว CRUD — */}
                  {CRUD.map(({ field, label }) => (
                    <tr key={`${m.id}-${field}`} className={crudBg}>
                      <td className={`sticky left-0 z-10 border-r border-b border-gray-200 dark:border-gray-700 pl-8 pr-4 py-1.5 ${crudBgSticky}`}>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <span className="text-gray-300 dark:text-gray-600">└</span>
                          {label}
                        </span>
                      </td>
                      {data.roles.map(r => {
                        const k = key(r.id, m.id);
                        const checked = perms[k]?.[field] ?? false;
                        return (
                          <td key={r.id}
                            className={`border-r border-b border-gray-200 dark:border-gray-700 px-4 py-1.5 text-center ${crudBg}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePerm(r.id, m.id, field)}
                              className="w-3.5 h-3.5 accent-brand-600 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {dirty && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400">
          ⚠️ มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก — กด <b>บันทึกสิทธิ์</b> เพื่อยืนยัน
        </div>
      )}
    </ComponentCard>
    </PermissionGuard>
  );
}
