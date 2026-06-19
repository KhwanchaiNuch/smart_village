"use client";
import { useImageBase64 } from "@/hooks/useImageBase64";

interface Props {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  placeholder?: string;
  onClick?: () => void;
}

/**
 * แสดงรูปภาพจาก /uploads/xxx โดยดึงผ่าน /api/image/ เป็น base64
 * ใช้แทน <img src={imgUrl(...)} /> ทุกที่
 */
export default function Base64Image({ src, alt = "", className = "", placeholder = "", onClick }: Props) {
  const { src: dataUrl, loading } = useImageBase64(src, placeholder);

  if (loading) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`} />
    );
  }

  if (!dataUrl) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  );
}
