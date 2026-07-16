import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "สมัครใช้งาน | หมู่บ้านดิจิตอล",
  description: "ขอชมระบบหมู่บ้านดิจิตอล สมัครเพื่อทดลองใช้งานสำหรับผู้นำหมู่บ้านและองค์กรปกครองส่วนท้องถิ่น",
};

export default function SignUp() {
  return <SignUpForm />;
}
