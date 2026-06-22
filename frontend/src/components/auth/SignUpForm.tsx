"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !password || !confirmPassword) {
      Swal.fire({ icon: "warning", title: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      return;
    }
    if (password !== confirmPassword) {
      Swal.fire({ icon: "error", title: "รหัสผ่านไม่ตรงกัน" });
      return;
    }

    setLoadingSubmit(true);
    try {
      // ลงทะเบียนโดยผูกเข้ากับตำบลเป้าหมาย (tambon_id: 100101, amphur_id: 1001, province_id: 10) อัตโนมัติ
      await axiosInstance.post("/auth/register", {
        username,
        password,
        fullName,
        provinceId: 10,
        amphurId: 1001,
        tambonId: 100101,
      });

      await Swal.fire({
        icon: "success",
        title: "ลงทะเบียนสำเร็จ!",
        text: "คุณสามารถเข้าใช้งานระบบเพื่อชมข้อมูลตัวอย่างตำบลต้นแบบได้ทันที",
        timer: 2000,
        showConfirmButton: false,
      });
      router.push("/signin");
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "เกิดข้อผิดพลาดในการลงทะเบียน";
      Swal.fire({ icon: "error", title: "ลงทะเบียนไม่สำเร็จ", text: msg });
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar py-6">
      <div className="w-full max-w-md sm:pt-6 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          กลับหน้าเข้าสู่ระบบ (Sign In)
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              ลงทะเบียน (Sign Up)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              สร้างบัญชีผู้ใช้ระดับผู้นำท้องถิ่น (กำนัน) เพื่อเข้าเยี่ยมชมโปรเจกต์
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <Label>ชื่อ - นามสกุล <span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="กรอกชื่อและนามสกุลจริง"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                {/* Username */}
                <div>
                  <Label>ชื่อผู้ใช้ (Username) <span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="กรอกชื่อผู้ใช้สำหรับเข้าระบบ"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <Label>รหัสผ่าน (Password) <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      placeholder="กำหนดรหัสผ่านของคุณ"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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

                {/* Confirm Password */}
                <div>
                  <Label>ยืนยันรหัสผ่าน (Confirm Password) <span className="text-error-500">*</span></Label>
                  <Input
                    placeholder="กรอกรหัสผ่านอีกครั้งเพื่อยืนยัน"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loadingSubmit}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
                  >
                    {loadingSubmit ? "กำลังลงทะเบียน..." : "ลงทะเบียนเข้าชมระบบ"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                หากมีบัญชีอยู่แล้ว?{" "}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold"
                >
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
