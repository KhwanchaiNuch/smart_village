"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectClient({ id }: { id: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/manageusers/edit?id=${id}`);
  }, [id, router]);
  return null;
}
