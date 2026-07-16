import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | หมู่บ้านดิจิตอล",
  description: "เข้าสู่ระบบหมู่บ้านดิจิตอล ระบบบริหารข้อมูลชุมชนสำหรับผู้นำหมู่บ้านและองค์กรปกครองส่วนท้องถิ่น",
};

export default function SignIn() {
  return <SignInForm />;
}
