"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "@/lib/axios";

export interface ActiveVillage {
  villageId: number;
  villageName: string;
  moo: string | null;
}

interface VillageContextType {
  village: ActiveVillage | null;
  loaded: boolean;
  setVillage: (v: ActiveVillage | null) => void;
}

const VillageContext = createContext<VillageContextType | undefined>(undefined);

export const useVillage = () => {
  const ctx = useContext(VillageContext);
  if (!ctx) throw new Error("useVillage must be used within VillageProvider");
  return ctx;
};

export const VillageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [village, setVillageState] = useState<ActiveVillage | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const role    = localStorage.getItem("role");
    const scopeId = localStorage.getItem("scopeId");

    // PROVINCE / AMPHUR / TAMBON → restore activeVillage จาก localStorage ถ้ามี
    const higherRoles = ["PROVINCE", "AMPHUR", "TAMBON"];
    if (role && higherRoles.includes(role)) {
      const raw = localStorage.getItem("activeVillage");
      if (raw) {
        try { setVillageState(JSON.parse(raw)); } catch { /* ignore */ }
      }
      setLoaded(true);
      return;
    }

    // 1. ลอง restore จาก localStorage (ADMIN หรือ VILLAGE)
    const raw = localStorage.getItem("activeVillage");
    if (raw) {
      try {
        const stored: ActiveVillage = JSON.parse(raw);
        // VILLAGE: ใช้ cache ได้เฉพาะเมื่อ villageId ตรงกับ scopeId ของตัวเอง
        // ADMIN: ใช้ cache ได้เสมอ
        if (role === "ADMIN" || !scopeId || stored.villageId === Number(scopeId)) {
          setVillageState(stored);
          setLoaded(true);
          return;
        }
        localStorage.removeItem("activeVillage");
      } catch { /* ignore */ }
    }

    // 2. Auto-init: VILLAGE role → fetch village จาก scopeId อัตโนมัติ
    if (role === "VILLAGE" && scopeId) {
      axios
        .get<{ villageId: number; villageName: string; moo?: string }>(`/villages/ensure/${scopeId}`)
        .then((res) => {
          const v: ActiveVillage = {
            villageId:   res.data.villageId,
            villageName: res.data.villageName,
            moo:         res.data.moo ?? null,
          };
          setVillageState(v);
          localStorage.setItem("activeVillage", JSON.stringify(v));
        })
        .catch(() => {})
        .finally(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  }, []);

  const setVillage = (v: ActiveVillage | null) => {
    setVillageState(v);
    if (v) localStorage.setItem("activeVillage", JSON.stringify(v));
    else    localStorage.removeItem("activeVillage");
  };

  return (
    <VillageContext.Provider value={{ village, loaded, setVillage }}>
      {children}
    </VillageContext.Provider>
  );
};
