import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import type { Metadata, Viewport } from 'next';
import SwRegister from '@/components/common/SwRegister';

export const viewport: Viewport = {
  themeColor: '#166534',
};

export const metadata: Metadata = {
  title: 'หมู่บ้านดิจิตอล',
  description: 'ระบบบริหารข้อมูลครัวเรือน แผนที่ชุมชน การเยี่ยมบ้าน การอบรม และรายงานสำหรับหน่วยงานท้องถิ่น',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'หมู่บ้านดิจิตอล',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="font-prompt dark:bg-gray-900">
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
        <SwRegister />
      </body>
    </html>
  );
}
