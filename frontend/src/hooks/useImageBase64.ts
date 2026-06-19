import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/smart_village/api";

/** แปลง /uploads/xxx หรือ ./uploads/xxx → {API_BASE}/image/xxx */
export function toImageApiPath(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:")) return url;   // already base64
  if (url.startsWith("http")) return null;   // external URL — ใช้ตรงๆ ไม่ต้อง fetch
  const rel = url.replace(/^\.?\/uploads\//, "");
  return `${API_BASE}/image/${rel}`;
}

/**
 * ดึงรูปจาก /api/image/xxx แล้ว return เป็น base64 dataUrl
 *
 * ใช้งาน:
 *   const { src } = useImageBase64(user.avatarUrl, "/images/user/owner.jpg");
 *   <img src={src} />
 */
export function useImageBase64(
  imageUrl: string | null | undefined,
  placeholder = ""
) {
  const [src, setSrc] = useState<string>(placeholder);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setSrc(placeholder);
      return;
    }
    // external URL — แสดงตรงๆ ไม่ต้อง fetch
    if (imageUrl.startsWith("http")) {
      setSrc(imageUrl);
      return;
    }
    // already base64
    if (imageUrl.startsWith("data:")) {
      setSrc(imageUrl);
      return;
    }

    const apiPath = toImageApiPath(imageUrl);
    if (!apiPath) {
      setSrc(placeholder);
      return;
    }

    // ตัด API_BASE prefix ออก เพราะ axiosInstance มี baseURL อยู่แล้ว
    const relPath = apiPath.replace(API_BASE, "");

    let cancelled = false;
    setLoading(true);

    axiosInstance
      .get<{ dataUrl: string }>(relPath)
      .then((res) => {
        if (!cancelled) setSrc(res.data.dataUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc(placeholder);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, placeholder]);

  return { src, loading };
}
