"use client"
import React, { useRef, useState } from "react";
import Image from "next/image";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { resolveAvatarSrc, type CurrentUser } from "@/context/CurrentUserContext";

interface Props {
  profile: CurrentUser;
  onReload: () => Promise<void> | void;
}

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  ADMIN:    { label: "ผู้ดูแลระบบ",          color: "bg-purple-100 text-purple-700" },
  PROVINCE: { label: "ผู้ใช้ระดับจังหวัด",   color: "bg-blue-100 text-blue-700"     },
  AMPHUR:   { label: "ผู้ใช้ระดับอำเภอ",     color: "bg-indigo-100 text-indigo-700" },
  TAMBON:   { label: "ผู้ใช้ระดับตำบล",      color: "bg-cyan-100 text-cyan-700"     },
  VILLAGE:  { label: "ผู้ใช้ระดับหมู่บ้าน",  color: "bg-green-100 text-green-700"   },
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const MAX_AVATAR_LABEL = "2 MB";
const ALLOWED_EXT = ["jpg", "jpeg", "png", "gif", "webp"];

// ── helper: format bytes → human readable (เช่น "1.45 MB", "812 KB") ──
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ── helper: ดึงนามสกุลจากชื่อไฟล์ ──
function getExt(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.substring(i + 1).toLowerCase() : "";
}

export default function UserMetaCard({ profile, onReload }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const role = ROLE_LABEL[profile.roleLevel] || {
    label: profile.roleLevel,
    color: "bg-gray-100 text-gray-700",
  };

  const avatarSrc = resolveAvatarSrc(profile.avatarUrl);

  const handlePick = () => fileRef.current?.click();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    // ── 1. เช็คประเภทไฟล์ ──
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถอัปโหลดได้",
        html: `ไฟล์ที่เลือกเป็นประเภท <b>${file.type || "ไม่ทราบประเภท"}</b><br/>` +
              `รองรับเฉพาะไฟล์รูปภาพ (${ALLOWED_EXT.join(", ")})`,
      });
      return;
    }

    // ── 2. เช็คนามสกุลไฟล์ ──
    const ext = getExt(file.name);
    if (ext && !ALLOWED_EXT.includes(ext)) {
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถอัปโหลดได้",
        html: `นามสกุลไฟล์ <b>.${ext}</b> ไม่รองรับ<br/>` +
              `รองรับเฉพาะ: ${ALLOWED_EXT.map(e => `.${e}`).join(", ")}`,
      });
      return;
    }

    // ── 3. เช็คขนาดไฟล์ ──
    if (file.size > MAX_AVATAR_BYTES) {
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถอัปโหลดได้",
        html: `ขนาดไฟล์ของคุณคือ <b>${formatBytes(file.size)}</b> ซึ่งเกินขนาดสูงสุดที่กำหนด<br/>` +
              `กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน <b>${MAX_AVATAR_LABEL}</b>`,
      });
      return;
    }

    // ── 4. ส่ง upload ──
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      await axios.post("/profile/me/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await onReload();
      Swal.fire({
        icon: "success",
        title: "อัปโหลดสำเร็จ",
        text: `${file.name} (${formatBytes(file.size)})`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;

      let title = "ไม่สามารถอัปโหลดได้";
      let text  = "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง";

      if (!err?.response) {
        // network / CORS / server ปิด
        title = "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้";
        text  = "ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือลองใหม่ภายหลัง";
      } else if (status === 401) {
        title = "หมดเซสชัน";
        text  = "กรุณาเข้าสู่ระบบใหม่อีกครั้ง";
      } else if (status === 413) {
        text = `ไฟล์ใหญ่เกินที่เซิร์ฟเวอร์รับ (สูงสุด ${MAX_AVATAR_LABEL})`;
      } else if (status && status >= 500) {
        text = serverMsg || `เซิร์ฟเวอร์ขัดข้อง (${status}) กรุณาลองใหม่`;
      } else if (serverMsg) {
        text = serverMsg;
      }

      Swal.fire({ icon: "error", title, text });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col items-center gap-5 xl:flex-row xl:items-center">
        <div className="relative">
          <div className="w-24 h-24 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <Image
              key={avatarSrc}
              width={96}
              height={96}
              src={avatarSrc}
              alt={profile.fullName || profile.username}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <button
            onClick={handlePick}
            disabled={uploading}
            title="เปลี่ยนรูปโปรไฟล์"
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 disabled:opacity-60"
          >
            {uploading ? (
              <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.823-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.823 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
              </svg>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        <div className="text-center xl:text-left">
          <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            {profile.fullName || profile.username}
          </h4>
          <div className="flex flex-col items-center gap-2 xl:flex-row xl:gap-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${role.color}`}>
              {role.label}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {profile.scopeLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
