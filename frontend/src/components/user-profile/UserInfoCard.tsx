"use client"
import React, { useState } from "react";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import type { CurrentUser } from "@/context/CurrentUserContext";

interface Props {
  profile: CurrentUser;
  onReload: () => Promise<void> | void;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN:    "ผู้ดูแลระบบ",
  PROVINCE: "ผู้ใช้ระดับจังหวัด",
  AMPHUR:   "ผู้ใช้ระดับอำเภอ",
  TAMBON:   "ผู้ใช้ระดับตำบล",
  VILLAGE:  "ผู้ใช้ระดับหมู่บ้าน",
};

export default function UserInfoCard({ profile, onReload }: Props) {
  const editName = useModal();
  const editPwd  = useModal();

  // ── edit name state ──
  const [fullName, setFullName] = useState(profile.fullName || "");
  const [savingName, setSavingName] = useState(false);
  const [nameErrors, setNameErrors] = useState<Record<string, string>>({});

  // ── change password state ──
  const [pwd, setPwd] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});

  const setPwdField = (field: keyof typeof pwd, value: string) => {
    setPwd((p) => ({ ...p, [field]: value }));
    // เคลียร์ error ของ field ที่กำลังพิมพ์ + form-level error
    setPwdErrors((e) => {
      const next = { ...e };
      delete next[field];
      delete next.form;
      return next;
    });
  };

  const openEditName = () => {
    setFullName(profile.fullName || "");
    setNameErrors({});
    editName.openModal();
  };

  const openEditPwd = () => {
    setPwd({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setPwdErrors({});
    editPwd.openModal();
  };

  const validateName = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "กรุณากรอกชื่อ-สกุล";
    setNameErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePwd = (): boolean => {
    const errs: Record<string, string> = {};
    if (!pwd.oldPassword) errs.oldPassword = "กรุณากรอกรหัสผ่านเดิม";
    if (!pwd.newPassword) errs.newPassword = "กรุณากรอกรหัสผ่านใหม่";
    else if (pwd.newPassword.length < 6) errs.newPassword = "ต้องยาวอย่างน้อย 6 ตัวอักษร";
    if (pwd.newPassword !== pwd.confirmPassword) errs.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    setPwdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveName = async () => {
    if (!validateName()) return;
    setSavingName(true);
    try {
      await axios.put("/profile/me", { fullName: fullName.trim() });
      await onReload();
      editName.closeModal();
      Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: err?.response?.data?.message || "กรุณาลองใหม่" });
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePwd = async () => {
    if (!validatePwd()) return;
    setSavingPwd(true);
    try {
      await axios.post("/profile/me/password", {
        oldPassword: pwd.oldPassword,
        newPassword: pwd.newPassword,
      });
      editPwd.closeModal();
      Swal.fire({ icon: "success", title: "เปลี่ยนรหัสผ่านสำเร็จ", timer: 1800, showConfirmButton: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "กรุณาลองใหม่";
      // backend ตอบ "รหัสผ่านเดิมไม่ถูกต้อง" → ผูกกับ field oldPassword ให้ผู้ใช้แก้ในที่เดียว
      if (msg.includes("รหัสผ่านเดิม") || msg.toLowerCase().includes("old")) {
        setPwdErrors({ oldPassword: msg });
      } else {
        setPwdErrors({ form: msg });
      }
    } finally {
      setSavingPwd(false);
    }
  };

  const inputCls = (err?: string) =>
    `${err ? "border-red-500" : "border-gray-300 dark:border-gray-700"} w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:bg-gray-900 dark:text-white`;

  const roleLabel = ROLE_LABEL[profile.roleLevel] || profile.roleLevel;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
            ข้อมูลส่วนตัว
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Username</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 font-mono">
                {profile.username}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">ชื่อ-สกุล</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile.fullName || "-"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">ระดับสิทธิ์</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{roleLabel}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">พื้นที่รับผิดชอบ</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile.scopeLabel}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:items-end">
          <button
            onClick={openEditName}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            แก้ไขชื่อ-สกุล
          </button>
          <button
            onClick={openEditPwd}
            className="flex items-center justify-center gap-2 rounded-full border border-orange-400 bg-white px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-gray-800 dark:text-orange-300 dark:hover:bg-orange-500/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            เปลี่ยนรหัสผ่าน
          </button>
        </div>
      </div>

      {/* ── Modal: แก้ชื่อ-สกุล ────────────────────────────────────── */}
      <Modal isOpen={editName.isOpen} onClose={editName.closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">แก้ไขชื่อ-สกุล</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">อัปเดตชื่อที่แสดงในระบบ</p>
          </div>
          <div className="px-2 pb-2">
            <Label>ชื่อ-สกุล</Label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputCls(nameErrors.fullName)}
              placeholder="กรอกชื่อ-สกุล"
            />
            {nameErrors.fullName && <p className="mt-1 text-xs text-red-500">{nameErrors.fullName}</p>}
          </div>
          <div className="flex items-center justify-end gap-3 px-2 mt-6">
            <Button size="sm" variant="outline" onClick={editName.closeModal} disabled={savingName}>ยกเลิก</Button>
            <Button size="sm" onClick={handleSaveName} disabled={savingName}>
              {savingName ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: เปลี่ยนรหัสผ่าน ─────────────────────────────────── */}
      <Modal isOpen={editPwd.isOpen} onClose={editPwd.closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">เปลี่ยนรหัสผ่าน</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">กรุณายืนยันรหัสผ่านเดิมก่อนตั้งใหม่</p>
          </div>
          <div className="grid grid-cols-1 gap-y-4 px-2 pb-2">
            {pwdErrors.form && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                {pwdErrors.form}
              </div>
            )}
            <div>
              <Label>รหัสผ่านเดิม</Label>
              <Input
                type="password"
                value={pwd.oldPassword}
                onChange={(e) => setPwdField("oldPassword", e.target.value)}
                error={!!pwdErrors.oldPassword}
              />
              {pwdErrors.oldPassword && <p className="mt-1 text-xs text-red-500">{pwdErrors.oldPassword}</p>}
            </div>
            <div>
              <Label>รหัสผ่านใหม่</Label>
              <Input
                type="password"
                value={pwd.newPassword}
                onChange={(e) => setPwdField("newPassword", e.target.value)}
              />
              {pwdErrors.newPassword && <p className="mt-1 text-xs text-red-500">{pwdErrors.newPassword}</p>}
            </div>
            <div>
              <Label>ยืนยันรหัสผ่านใหม่</Label>
              <Input
                type="password"
                value={pwd.confirmPassword}
                onChange={(e) => setPwdField("confirmPassword", e.target.value)}
              />
              {pwdErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{pwdErrors.confirmPassword}</p>}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-2 mt-6">
            <Button size="sm" variant="outline" onClick={editPwd.closeModal} disabled={savingPwd}>ยกเลิก</Button>
            <Button size="sm" onClick={handleSavePwd} disabled={savingPwd}>
              {savingPwd ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
