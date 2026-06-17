"use client"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "@/lib/axios";

export interface CurrentUser {
  userId: number;
  username: string;
  fullName: string | null;
  roleLevel: string;
  scopeId: number | null;
  scopeLabel: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string | null;
}

interface CurrentUserContextType {
  user: CurrentUser | null;
  loading: boolean;
  reload: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

export const useCurrentUser = () => {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
};

export const CurrentUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get<CurrentUser>("/profile/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <CurrentUserContext.Provider value={{ user, loading, reload }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

// ── helper: แปลง avatarUrl เป็น absolute URL (path → full url) ──
const API_BASE_HOST = (process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080") + "/smart_village";
export function resolveAvatarSrc(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) return "/images/user/owner.jpg";
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return API_BASE_HOST + avatarUrl;
}
