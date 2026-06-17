"use client"
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { useEffect } from "react";
import { useCurrentUser } from "@/context/CurrentUserContext";

export default function Profile() {
  const { user, loading, reload } = useCurrentUser();

  useEffect(() => {
    document.title = "Smart Village | โปรไฟล์ของฉัน";
  }, []);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          โปรไฟล์ของฉัน
        </h3>
        {user ? (
          <div className="space-y-6">
            <UserMetaCard profile={user} onReload={reload} />
            <UserInfoCard profile={user} onReload={reload} />
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? "กำลังโหลด..." : "ไม่พบข้อมูลผู้ใช้"}
          </p>
        )}
      </div>
    </div>
  );
}
