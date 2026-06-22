import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import type { Metadata, Viewport } from 'next';
import SwRegister from '@/components/common/SwRegister';

const outfit = Outfit({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#3b82f6',
};

export const metadata: Metadata = {
  title: 'Smart Village',
  description: 'ระบบจัดการข้อมูลหมู่บ้านอัจฉริยะ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart Village',
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
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
        <SwRegister />
      </body>
    </html>
  );
}
