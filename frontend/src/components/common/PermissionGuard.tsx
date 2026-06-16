"use client";

import { usePermission } from "@/context/PermissionContext";

interface PermissionGuardProps {
  menuUrl: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ menuUrl, children }: PermissionGuardProps) {
  const { canView, loading } = usePermission();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
          <svg className="animate-spin w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (!canView(menuUrl)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          {/* Shield icon */}
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
              className="w-10 h-10 text-red-400 dark:text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">ไม่มีสิทธิ์เข้าถึง</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              คุณไม่มีสิทธิ์ดูหน้านี้ กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เพิ่มเติม
            </p>
          </div>

          <div className="mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-400 dark:text-gray-500">
            {menuUrl}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
