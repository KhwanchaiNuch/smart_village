"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";
import Swal from "sweetalert2";

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "/auth/login",
        { username: identifier, password }
      );
      // clear ค่า session เก่าก่อนเสมอ (ป้องกัน village ของ user คนก่อนค้างอยู่)
      localStorage.removeItem("activeVillage");
      localStorage.removeItem("permissions");
      localStorage.setItem("token",    res.data.token);
      localStorage.setItem("role",     res.data.role);
      localStorage.setItem("scopeId",  String(res.data.scopeId ?? ""));
      localStorage.setItem("username", res.data.username ?? "");
      localStorage.setItem("fullName", res.data.fullName ?? "");
      // fetch permissions ทันที แล้วเก็บ cache ก่อน redirect
      try {
        const permRes = await axios.get(
          "/role-menus/my-permissions",
          { headers: { Authorization: `Bearer ${res.data.token}` } }
        );
        localStorage.setItem("permissions", JSON.stringify(permRes.data));
      } catch {
        localStorage.removeItem("permissions");
      }
      window.location.href = "/dashboard";
    } catch {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: "Email/Username หรือ Password ไม่ถูกต้อง",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/logo/smart-village-logo.png"
            alt="หมู่บ้านดิจิตอล"
            className="w-24 h-24 object-contain mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">หมู่บ้านดิจิตอล</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ระบบบริหารจัดการหมู่บ้านอัจฉริยะ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <Label>Username <span className="text-error-500">*</span></Label>
              <Input
                placeholder="กรอก Username"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <Label>Password <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอก Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>
            <Button className="w-full" size="sm" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </div>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ยังไม่มีบัญชีผู้ใช้?{" "}
            <Link
              href="/signup"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold"
            >
              ลงทะเบียนเข้าชมระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
